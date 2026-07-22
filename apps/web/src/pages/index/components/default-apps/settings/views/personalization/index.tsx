import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useRequest } from "ahooks";
import {
  RiComputerLine,
  RiHourglassLine,
  RiLandscapeLine,
  RiMoonLine,
  RiSunLine,
  RiTimerLine,
  RiTShirtLine,
} from "@remixicon/react";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  SCREEN_SAVER_TIMEOUT_MINUTES,
  type AppearanceMode,
  type ScreenSaverTimeoutMinutes,
} from "@/contexts/DesktopThemeContext";
import {
  getActiveThemeConfigs,
  getActiveWallpaperDetail,
} from "@/services/desktop";
import { AppSegmented } from "@/components";
import { getMyThemeConfigs } from "../../../personalization/my-assets";
import { personalizationRoute } from "../../../personalization/route-paths";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsSwitchRow,
  MacSettingsView,
} from "../../components/macos-settings";
import { useI18n } from "@/i18n";
import { AppButton, AppSelect } from "@/components/ui";
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

const resolveThemeName = (
  themeName: string | null | undefined,
  themeId: string,
) => {
  if (themeName) return themeName;
  if (themeId === "light") return "ui.default";
  if (themeId === "dark") return "ui.dark";
  return themeId;
};

const PersonalizationView = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    appearanceMode,
    personalization,
    resolvedColorScheme,
    setAppearanceMode,
    setScreenSaver,
  } = useDesktopTheme();
  const { data: themes } = useRequest(getActiveThemeConfigs);
  const activeApplicationWallpaperId =
    personalization.wallpaper.type === "application"
      ? personalization.wallpaper.id
      : "";
  const { data: activeApplicationWallpaper } = useRequest(
    () => getActiveWallpaperDetail(activeApplicationWallpaperId),
    {
      ready: Boolean(activeApplicationWallpaperId),
      refreshDeps: [activeApplicationWallpaperId],
    },
  );
  const { projectInfo } = useConfig();
  const systemThemeColor = projectInfo?.site?.themeColor || DEFAULT_THEME_COLOR;

  const activeTheme = useMemo(() => {
    const id = personalization.themeId;
    return (
      [...(themes ?? []), ...getMyThemeConfigs(systemThemeColor)].find(
        (t) => t._id === id,
      ) ?? null
    );
  }, [personalization.themeId, systemThemeColor, themes]);

  const wallpaperName = t(resolveWallpaperName(personalization.wallpaper));
  const wallpaperDescription =
    personalization.wallpaper.type === "application" &&
    activeApplicationWallpaper?.application ? (
      <span className="grid gap-0.5">
        <span>{wallpaperName}</span>
        {activeApplicationWallpaper.description ||
        activeApplicationWallpaper.application.description ? (
          <span>
            {activeApplicationWallpaper.description ||
              activeApplicationWallpaper.application.description}
          </span>
        ) : null}
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[var(--sn-text-tertiary)]">
          {activeApplicationWallpaper.author ||
          activeApplicationWallpaper.application.author ? (
            <span>
              {t("ui.author")} ·{" "}
              {activeApplicationWallpaper.author ||
                activeApplicationWallpaper.application.author}
            </span>
          ) : null}
          {activeApplicationWallpaper.url ||
          activeApplicationWallpaper.application.projectUrl ? (
            <a
              href={
                activeApplicationWallpaper.url ||
                activeApplicationWallpaper.application.projectUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--sn-accent-text)] hover:underline"
            >
              {t("ui.source")}
            </a>
          ) : null}
        </span>
      </span>
    ) : (
      wallpaperName
    );
  const themeName = t(
    resolveThemeName(activeTheme?.name, personalization.themeId),
  );

  return (
    <MacSettingsView>
      <MacSettingsSection title={t("ui.appearance")}>
        <MacSettingsRow
          icon={
            appearanceMode === "dark" ? (
              <RiMoonLine size={16} />
            ) : appearanceMode === "light" ? (
              <RiSunLine size={16} />
            ) : (
              <RiComputerLine size={16} />
            )
          }
          iconTone="blue"
          title={t("ui.mode")}
          description={t("ui.currentlyScheme", {
            scheme: t(resolvedColorScheme === "dark" ? "ui.dark" : "ui.light"),
          })}
          extra={
            <AppSegmented<AppearanceMode>
              size="small"
              value={appearanceMode}
              onChange={setAppearanceMode}
              options={[
                { label: t("ui.followSystem"), value: "system" },
                { label: t("ui.light"), value: "light" },
                { label: t("ui.dark"), value: "dark" },
              ]}
            />
          }
        />

        <MacSettingsRow
          icon={<RiTShirtLine size={16} />}
          iconTone="orange"
          title={t("ui.theme")}
          description={themeName}
          extra={
            <AppButton
              size="small"
              onClick={() => navigate(personalizationRoute.path.root)}
            >
              {t("ui.manage")}
            </AppButton>
          }
        />

        <MacSettingsRow
          icon={<RiLandscapeLine size={16} />}
          iconTone="purple"
          title={t("ui.background")}
          description={wallpaperDescription}
          extra={
            <div className="flex items-center gap-2">
              <AppButton
                size="small"
                onClick={() => navigate(personalizationRoute.path.wallpaper)}
              >
                {t("ui.manage")}
              </AppButton>
              <AppButton
                size="small"
                onClick={() => navigate(personalizationRoute.path.my)}
              >
                {t("ui.mine")}
              </AppButton>
            </div>
          }
        />
      </MacSettingsSection>

      <MacSettingsSection title={t("ui.screenSaver")}>
        <MacSettingsSwitchRow
          icon={<RiTimerLine size={16} />}
          iconTone="blue"
          title={t("ui.screenSaver.enabled")}
          description={t("ui.screenSaver.description")}
          checked={personalization.screenSaver.enabled}
          onChange={(enabled) =>
            setScreenSaver({ ...personalization.screenSaver, enabled })
          }
        />
        <MacSettingsRow
          icon={<RiHourglassLine size={16} />}
          iconTone="purple"
          title={t("ui.screenSaver.waitTime")}
          description={t("ui.screenSaver.waitTimeDescription")}
          extra={
            <AppSelect
              size="small"
              aria-label={t("ui.screenSaver.waitTime")}
              value={personalization.screenSaver.timeoutMinutes}
              disabled={!personalization.screenSaver.enabled}
              onChange={(timeoutMinutes: ScreenSaverTimeoutMinutes) =>
                setScreenSaver({
                  ...personalization.screenSaver,
                  timeoutMinutes,
                })
              }
              options={SCREEN_SAVER_TIMEOUT_MINUTES.map((minutes) => ({
                label: t("ui.screenSaver.minutes", { count: minutes }),
                value: minutes,
              }))}
              popupMatchSelectWidth={false}
              getPopupContainer={(triggerNode) =>
                triggerNode.closest(".base-modal-panel") ?? document.body
              }
              className="w-[112px]"
            />
          }
        />
      </MacSettingsSection>
    </MacSettingsView>
  );
};

export default PersonalizationView;
