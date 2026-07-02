import { DefaultAppView } from "@/components";
import { useRequest } from "ahooks";
import { Button } from "antd";
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
import PreviewCard from "../components/PreviewCard";
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
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";

const themeMyClassName = css`
  .apple-theme-action.ant-btn-primary:not(:disabled) {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;

const resolveWallpaperName = (
  wallpaper: ReturnType<typeof useDesktopTheme>["personalization"]["wallpaper"],
) => {
  if (wallpaper.name) return wallpaper.name;
  if (wallpaper.type === "none") return "ui.none";
  if (wallpaper.type === "image") return "ui.image";
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
    className="relative min-h-[250px] overflow-hidden rounded-[15px] border border-[rgba(60,60,67,0.13)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.045)]"
    style={wallpaperStyle}
  >
    <div className="absolute inset-0 bg-white/10" />
    <div className="relative mx-auto mt-5 h-[132px] w-[66%] min-w-[260px] overflow-hidden rounded-[13px] border border-white/80 bg-white/90 shadow-[0_18px_36px_rgba(0,0,0,0.13)] max-[720px]:min-w-0 max-[720px]:w-[78%]">
      {theme ? (
        <ThemeDesktopPreview theme={theme} />
      ) : (
        <div className="grid h-full grid-cols-[1fr_1.1fr] bg-white">
          <div className="border-r border-[rgba(60,60,67,0.08)]" />
          <div className="bg-[#5f5f62]" />
        </div>
      )}
    </div>
    <div className="absolute bottom-4 left-1/2 flex h-[27px] w-[176px] -translate-x-1/2 items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/60 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
      {["#0a84ff", "#ff9500", "#34c759", "#af52de", "#8e8e93"].map(
        (color) => (
          <span
            key={color}
            className="h-3 w-3 rounded-[4px]"
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
    blue: "bg-[#007aff]",
    purple: "bg-[#af52de]",
    green: "bg-[#34c759]",
  }[tone];

  return (
    <div className="rounded-[16px] border border-white/80 bg-white/90 p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] ${toneClassName}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#1d1d1f]">
            {title}
          </div>
          <div className="mt-1 text-xs leading-[18px] text-[#6e6e73]">
            {description}
          </div>
          <div className="mt-1 text-xs font-bold text-[#8e8e93]">{detail}</div>
        </div>
      </div>
    </div>
  );
};

const CreateActionCard = ({
  title,
  description,
  action,
  tone,
}: {
  title: string;
  description: string;
  action: () => void;
  tone: "theme" | "wallpaper";
}) => {
  const icon =
    tone === "theme" ? <RiTShirtLine size={18} /> : <RiLandscapeLine size={18} />;
  const toneClassName =
    tone === "theme"
      ? "text-[#007aff]"
      : "text-[#af52de]";

  return (
    <button
      className="min-h-[136px] rounded-[20px] border border-white/80 bg-white/80 p-4 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_34px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:-translate-y-[1px] hover:bg-white"
      onClick={action}
    >
      <span className={`mx-auto mb-3 grid h-10 w-10 place-items-center rounded-[12px] bg-[#f2f2f7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${toneClassName}`}>
        {icon}
      </span>
      <span className="block text-sm font-semibold text-[#1d1d1f]">
        {title}
      </span>
      <span className="mx-auto mt-1 block max-w-[230px] text-xs leading-5 text-[#8e8e93]">
        {description}
      </span>
    </button>
  );
};

const ThemeMyView = () => {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeThemeId, personalization, setActiveThemeId, setWallpaper } =
    useDesktopTheme();
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
    () => themes.map(toMyThemeConfig),
    [themes],
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
      className={themeMyClassName}
      headerRight={
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(personalizationRoute.path.myThemeCreate)}>
            {t("ui.createTheme")}
          </Button>
          <Button
            type="primary"
            icon={<RiAddLine size={16} />}
            className="apple-theme-action"
            onClick={() => navigate(personalizationRoute.path.myCreate)}
          >
            {t("ui.addWallpaper")}
          </Button>
        </div>
      }
      contentClassName="overflow-y-auto px-6 pb-8 pt-3 max-[640px]:px-4"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5">
          <div className="text-[32px] font-bold leading-10 tracking-normal text-[#1d1d1f]">
            {t("ui.mine")}
          </div>
          <div className="mt-1 text-[13px] font-medium leading-5 text-[#6e6e73]">
            {t("ui.personalization.mineDescription")}
          </div>
        </div>
      <section>
        <div className="mb-2 ml-1 text-[13px] font-extrabold text-[#6e6e73]">
          {t("ui.inUse")}
        </div>
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-5 max-[760px]:grid-cols-1">
          <CurrentDesktopPreview
            wallpaperStyle={wallpaperPreviewStyle(personalization.wallpaper)}
            theme={currentTheme}
          />
          <div className="grid gap-3">
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
                    : t("ui.gradientWallpaper")
              }
              tone="purple"
            />
            <CurrentStatusCard
              icon={<RiAddLine size={16} />}
              title={t("ui.customContent")}
              description={t("ui.createAThemeOrAddAWallpaper")}
              detail={t("ui.manageBelow")}
              tone="green"
            />
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-2 ml-1 text-[13px] font-extrabold text-[#6e6e73]">
          {t("ui.myCreations")}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <CreateActionCard
            title={t("ui.createTheme")}
            description={t("ui.theme.editorDescription")}
            tone="theme"
            action={() => navigate(personalizationRoute.path.myThemeCreate)}
          />
          <CreateActionCard
            title={t("ui.addWallpaper")}
            description={t("ui.wallpaper.editorDescription")}
            tone="wallpaper"
            action={() => navigate(personalizationRoute.path.myCreate)}
          />
          {sortedThemes.map((theme) => {
            const config = toMyThemeConfig(theme);
            const active = activeThemeId === theme.id;
            return (
              <PreviewCard
                key={theme.id}
                active={active}
                title={theme.name}
                description={
                  active ? t("ui.customThemeInUse") : t("ui.clickTheCardToEditTheme")
                }
                status={
                  active ? (
                    <span className="rounded-full bg-[#e9f3ff] px-2 py-0.5 text-[11px] font-bold text-[#007aff]">
                      {t("ui.current")}
                    </span>
                  ) : null
                }
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="small"
                      onClick={() =>
                        navigate(personalizationRoute.path.myThemeEdit(theme.id))
                      }
                    >
                      {t("ui.edit")}
                    </Button>
                    <Button
                      size="small"
                      type={active ? "default" : "primary"}
                      shape="round"
                      disabled={active}
                      className={active ? undefined : "apple-theme-action"}
                      onClick={() => setActiveThemeId(theme.id)}
                    >
                      {active ? t("ui.applied") : t("action.apply")}
                    </Button>
                  </div>
                }
                onClick={() => navigate(personalizationRoute.path.myThemeEdit(theme.id))}
                cover={
                  <div className="h-full w-full">
                    <ThemeDesktopPreview theme={config} />
                  </div>
                }
              />
            );
          })}
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
                description={
                  item.type === "gradient"
                    ? active ? t("ui.customWallpaperInUse") : t("ui.clickTheCardToEditGradient")
                    : active ? t("ui.customWallpaperInUse") : t("ui.clickTheCardToEditImage")
                }
                status={
                  active ? (
                    <span className="rounded-full bg-[#e9f3ff] px-2 py-0.5 text-[11px] font-bold text-[#007aff]">
                      {t("ui.current")}
                    </span>
                  ) : null
                }
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="small"
                      onClick={() => navigate(personalizationRoute.path.myEdit(item.id))}
                    >
                      {t("ui.edit")}
                    </Button>
                    <Button
                      size="small"
                      type={active ? "default" : "primary"}
                      shape="round"
                      disabled={active}
                      className={active ? undefined : "apple-theme-action"}
                      onClick={() => applyWallpaper(item)}
                    >
                      {active ? t("ui.applied") : t("action.apply")}
                    </Button>
                  </div>
                }
                onClick={() => navigate(personalizationRoute.path.myEdit(item.id))}
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
        {sortedThemes.length || sortedWallpapers.length ? null : (
          <div className="mt-3 rounded-[14px] border border-[rgba(60,60,67,0.12)] bg-white/70 px-4 py-3 text-xs font-medium text-[#8e8e93]">
            {t("ui.personalization.emptyMine")}
          </div>
        )}
      </section>
      </div>
    </DefaultAppView>
  );
};

export default ThemeMyView;
