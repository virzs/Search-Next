import { Button } from "antd";
import { useMemo, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import { useRequest } from "ahooks";
import { RiLandscapeLine, RiPaletteLine, RiTShirtLine } from "@remixicon/react";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import { getActiveThemeConfigs } from "@/services/desktop";
import { getMyThemeConfigs } from "../../../personalization/my-assets";
import { personalizationRoute } from "../../../personalization/route-paths";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
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
  const { personalization } = useDesktopTheme();
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

  const wallpaperPreviewStyle = useMemo<CSSProperties>(() => {
    const wallpaper = personalization.wallpaper;
    if (wallpaper.type === "gradient") return { background: wallpaper.css };
    if (wallpaper.type === "image") {
      const safeUrl = (wallpaper.url || "").replace(/"/g, '\\"');
      return {
        backgroundImage: `url("${safeUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      background: "linear-gradient(135deg, #e7f5ff, #fff3ea 57%, #f5f0ff)",
    };
  }, [personalization.wallpaper]);

  return (
    <MacSettingsView>
      <section className="rounded-[20px] border border-white/80 bg-white/80 p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-[13px] font-bold text-[#6e6e73]">桌面预览</div>
          <div className="rounded-full bg-[#f2f2f7] px-2.5 py-1 text-xs font-bold text-[#6e6e73]">
            {themeName} · {wallpaperName}
          </div>
        </div>
        <div
          className="relative h-32 overflow-hidden rounded-[15px] border border-[rgba(60,60,67,0.13)] p-3"
          style={wallpaperPreviewStyle}
        >
          <div className="mx-auto mt-1 grid h-[62%] w-[54%] grid-rows-[22px_1fr] overflow-hidden rounded-xl border border-white/75 bg-white/90 shadow-[0_12px_24px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-1.5 border-b border-[rgba(60,60,67,0.1)] pl-3">
              <span className="h-2 w-2 rounded-full bg-[#d1d1d6]" />
              <span className="h-2 w-2 rounded-full bg-[#d1d1d6]" />
              <span className="h-2 w-2 rounded-full bg-[#d1d1d6]" />
            </div>
            <div className="grid grid-cols-[1fr_1.15fr]">
              <div className="border-r border-[rgba(60,60,67,0.08)]" />
              <div />
            </div>
          </div>
          <div className="absolute bottom-2.5 left-1/2 flex h-5 w-[144px] -translate-x-1/2 items-center justify-center gap-1.5 rounded-xl border border-white/70 bg-white/60 shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
            {["#0a84ff", "#ff9500", "#34c759", "#af52de", "#8e8e93"].map(
              (color) => (
                <span
                  key={color}
                  className="h-2.5 w-2.5 rounded-[4px]"
                  style={{ background: color }}
                />
              ),
            )}
          </div>
        </div>
      </section>

      <MacSettingsSection title="外观">
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

      <MacSettingsSection title="强调色">
        <MacSettingsRow
          icon={<RiPaletteLine size={16} />}
          iconTone="blue"
          title="颜色"
          description="用于按钮、选中状态和高亮描边"
          extra={<MacSettingsValue>蓝色</MacSettingsValue>}
        />
        <MacSettingsRow
          title={
            <div className="flex gap-2.5 py-1">
              <span className="h-[30px] w-[30px] rounded-full border-2 border-white bg-[#0a84ff] shadow-[0_0_0_2px_rgba(0,122,255,0.42)]" />
              <span className="h-[30px] w-[30px] rounded-full border-2 border-white bg-[#ff9500] shadow-[0_0_0_1px_rgba(60,60,67,0.15)]" />
              <span className="h-[30px] w-[30px] rounded-full border-2 border-white bg-[#34c759] shadow-[0_0_0_1px_rgba(60,60,67,0.15)]" />
              <span className="h-[30px] w-[30px] rounded-full border-2 border-white bg-[#af52de] shadow-[0_0_0_1px_rgba(60,60,67,0.15)]" />
              <span className="h-[30px] w-[30px] rounded-full border-2 border-white bg-[#d1d1d6] shadow-[0_0_0_1px_rgba(60,60,67,0.15)]" />
            </div>
          }
          extra={<MacSettingsValue>系统推荐</MacSettingsValue>}
        />
      </MacSettingsSection>
    </MacSettingsView>
  );
};

export default PersonalizationView;
