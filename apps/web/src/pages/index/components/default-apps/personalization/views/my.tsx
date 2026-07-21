import { DefaultAppView } from "@/components";
import { AppButton } from "@/components/ui";
import { useRequest } from "ahooks";
import {
  RiAddLine,
  RiLandscapeLine,
  RiTShirtLine,
} from "@remixicon/react";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getActiveThemeConfigs,
  type ThemeConfigApiItem,
} from "@/services/desktop";
import PreviewCard, {
  PreviewCardAction,
} from "../components/PreviewCard";
import { personalizationRoute } from "../route-paths";
import { ThemeDesktopPreview } from "./theme-preview";
import {
  MY_THEMES_CHANGED_EVENT,
  MY_WALLPAPERS_CHANGED_EVENT,
  readMyThemes,
  readMyWallpapers,
  toMyThemeConfig,
  type MyThemeItem,
  type MyWallpaperItem,
} from "../my-assets";
import { useI18n } from "@/i18n";
import { useConfig } from "@/hooks/useConfig";
import { DEFAULT_THEME_COLOR } from "@/theme/color";

const resolveWallpaperName = (
  wallpaper: ReturnType<typeof useDesktopTheme>["personalization"]["wallpaper"],
) => {
  if (wallpaper.name) return wallpaper.name;
  if (wallpaper.type === "none") return "ui.none";
  if (wallpaper.type === "image") return "ui.image";
  if (wallpaper.type === "application") return "ui.applicationWallpaper";
  return "ui.gradient";
};

const resolveThemeName = (themeName: string | null | undefined, themeId: string) => {
  if (themeName) return themeName;
  if (themeId === "light") return "ui.default";
  if (themeId === "dark") return "ui.dark";
  return themeId;
};

const wallpaperPreviewStyle = (
  item: MyWallpaperItem | ReturnType<typeof useDesktopTheme>["personalization"]["wallpaper"],
): CSSProperties => {
  if (item.type === "gradient") return { background: item.css };
  if (item.type === "image") {
    const safeUrl = (item.url || "").replace(/"/g, '\\"');
    return {
      backgroundImage: `url("${safeUrl}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (item.type === "application") {
    return {
      backgroundImage: item.previewUrl
        ? `url("${item.previewUrl.replace(/"/g, '\\"')}")`
        : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { background: "rgba(0,0,0,0.04)" };
};

const CurrentDesktopPreview = ({
  wallpaperStyle,
  theme,
}: {
  wallpaperStyle: CSSProperties;
  theme: ThemeConfigApiItem | null;
}) => (
  <div
    className="relative min-h-[238px] overflow-hidden rounded-[var(--sn-radius-panel)] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)] p-5 shadow-[var(--sn-shadow)]"
    style={wallpaperStyle}
  >
    <div className="absolute inset-0 bg-white/10" />
    <div className="relative mx-auto mt-4 h-[132px] w-[66%] min-w-[260px] overflow-hidden rounded-[var(--sn-radius-surface)] border border-white/60 bg-white/90 shadow-[0_14px_30px_rgba(0,0,0,0.14)] max-[720px]:min-w-0 max-[720px]:w-[82%]">
      {theme ? (
        <ThemeDesktopPreview theme={theme} />
      ) : (
        <div className="grid h-full grid-cols-[1fr_1.1fr] bg-white">
          <div className="border-r border-[rgba(60,60,67,0.08)]" />
          <div className="bg-[#5f5f62]" />
        </div>
      )}
    </div>
    <div className="absolute bottom-4 left-1/2 flex h-8 w-[176px] -translate-x-1/2 items-center justify-center gap-2 rounded-[var(--sn-radius-control)] border border-white/60 bg-white/55 shadow-[0_8px_20px_rgba(0,0,0,0.1)] backdrop-blur-xl">
      {["#0a84ff", "#ff9500", "#34c759", "#af52de", "#8e8e93"].map(
        (color) => (
          <span
            key={color}
            className="h-3 w-3 rounded-[var(--sn-radius-round)]"
            style={{ background: color }}
          />
        ),
      )}
    </div>
  </div>
);

const CurrentStatusCard = ({
  icon,
  title,
  description,
  detail,
  tone,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  detail: string;
  tone: "blue" | "purple" | "green";
}) => {
  const toneClassName = {
    blue: "bg-[var(--sn-accent)]",
    purple: "bg-[#af52de]",
    green: "bg-[#34c759]",
  }[tone];

  return (
    <div className="rounded-[var(--sn-radius-surface)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-4 shadow-[var(--sn-shadow)]">
      <div className="flex items-start gap-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-[var(--sn-radius-compact)] ${tone === "blue" ? "text-[var(--sn-on-accent)]" : "text-white"} ${toneClassName}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold leading-5 text-[var(--sn-text)]">
            {title}
          </div>
          <div className="mt-1 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
            {description}
          </div>
          <div className="mt-1 text-[12px] font-semibold text-[var(--sn-text-tertiary)]">{detail}</div>
        </div>
      </div>
    </div>
  );
};

const ThemeMyView = () => {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeThemeId, personalization, setActiveThemeId, setWallpaper } =
    useDesktopTheme();
  const { projectInfo } = useConfig();
  const systemThemeColor =
    projectInfo?.site?.themeColor || DEFAULT_THEME_COLOR;
  const [wallpapers, setWallpapers] = useState<MyWallpaperItem[]>([]);
  const [themes, setThemes] = useState<MyThemeItem[]>([]);
  const { data: activeThemes } = useRequest(getActiveThemeConfigs);

  const reload = () => {
    setWallpapers(readMyWallpapers());
    setThemes(readMyThemes());
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    reload();
  }, [location.key]);

  useEffect(() => {
    const handler = () => reload();
    window.addEventListener("storage", handler);
    window.addEventListener(MY_WALLPAPERS_CHANGED_EVENT, handler);
    window.addEventListener(MY_THEMES_CHANGED_EVENT, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(MY_WALLPAPERS_CHANGED_EVENT, handler);
      window.removeEventListener(MY_THEMES_CHANGED_EVENT, handler);
    };
  }, []);

  const customThemeConfigs = useMemo(
    () => themes.map((theme) => toMyThemeConfig(theme, systemThemeColor)),
    [systemThemeColor, themes],
  );

  const currentTheme = useMemo<ThemeConfigApiItem | null>(() => {
    return (
      [...(activeThemes ?? []), ...customThemeConfigs].find(
        (theme) => theme._id === activeThemeId,
      ) ?? null
    );
  }, [activeThemeId, activeThemes, customThemeConfigs]);

  const sortedWallpapers = useMemo(() => {
    return [...wallpapers].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [wallpapers]);

  const sortedThemes = useMemo(() => {
    return [...themes].sort((a, b) => {
      const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
      return tb - ta;
    });
  }, [themes]);

  const currentWallpaperName =
    personalization.wallpaper.name || t(resolveWallpaperName(personalization.wallpaper));
  const currentThemeName = currentTheme?.name
    ? currentTheme.name
    : t(resolveThemeName(currentTheme?.name, activeThemeId));
  const applyWallpaper = (item: MyWallpaperItem) => {
    if (item.type === "gradient") {
      setWallpaper({ type: "gradient", css: item.css, name: item.name });
      return;
    }
    setWallpaper({ type: "image", url: item.url, name: item.name });
  };

  return (
    <DefaultAppView
      contentClassName="overflow-y-auto px-6 pb-8 pt-3 max-[640px]:px-4"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4 max-[700px]:flex-col">
          <div className="min-w-0">
            <div className="text-[28px] font-bold leading-[34px] text-[var(--sn-text)]">
              {t("ui.mine")}
            </div>
            <div className="mt-1 text-[13px] leading-5 text-[var(--sn-text-secondary)]">
              {t("ui.personalization.mineDescription")}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 max-[700px]:w-full">
            <AppButton
              intent="secondary"
              size="default"
              icon={<RiTShirtLine size={15} />}
              onClick={() => navigate(personalizationRoute.path.myThemeCreate)}
            >
              {t("ui.createTheme")}
            </AppButton>
            <AppButton
              intent="primary"
              size="default"
              icon={<RiAddLine size={16} />}
              onClick={() => navigate(personalizationRoute.path.myCreate)}
            >
              {t("ui.addWallpaper")}
            </AppButton>
          </div>
        </div>
      <section>
        <div className="mb-3 ml-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
          {t("ui.inUse")}
        </div>
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 max-[760px]:grid-cols-1">
          <CurrentDesktopPreview
            wallpaperStyle={wallpaperPreviewStyle(personalization.wallpaper)}
            theme={currentTheme}
          />
          <div className="grid content-start gap-3">
            <CurrentStatusCard
              icon={<RiTShirtLine size={16} />}
              title={t("ui.currentTheme")}
              description={currentThemeName}
              detail={t("ui.appliedToDesktop")}
              tone="blue"
            />
            <CurrentStatusCard
              icon={<RiLandscapeLine size={16} />}
              title={t("ui.currentWallpaper")}
              description={currentWallpaperName}
              detail={
                personalization.wallpaper.type === "none"
                  ? t("ui.useDefaultBackground")
                  : personalization.wallpaper.type === "image"
                    ? t("ui.imageWallpaper")
                    : personalization.wallpaper.type === "application"
                      ? t("ui.applicationWallpaper")
                      : t("ui.gradientWallpaper")
              }
              tone="purple"
            />
          </div>
        </div>
      </section>

      {sortedThemes.length || sortedWallpapers.length ? (
        <>
          {sortedThemes.length ? (
            <section className="mt-6">
              <div className="mb-3 ml-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
                {t("ui.theme")}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sortedThemes.map((theme) => {
                  const config = toMyThemeConfig(theme, systemThemeColor);
                  const active = activeThemeId === theme.id;
                  return (
                    <PreviewCard
                      key={theme.id}
                      active={active}
                      title={theme.name}
                      description={theme.description || t("ui.clickTheCardToEditTheme")}
                      action={
                        !active ? (
                          <PreviewCardAction
                            onClick={() => setActiveThemeId(theme.id)}
                          >
                            {t("action.apply")}
                          </PreviewCardAction>
                        ) : null
                      }
                      onClick={() =>
                        navigate(personalizationRoute.path.myThemeEdit(theme.id))
                      }
                      cover={<ThemeDesktopPreview theme={config} />}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}

          {sortedWallpapers.length ? (
            <section className="mt-6">
              <div className="mb-3 ml-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
                {t("ui.wallpaper")}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sortedWallpapers.map((item) => {
                  const active =
                    item.type === "gradient"
                      ? personalization.wallpaper.type === "gradient" &&
                        personalization.wallpaper.css === item.css
                      : personalization.wallpaper.type === "image" &&
                        personalization.wallpaper.url === item.url;
                  return (
                    <PreviewCard
                      key={item.id}
                      active={active}
                      title={item.name}
                      description={item.type === "gradient" ? t("ui.clickTheCardToEditGradient") : t("ui.clickTheCardToEditImage")}
                      action={
                        !active ? (
                          <PreviewCardAction
                            onClick={() => applyWallpaper(item)}
                          >
                            {t("action.apply")}
                          </PreviewCardAction>
                        ) : null
                      }
                      onClick={() =>
                        navigate(personalizationRoute.path.myEdit(item.id))
                      }
                      cover={
                        <div
                          className="h-full w-full"
                          style={wallpaperPreviewStyle(item)}
                        />
                      }
                    />
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <section className="mt-6 rounded-[var(--sn-radius-panel)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] px-6 py-8 text-center shadow-[var(--sn-shadow)]">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-[var(--sn-radius-control)] bg-[var(--sn-surface-secondary)] text-[var(--sn-accent-text)]">
            <RiAddLine size={20} />
          </div>
          <div className="mt-3 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
            {t("ui.myCreations")}
          </div>
          <div className="mx-auto mt-1 max-w-[420px] text-[13px] leading-5 text-[var(--sn-text-secondary)]">
            {t("ui.personalization.emptyMine")}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <AppButton
              intent="secondary"
              size="default"
              onClick={() => navigate(personalizationRoute.path.myThemeCreate)}
            >
              {t("ui.createTheme")}
            </AppButton>
            <AppButton
              intent="primary"
              size="default"
              onClick={() => navigate(personalizationRoute.path.myCreate)}
            >
              {t("ui.addWallpaper")}
            </AppButton>
          </div>
        </section>
      )}
      </div>
    </DefaultAppView>
  );
};

export default ThemeMyView;
