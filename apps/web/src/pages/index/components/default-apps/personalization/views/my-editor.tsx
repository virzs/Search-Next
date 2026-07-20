import { AppSegmented, DefaultAppView } from "@/components";
import { useEffect, useMemo, useState } from "react";
import {
  AppButton,
  AppColorPicker,
  AppForm,
  AppInput,
  AppSlider,
} from "@/components/ui";
import { App, Card, Space } from "antd";
import { useNavigate, useParams } from "react-router";
import { v4 as uuidv4 } from "uuid";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import { personalizationRoute } from "../route-paths";
import {
  readMyWallpapers,
  writeMyWallpapers,
  type MyWallpaperItem,
} from "../my-assets";
import { useI18n } from "@/i18n";

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "data:";
  } catch {
    return false;
  }
};

const buildLinearGradient = (angle: number, start: string, end: string) => {
  const safeAngle = Number.isFinite(angle) ? Math.max(0, Math.min(360, angle)) : 135;
  return `linear-gradient(${safeAngle}deg, ${start} 0%, ${end} 100%)`;
};

const extractColors = (css: string) => {
  const matches = css.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g) ?? [];
  return matches.slice(0, 2);
};

const extractAngle = (css: string) => {
  const m = css.match(/(-?\d+(\.\d+)?)deg/);
  if (!m) return null;
  const v = Number(m[1]);
  if (!Number.isFinite(v)) return null;
  return v;
};

const colorToHex = (color: any, hex?: string) => {
  if (typeof hex === "string" && hex) return hex;
  if (color && typeof color.toHexString === "function") return color.toHexString();
  return String(color ?? "");
};

const getThemeOverlayContainer = () =>
  document.querySelector<HTMLElement>(".base-modal-panel") ?? document.body;

const ThemeMyEditorView = () => {
  const { t } = useI18n();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const params = useParams();
  const editId = params.id ? decodeURIComponent(String(params.id)) : null;
  const isEdit = Boolean(editId);
  const { personalization, setWallpaper } = useDesktopTheme();

  const [items, setItems] = useState<MyWallpaperItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [type, setType] = useState<"gradient" | "image">("gradient");
  const [form] = AppForm.useForm<{ name: string; url?: string }>();
  const watchedName = AppForm.useWatch("name", form);
  const watchedUrl = AppForm.useWatch("url", form);

  const [gradientStart, setGradientStart] = useState("#1677ff");
  const [gradientEnd, setGradientEnd] = useState("#fa541c");
  const [gradientAngle, setGradientAngle] = useState(135);

  useEffect(() => {
    try {
      setItems(readMyWallpapers());
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  const currentItem = useMemo(() => {
    if (!editId) return null;
    return items.find((i) => i.id === editId) ?? null;
  }, [editId, items]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isEdit) return;
    if (!currentItem) navigate(personalizationRoute.path.my, { replace: true });
  }, [currentItem, hydrated, isEdit, navigate]);

  useEffect(() => {
    if (!currentItem) return;
    setType(currentItem.type);
    (form as any).setFieldsValue({
      name: currentItem.name,
      url: currentItem.type === "image" ? currentItem.url : undefined,
    });

    if (currentItem.type === "gradient") {
      const colors = extractColors(currentItem.css);
      const angle = extractAngle(currentItem.css);
      if (colors[0]) setGradientStart(colors[0]);
      if (colors[1]) setGradientEnd(colors[1]);
      if (angle != null) setGradientAngle(angle);
    }
  }, [currentItem, form]);

  const gradientCss = useMemo(() => {
    return buildLinearGradient(gradientAngle, gradientStart, gradientEnd);
  }, [gradientAngle, gradientEnd, gradientStart]);

  const persist = (nextItems: MyWallpaperItem[]) => {
    setItems(nextItems);
    writeMyWallpapers(nextItems);
  };

  const isReadyToApply = useMemo(() => {
    const name = String(watchedName ?? "").trim();
    if (!name) return false;
    if (type === "image") {
      const url = String(watchedUrl ?? "").trim();
      return isValidUrl(url);
    }
    return true;
  }, [type, watchedName, watchedUrl]);

  const isDirty = useMemo(() => {
    if (!isEdit) return true;
    if (!currentItem) return false;

    const name = String(watchedName ?? "").trim();
    const currentName = String(currentItem.name ?? "").trim();

    if (type !== currentItem.type) return true;

    if (currentItem.type === "gradient") {
      return name !== currentName || gradientCss !== currentItem.css;
    }

    const url = String(watchedUrl ?? "").trim();
    return name !== currentName || url !== currentItem.url;
  }, [currentItem, gradientCss, isEdit, type, watchedName, watchedUrl]);

  const applied = useMemo(() => {
    const wallpaper = personalization.wallpaper;
    if (type === "gradient") {
      return wallpaper.type === "gradient" && wallpaper.css === gradientCss;
    }
    const url = String(watchedUrl ?? "").trim();
    return wallpaper.type === "image" && wallpaper.url === url;
  }, [gradientCss, personalization.wallpaper, type, watchedUrl]);

  const handleSave = async () => {
    try {
      const values = await (form as any).validateFields();
      const name = String(values.name ?? "").trim();
      if (!name) return;

      if (type === "image") {
        const url = String(values.url ?? "").trim();
        if (!isValidUrl(url)) {
          message.error(t("ui.enterAValidImageURLHttpHttpData"));
          return;
        }
        if (isEdit && currentItem) {
          const next: MyWallpaperItem = {
            ...currentItem,
            type: "image",
            name,
            url,
          };
          persist(items.map((i) => (i.id === currentItem.id ? next : i)));
        } else {
          const createdAt = new Date().toISOString();
          const next: MyWallpaperItem = { id: uuidv4(), type: "image", name, url, createdAt };
          persist([next, ...items]);
        }
      } else {
        const css = gradientCss;
        if (isEdit && currentItem) {
          const next: MyWallpaperItem = {
            ...currentItem,
            type: "gradient",
            name,
            css,
          };
          persist(items.map((i) => (i.id === currentItem.id ? next : i)));
        } else {
          const createdAt = new Date().toISOString();
          const next: MyWallpaperItem = { id: uuidv4(), type: "gradient", name, css, createdAt };
          persist([next, ...items]);
        }
      }

      message.success(t("ui.saved"));
      navigate(personalizationRoute.path.my, { replace: true });
    } catch {
      void 0;
    }
  };

  const handleApply = async () => {
    try {
      const values = await (form as any).validateFields();
      const name = String(values.name ?? "").trim();
      if (!name) return;

      if (type === "gradient") {
        setWallpaper({ type: "gradient", css: gradientCss, name });
        return;
      }

      const url = String(values.url ?? "").trim();
      if (!isValidUrl(url)) {
        message.error(t("ui.enterAValidImageURLHttpHttpData"));
        return;
      }
      setWallpaper({ type: "image", url, name });
    } catch {
      void 0;
    }
  };

  const handleDelete = () => {
    if (!currentItem) return;
    const restoreDefault = () => setWallpaper({ type: "none", name: "None" });
    modal.confirm({
      title: t("ui.deleteThisItem"),
      content: t("ui.thisCannotBeUndone"),
      okText: t("ui.delete"),
      okButtonProps: { danger: true },
      cancelText: t("ui.cancel"),
      getContainer: getThemeOverlayContainer,
      onOk: () => {
        const wallpaper = personalization.wallpaper;
        if (currentItem.type === "gradient") {
          if (
            wallpaper.type === "gradient" &&
            wallpaper.css === currentItem.css
          ) {
            restoreDefault();
          }
        } else {
          if (wallpaper.type === "image" && wallpaper.url === currentItem.url) {
            restoreDefault();
          }
        }

        persist(items.filter((i) => i.id !== currentItem.id));
        navigate(personalizationRoute.path.my, { replace: true });
      },
    });
  };

  const previewNode = (() => {
    if (type === "gradient") {
      return (
        <div
          className="aspect-video w-full overflow-hidden rounded-[var(--sn-radius-surface)] border"
          style={{
            background: gradientCss,
            borderColor: "rgba(0,0,0,0.08)",
          }}
        />
      );
    }

    const url = String(watchedUrl ?? "").trim();
    const safeUrl = url.replace(/"/g, '\\"');
    return (
      <div
        className="aspect-video w-full overflow-hidden rounded-[var(--sn-radius-surface)] border"
        style={{
          borderColor: "rgba(0,0,0,0.08)",
          backgroundColor: "rgba(0,0,0,0.06)",
          backgroundImage: url ? `url("${safeUrl}")` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  })();

  return (
    <DefaultAppView
      className="h-full"
      animate
      title={isEdit ? t("ui.editWallpaper") : t("ui.addWallpaper")}
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
            disabled={!isEdit || !isReadyToApply || isDirty || applied}
            onClick={handleApply}
          >
            {applied ? t("ui.applied") : t("action.apply")}
          </AppButton>
        </Space>
      }
      contentClassName="px-4 pb-8 pt-4"
    >
      <Card
        className="rounded-[var(--sn-radius-surface)] border-[var(--sn-separator)]! bg-[var(--sn-surface)]! shadow-[var(--sn-shadow)]!"
        styles={{ body: { padding: 16 } }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">{t("ui.type")}</div>
          <AppSegmented
            value={type}
            disabled={isEdit}
            onChange={(v) => setType(v as any)}
            options={[
              { label: t("ui.gradient"), value: "gradient" },
              { label: t("ui.image"), value: "image" },
            ]}
          />
        </div>

        <div className="mt-4">
          <AppForm form={form} layout="vertical">
            <AppForm.Item
              name="name"
              label={t("ui.name")}
              rules={[{ required: true, message: t("ui.enterAName") }]}
            >
              <AppInput placeholder={t("ui.exampleMyAurora")} />
            </AppForm.Item>

            {type === "gradient" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="mb-2 text-[13px] leading-5 text-[var(--sn-text-secondary)]">{t("ui.startColor")}</div>
                    <AppColorPicker
                      value={gradientStart}
                      onChange={(color, hex) => setGradientStart(colorToHex(color, hex))}
                      showText
                      format="hex"
                      getPopupContainer={() => document.body}
                      styles={{ popup: { root: { zIndex: 6000 } } }}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-[13px] leading-5 text-[var(--sn-text-secondary)]">{t("ui.endColor")}</div>
                    <AppColorPicker
                      value={gradientEnd}
                      onChange={(color, hex) => setGradientEnd(colorToHex(color, hex))}
                      showText
                      format="hex"
                      getPopupContainer={() => document.body}
                      styles={{ popup: { root: { zIndex: 6000 } } }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-[13px] leading-5 text-[var(--sn-text-secondary)]">{t("ui.angle")}</div>
                  <AppSlider
                    min={0}
                    max={360}
                    value={gradientAngle}
                    onChange={(v) => setGradientAngle(Number(v))}
                  />
                </div>
              </>
            ) : (
              <AppForm.Item
                name="url"
                label={t("ui.imageURL")}
                rules={[
                  { required: true, message: t("ui.enterAnImageURL") },
                  {
                    validator: async (_, value) => {
                      if (!value) return;
                      if (!isValidUrl(String(value))) {
                        throw new Error(t("ui.enterAValidImageURLHttpHttpData"));
                      }
                    },
                  },
                ]}
              >
                <AppInput placeholder="https://..." />
              </AppForm.Item>
            )}
          </AppForm>
        </div>

        <div className="mt-4">{previewNode}</div>
      </Card>
    </DefaultAppView>
  );
};

export default ThemeMyEditorView;
