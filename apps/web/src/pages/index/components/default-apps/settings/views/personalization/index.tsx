import { Button } from "antd";
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

const resolveWallpaperName = (
  wallpaper: ReturnType<typeof useDesktopTheme>["personalization"]["wallpaper"],
) => {
  if (wallpaper.name) return wallpaper.name;
  if (wallpaper.type === "none") return "无";
  if (wallpaper.type === "image") return "图片";
  return "渐变";
};

const resolveThemeName = (
  themeName: string | null | undefined,
  themeId: string,
) => {
  if (themeName) return themeName;
  if (themeId === "light") return "默认";
  if (themeId === "dark") return "深色";
  return themeId;
};

const PersonalizationView = () => {
  const navigate = useNavigate();
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

  const wallpaperName = resolveWallpaperName(personalization.wallpaper);
  const themeName = resolveThemeName(
    activeTheme?.name,
    personalization.themeId,
  );

  return (
    <MacSettingsView>
      <MacSettingsSection title="外观">
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
          title="模式"
          description={`当前为${resolvedColorScheme === "dark" ? "深色" : "浅色"}`}
          extra={
            <AppSegmented<AppearanceMode>
              size="small"
              value={appearanceMode}
              onChange={setAppearanceMode}
              options={[
                { label: "跟随系统", value: "system" },
                { label: "浅色", value: "light" },
                { label: "深色", value: "dark" },
              ]}
            />
          }
        />

        <MacSettingsRow
          icon={<RiTShirtLine size={16} />}
          iconTone="orange"
          title="主题"
          description={themeName}
          extra={
            <Button
              size="small"
              onClick={() => navigate(personalizationRoute.path.root)}
            >
              管理
            </Button>
          }
        />

        <MacSettingsRow
          icon={<RiLandscapeLine size={16} />}
          iconTone="purple"
          title="背景"
          description={wallpaperName}
          extra={
            <div className="flex items-center gap-2">
              <Button
                size="small"
                onClick={() => navigate(personalizationRoute.path.wallpaper)}
              >
                管理
              </Button>
              <Button
                size="small"
                onClick={() => navigate(personalizationRoute.path.my)}
              >
                我的
              </Button>
            </div>
          }
        />
      </MacSettingsSection>

    </MacSettingsView>
  );
};

export default PersonalizationView;
