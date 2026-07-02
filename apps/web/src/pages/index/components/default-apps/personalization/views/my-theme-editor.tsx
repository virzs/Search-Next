import { DefaultAppView } from "@/components";
import { App, Button, Card, ColorPicker, Form, Input, Space } from "antd";
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
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";

const themeEditorClassName = css`
  .apple-theme-action.ant-btn-primary:not(:disabled) {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;

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
  const [items, setItems] = useState<MyThemeItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [lightBackground, setLightBackground] = useState("#ffffff");
  const [darkBackground, setDarkBackground] = useState("#2f3035");
  const [accentColor, setAccentColor] = useState("#007aff");
  const [form] = Form.useForm<{ name: string; description?: string }>();
  const watchedName = Form.useWatch("name", form);
  const watchedDescription = Form.useWatch("description", form);

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
    setAccentColor(currentItem.accentColor);
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
    () => toMyThemeConfig(previewTheme),
    [previewTheme],
  );

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
      className={`h-full ${themeEditorClassName}`}
      animate
      title={isEdit ? t("ui.editTheme") : t("ui.createTheme")}
      headerRight={
        <Space size={8}>
          {isEdit ? (
            <Button danger onClick={handleDelete}>
              {t("ui.delete")}
            </Button>
          ) : null}
          <Button onClick={handleSave}>{t("ui.save")}</Button>
          <Button
            type="primary"
            shape="round"
            className="apple-theme-action"
            onClick={handleSaveAndApply}
          >
            {t("ui.saveAndApply")}
          </Button>
        </Space>
      }
      contentClassName="px-4 pb-8 pt-4"
    >
      <div className="grid grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)] gap-4 max-[760px]:grid-cols-1">
        <Card
          className="rounded-[16px]"
          styles={{ body: { padding: 16 } }}
          style={{
            background: "rgba(255,255,255,0.9)",
            borderColor: "rgba(255,255,255,0.82)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 44px rgba(15,23,42,0.06)",
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label={t("ui.name")}
              rules={[{ required: true, message: t("ui.enterAName") }]}
            >
              <Input placeholder={t("ui.exampleMyFocusTheme")} />
            </Form.Item>
            <Form.Item name="description" label={t("ui.description")}>
              <Input placeholder={t("ui.theme.descriptionPlaceholder")} />
            </Form.Item>
          </Form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-medium">{t("ui.lightBackground")}</div>
              <ColorPicker
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
              <div className="mb-2 text-sm font-medium">{t("ui.darkBackground")}</div>
              <ColorPicker
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

          <div className="mt-4">
            <div className="mb-2 text-sm font-medium">{t("ui.accentColor")}</div>
            <ColorPicker
              value={accentColor}
              onChange={(color, hex) => setAccentColor(colorToHex(color, hex))}
              showText
              format="hex"
              getPopupContainer={() => document.body}
              styles={{ popup: { root: { zIndex: 6000 } } }}
            />
          </div>
        </Card>

        <div>
          <div className="mb-2 ml-1 text-[13px] font-extrabold text-[#6e6e73]">
            {t("ui.livePreview")}
          </div>
          <div className="aspect-video overflow-hidden rounded-[18px] border border-white/80 bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_44px_rgba(15,23,42,0.06)]">
            <ThemeDesktopPreview theme={previewConfig} draggable />
          </div>
          <div className="mt-3 rounded-[16px] border border-white/80 bg-white/80 p-3 text-xs leading-5 text-[#6e6e73] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            {t("ui.theme.localSaveHint")}
          </div>
        </div>
      </div>
    </DefaultAppView>
  );
};

export default ThemeMyThemeEditorView;
