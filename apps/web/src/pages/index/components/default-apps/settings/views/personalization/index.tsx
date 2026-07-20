import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useRequest } from "ahooks";
import {
  RiComputerLine,
  RiLandscapeLine,
  RiMoonLine,
  RiSunLine,
  RiTShirtLine,
} from "@remixicon/react";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import type { AppearanceMode } from "@/contexts/DesktopThemeContext";
import { getActiveThemeConfigs } from "@/services/desktop";
import { AppSegmented } from "@/components";
import { getMyThemeConfigs } from "../../../personalization/my-assets";
import { personalizationRoute } from "../../../personalization/route-paths";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";
import { useI18n } from "@/i18n";
import { AppButton } from "@/components/ui";

const resolveWallpaperName = (
  wallpaper: ReturnType<typeof useDesktopTheme>["personalization"]["wallpaper"],
) => {
  if (wallpaper.name) return wallpaper.name;
  if (wallpaper.type === "none") return "ui.none";
  if (wallpaper.type === "image") return "ui.image";
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
  } = useDesktopTheme();
  const { data: themes } = useRequest(getActiveThemeConfigs);

  const activeTheme = useMemo(() => {
    const id = personalization.themeId;
    return (
      [...(themes ?? []), ...getMyThemeConfigs()].find((t) => t._id === id) ??
      null
    );
  }, [personalization.themeId, themes]);

  const wallpaperName = t(resolveWallpaperName(personalization.wallpaper));
  const themeName = t(resolveThemeName(
    activeTheme?.name,
    personalization.themeId,
  ));

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
          description={wallpaperName}
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

    </MacSettingsView>
  );
};

export default PersonalizationView;
