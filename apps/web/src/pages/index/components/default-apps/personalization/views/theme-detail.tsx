import { DefaultAppView } from "@/components";
import { AppButton } from "@/components/ui";
import { useRequest } from "ahooks";
import { Image } from "antd";
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
        <AppButton
          intent="primary"
          size="default"
          disabled={active}
          onClick={() => setActiveThemeId(theme._id)}
        >
          {active ? t("ui.applied") : t("ui.applyToDesktop")}
        </AppButton>
      }
    >
      {theme.description ? (
        <div className="mb-6 mt-2 text-[13px] leading-5 text-[var(--sn-text-secondary)]">
          {theme.description}
        </div>
      ) : null}
      <div
        className="aspect-video w-full overflow-hidden rounded-[var(--sn-radius-surface)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] shadow-[var(--sn-shadow)]"
        style={{
          background: "var(--sn-surface)",
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
              className="h-20! w-full! rounded-[var(--sn-radius-compact)] border border-[var(--sn-separator)] object-cover"
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
