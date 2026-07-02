import { AppSegmented, DefaultAppView } from "@/components";
import { useEffect, useMemo, useState } from "react";
import { App, Button, Card, ColorPicker, Form, Input, Slider, Space } from "antd";
import { useNavigate, useParams } from "react-router";
import { v4 as uuidv4 } from "uuid";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import { personalizationRoute } from "../route-paths";
import {
  readMyWallpapers,
  writeMyWallpapers,
  type MyWallpaperItem,
} from "../my-assets";
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";

const wallpaperEditorClassName = css`
  .apple-theme-action.ant-btn-primary:not(:disabled) {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;

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
  const [form] = Form.useForm<{ name: string; url?: string }>();
  const watchedName = Form.useWatch("name", form);
  const watchedUrl = Form.useWatch("url", form);

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
          className="w-full aspect-video rounded-2xl border overflow-hidden"
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
        className="w-full aspect-video rounded-2xl border overflow-hidden"
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
      className={`h-full ${wallpaperEditorClassName}`}
      animate
      title={isEdit ? t("ui.editWallpaper") : t("ui.addWallpaper")}
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
            disabled={!isEdit || !isReadyToApply || isDirty || applied}
            className="apple-theme-action"
            onClick={handleApply}
          >
            {applied ? t("ui.applied") : t("action.apply")}
          </Button>
        </Space>
      }
      contentClassName="px-4 pb-8 pt-4"
    >
      <Card
        className="rounded-[20px]"
        styles={{ body: { padding: 16 } }}
        style={{
          background: "rgba(255,255,255,0.9)",
          borderColor: "rgba(255,255,255,0.82)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), 0 18px 44px rgba(15,23,42,0.06)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">{t("ui.type")}</div>
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
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label={t("ui.name")}
              rules={[{ required: true, message: t("ui.enterAName") }]}
            >
              <Input placeholder={t("ui.exampleMyAurora")} />
            </Form.Item>

            {type === "gradient" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm mb-2">{t("ui.startColor")}</div>
                    <ColorPicker
                      value={gradientStart}
                      onChange={(color, hex) => setGradientStart(colorToHex(color, hex))}
                      showText
                      format="hex"
                      getPopupContainer={() => document.body}
                      styles={{ popup: { root: { zIndex: 6000 } } }}
                    />
                  </div>
                  <div>
                    <div className="text-sm mb-2">{t("ui.endColor")}</div>
                    <ColorPicker
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
                  <div className="text-sm mb-2">{t("ui.angle")}</div>
                  <Slider
                    min={0}
                    max={360}
                    value={gradientAngle}
                    onChange={(v) => setGradientAngle(Number(v))}
                  />
                </div>
              </>
            ) : (
              <Form.Item
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
                <Input placeholder="https://..." />
              </Form.Item>
            )}
          </Form>
        </div>

        <div className="mt-4">{previewNode}</div>
      </Card>
    </DefaultAppView>
  );
};

export default ThemeMyEditorView;
