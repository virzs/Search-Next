import { AppSegmented, DefaultAppView } from "@/components";
import {
  AppButton,
  AppColorPicker,
  AppForm,
  AppInput,
} from "@/components/ui";
import { App, Card, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { v4 as uuidv4 } from "uuid";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import { personalizationRoute } from "../route-paths";
import { ThemeDesktopPreview } from "./theme-preview";
import {
  readMyThemes,
  toMyThemeConfig,
  writeMyThemes,
  type MyThemeItem,
} from "../my-assets";
import { useI18n } from "@/i18n";
import { useConfig } from "@/hooks/useConfig";
import { DEFAULT_THEME_COLOR } from "@/theme/color";

const colorToHex = (color: any, hex?: string) => {
  if (typeof hex === "string" && hex) return hex;
  if (color && typeof color.toHexString === "function") return color.toHexString();
  return String(color ?? "");
};

const getThemeOverlayContainer = () =>
  document.querySelector<HTMLElement>(".base-modal-panel") ?? document.body;

const ThemeMyThemeEditorView = () => {
  const { t } = useI18n();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const params = useParams();
  const editId = params.id ? decodeURIComponent(String(params.id)) : null;
  const isEdit = Boolean(editId);
  const { activeThemeId, setActiveThemeId } = useDesktopTheme();
  const { projectInfo } = useConfig();
  const accentColor = projectInfo?.site?.themeColor || DEFAULT_THEME_COLOR;
  const [items, setItems] = useState<MyThemeItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lightBackground, setLightBackground] = useState("#ffffff");
  const [darkBackground, setDarkBackground] = useState("#2f3035");
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [form] = AppForm.useForm<{ name: string; description?: string }>();
  const watchedName = AppForm.useWatch("name", form);
  const watchedDescription = AppForm.useWatch("description", form);

  useEffect(() => {
    try {
      setItems(readMyThemes());
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  const currentItem = useMemo(() => {
    if (!editId) return null;
    return items.find((item) => item.id === editId) ?? null;
  }, [editId, items]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isEdit) return;
    if (!currentItem) navigate(personalizationRoute.path.my, { replace: true });
  }, [currentItem, hydrated, isEdit, navigate]);

  useEffect(() => {
    if (!currentItem) return;
    (form as any).setFieldsValue({
      name: currentItem.name,
      description: currentItem.description,
    });
    setLightBackground(currentItem.lightBackground);
    setDarkBackground(currentItem.darkBackground);
  }, [currentItem, form]);

  const previewTheme = useMemo<MyThemeItem>(() => {
    return {
      id: currentItem?.id ?? "preview",
      name: String(watchedName ?? "").trim() || t("ui.customTheme"),
      description: String(watchedDescription ?? "").trim() || t("ui.customTheme"),
      lightBackground,
      darkBackground,
      accentColor,
      createdAt: currentItem?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    accentColor,
    currentItem?.createdAt,
    currentItem?.id,
    darkBackground,
    lightBackground,
    t,
    watchedDescription,
    watchedName,
  ]);

  const previewConfig = useMemo(
    () => toMyThemeConfig(previewTheme, accentColor),
    [accentColor, previewTheme],
  );

  const visiblePreviewConfig = useMemo(() => {
    if (previewMode === "light" || !previewConfig.darkConfig) {
      return { ...previewConfig, darkConfig: undefined };
    }
    return {
      ...previewConfig,
      lightConfig: previewConfig.darkConfig,
      darkConfig: undefined,
    };
  }, [previewConfig, previewMode]);

  const persist = (nextItems: MyThemeItem[]) => {
    setItems(nextItems);
    writeMyThemes(nextItems);
  };

  const buildNextItem = async () => {
    const values = await (form as any).validateFields();
    const name = String(values.name ?? "").trim();
    if (!name) return null;
    const now = new Date().toISOString();

    if (isEdit && currentItem) {
      return {
        ...currentItem,
        name,
        description: String(values.description ?? "").trim() || undefined,
        lightBackground,
        darkBackground,
        accentColor,
        updatedAt: now,
      };
    }

    return {
      id: `my-theme-${uuidv4()}`,
      name,
      description: String(values.description ?? "").trim() || undefined,
      lightBackground,
      darkBackground,
      accentColor,
      createdAt: now,
      updatedAt: now,
    };
  };

  const handleSave = async () => {
    try {
      const nextItem = await buildNextItem();
      if (!nextItem) return null;
      const nextItems =
        isEdit && currentItem
          ? items.map((item) => (item.id === currentItem.id ? nextItem : item))
          : [nextItem, ...items];
      persist(nextItems);
      message.success(t("ui.saved"));
      navigate(personalizationRoute.path.my, { replace: true });
      return nextItem;
    } catch {
      return null;
    }
  };

  const handleSaveAndApply = async () => {
    const nextItem = await handleSave();
    if (!nextItem) return;
    setActiveThemeId(nextItem.id);
  };

  const handleDelete = () => {
    if (!currentItem) return;
    modal.confirm({
      title: t("ui.deleteThisTheme"),
      content: t("ui.theme.deleteWarning"),
      okText: t("ui.delete"),
      okButtonProps: { danger: true },
      cancelText: t("ui.cancel"),
      getContainer: getThemeOverlayContainer,
      onOk: () => {
        persist(items.filter((item) => item.id !== currentItem.id));
        if (activeThemeId === currentItem.id) setActiveThemeId("light");
        navigate(personalizationRoute.path.my, { replace: true });
      },
    });
  };

  return (
    <DefaultAppView
      className="h-full"
      animate
      title={isEdit ? t("ui.editTheme") : t("ui.createTheme")}
      headerRight={
        <Space size={8}>
          {isEdit ? (
            <AppButton
              intent="secondary"
              danger
              size="default"
              onClick={handleDelete}
            >
              {t("ui.delete")}
            </AppButton>
          ) : null}
          <AppButton
            intent="secondary"
            size="default"
            onClick={handleSave}
          >
            {t("ui.save")}
          </AppButton>
          <AppButton
            intent="primary"
            size="default"
            onClick={handleSaveAndApply}
          >
            {t("ui.saveAndApply")}
          </AppButton>
        </Space>
      }
      contentClassName="px-4 pb-8 pt-4"
    >
      <div className="grid grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] gap-6 max-[760px]:grid-cols-1">
        <Card
          className="rounded-[var(--sn-radius-surface)] border-[var(--sn-separator)]! bg-[var(--sn-surface)]! shadow-[var(--sn-shadow)]!"
          styles={{ body: { padding: 16 } }}
        >
          <section>
            <h2 className="mb-3 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
              {t("ui.basicInformation")}
            </h2>
          <AppForm form={form} layout="vertical">
            <AppForm.Item
              name="name"
              label={t("ui.name")}
              rules={[{ required: true, message: t("ui.enterAName") }]}
            >
              <AppInput placeholder={t("ui.exampleMyFocusTheme")} />
            </AppForm.Item>
            <AppForm.Item name="description" label={t("ui.description")}>
              <AppInput placeholder={t("ui.theme.descriptionPlaceholder")} />
            </AppForm.Item>
          </AppForm>
          </section>

          <section className="mt-5 border-t border-[var(--sn-separator)] pt-5">
          <h2 className="mb-3 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
            {t("ui.colors")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">{t("ui.lightBackground")}</div>
              <AppColorPicker
                value={lightBackground}
                onChange={(color, hex) =>
                  setLightBackground(colorToHex(color, hex))
                }
                showText
                format="hex"
                getPopupContainer={() => document.body}
                styles={{ popup: { root: { zIndex: 6000 } } }}
              />
            </div>
            <div>
              <div className="mb-2 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">{t("ui.darkBackground")}</div>
              <AppColorPicker
                value={darkBackground}
                onChange={(color, hex) =>
                  setDarkBackground(colorToHex(color, hex))
                }
                showText
                format="hex"
                getPopupContainer={() => document.body}
                styles={{ popup: { root: { zIndex: 6000 } } }}
              />
            </div>
          </div>

          <div className="mt-4 rounded-[var(--sn-radius-control)] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)] p-3">
            <div className="text-[13px] font-medium leading-5 text-[var(--sn-text)]">
              {t("ui.accentColor")}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
              <span
                className="h-3 w-3 shrink-0 rounded-[var(--sn-radius-round)] bg-[var(--sn-accent)]"
                aria-hidden="true"
              />
              {t("ui.accentColorManaged")}
            </div>
          </div>
          </section>
        </Card>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
                {t("ui.livePreview")}
              </h2>
              <div className="mt-1 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
                {t("ui.previewAppearance")}
              </div>
            </div>
            <AppSegmented
              size="small"
              value={previewMode}
              onChange={(value) => setPreviewMode(value as "light" | "dark")}
              options={[
                { label: t("ui.light"), value: "light" },
                { label: t("ui.dark"), value: "dark" },
              ]}
            />
          </div>
          <div className="aspect-video overflow-hidden rounded-[var(--sn-radius-surface)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] shadow-[var(--sn-shadow)]">
            <ThemeDesktopPreview theme={visiblePreviewConfig} />
          </div>
          <div className="mt-3 rounded-[var(--sn-radius-control)] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)] p-3 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
            {t("ui.theme.localSaveHint")}
          </div>
        </div>
      </div>
    </DefaultAppView>
  );
};

export default ThemeMyThemeEditorView;
