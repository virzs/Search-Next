import { DefaultAppView } from "@/components";
import { useRequest } from "ahooks";
import { Button, Image } from "antd";
import { FC, useEffect, useMemo, useRef } from "react";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getActiveThemeConfigs,
  getThemePreviewImageUrl,
  ThemeConfigApiItem,
} from "@/services/desktop";
import { useLocation, useNavigate, useParams } from "react-router";
import { personalizationRoute } from "../route-paths";
import { ThemeDesktopPreview } from "./theme-preview";
import { useI18n } from "@/i18n";

const ThemeDetailView: FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const themeId = params.id ? decodeURIComponent(String(params.id)) : "";
  const { activeThemeId, setActiveThemeId } = useDesktopTheme();
  const stateTheme = (location.state as any)?.theme ?? null;
  const themeRef = useRef<ThemeConfigApiItem | null>(stateTheme);
  if (!themeRef.current && stateTheme) themeRef.current = stateTheme;

  const { data: themes, loading } = useRequest(getActiveThemeConfigs);

  const theme = useMemo(() => {
    if (themeRef.current && themeRef.current._id === themeId)
      return themeRef.current;
    return (themes ?? []).find((t) => t._id === themeId) ?? null;
  }, [themes, themeId]);

  useEffect(() => {
    if (!themeId) navigate(personalizationRoute.path.root, { replace: true });
  }, [navigate, themeId]);

  useEffect(() => {
    if (loading) return;
    if (themeId && !theme) navigate(personalizationRoute.path.root, { replace: true });
  }, [loading, navigate, theme, themeId]);

  if (!theme) return null;

  const active = theme._id === activeThemeId;
  const previewUrls = (theme.previewImages ?? [])
    .map((_, i) => getThemePreviewImageUrl(theme, i))
    .filter((v): v is string => Boolean(v));
  const coverUrl = previewUrls[0] ?? null;

  return (
    <DefaultAppView
      className="h-full"
      animate
      title={theme.name}
      headerRight={
        <Button
          type="primary"
          shape="round"
          disabled={active}
          onClick={() => setActiveThemeId(theme._id)}
        >
          {active ? t("ui.applied") : t("ui.applyToDesktop")}
        </Button>
      }
    >
      {theme.description ? (
        <div className="text-sm text-gray-600 mt-2 mb-6">
          {theme.description}
        </div>
      ) : null}
      <div
        className="w-full aspect-video rounded-3xl border overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.18)",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        {coverUrl ? (
          <Image className="w-full! h-full! object-cover" src={coverUrl} />
        ) : (
          <ThemeDesktopPreview theme={theme} draggable />
        )}
      </div>

      {previewUrls.length > 1 ? (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {previewUrls.slice(1, 9).map((url) => (
            <Image
              key={url}
              className="w-full! h-20! rounded-2xl object-cover border"
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
              src={url}
              preview={false}
            />
          ))}
        </div>
      ) : null}
    </DefaultAppView>
  );
};

export default ThemeDetailView;
