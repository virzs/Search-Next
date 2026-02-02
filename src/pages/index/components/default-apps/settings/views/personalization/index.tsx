import { Button } from "antd";
import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import { useRequest } from "ahooks";
import {
  RiArrowDownSLine,
  RiLandscapeLine,
  RiTShirtLine,
} from "@remixicon/react";
import { cx } from "@emotion/css";
import { SettingsCard } from "@/components/settings";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getActiveThemeConfigs,
  getThemePreviewImageUrl,
} from "@/services/desktop";
import { themeRoute } from "../../../theme/route-paths";
import { ThemeDesktopPreview } from "../../../theme/views/theme-preview";
import { DefaultAppView } from "@/components";

const resolveWallpaperName = (
  wallpaper: ReturnType<typeof useDesktopTheme>["personalization"]["wallpaper"],
) => {
  if (wallpaper.name) return wallpaper.name;
  if (wallpaper.type === "none") return "无";
  if (wallpaper.type === "image") return "图片";
  return "渐变";
};

const PersonalizationView = () => {
  const navigate = useNavigate();
  const { personalization } = useDesktopTheme();
  const { data: themes } = useRequest(getActiveThemeConfigs);
  const [openKey, setOpenKey] = useState<"theme" | "wallpaper" | null>(null);

  const activeTheme = useMemo(() => {
    const id = personalization.themeId;
    return (themes ?? []).find((t) => t._id === id) ?? null;
  }, [personalization.themeId, themes]);

  const wallpaperName = resolveWallpaperName(personalization.wallpaper);

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
    return { background: "rgba(0,0,0,0.06)" };
  }, [personalization.wallpaper]);

  const itemHeaderClassName =
    "flex items-center justify-between transition select-none hover:bg-white/85 active:bg-white";

  const panelClassName =
    "mt-2 rounded-2xl border border-black/5 bg-white/60 p-3";

  const themeCardClassName = cx(
    "rounded-2xl border p-4 transition select-none",
    "bg-[rgba(255,255,255,0.18)]",
  );
  const activeRingColor = "rgba(22, 119, 255, 0.45)";

  const themePreviewUrl = useMemo(() => {
    return getThemePreviewImageUrl(activeTheme, 0);
  }, [activeTheme]);

  const toggle = (key: "theme" | "wallpaper") => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <DefaultAppView>
      <SettingsCard>
        <div className="grid gap-3">
          <div>
            <div
              role="button"
              tabIndex={0}
              className={itemHeaderClassName}
              onClick={() => toggle("theme")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggle("theme");
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <RiTShirtLine size={16} className="opacity-70" />
                  <div className="font-medium">主题</div>
                </div>
                <div className="mt-1 text-sm text-black/60 truncate">
                  {activeTheme ? activeTheme.name : personalization.themeId}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="text"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(themeRoute.path.root);
                  }}
                >
                  管理
                </Button>
                <RiArrowDownSLine
                  size={18}
                  className={cx(
                    "opacity-60 transition-transform",
                    openKey === "theme" ? "rotate-180" : "rotate-0",
                  )}
                />
              </div>
            </div>

            {openKey === "theme" ? (
              <div className={panelClassName}>
                <div
                  className={themeCardClassName}
                  style={{
                    borderColor: "rgba(0,0,0,0.08)",
                    boxShadow: `0 0 0 2px ${activeRingColor}`,
                  }}
                >
                  <div
                    className="h-28 rounded-xl border overflow-hidden"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    {themePreviewUrl ? (
                      <img
                        className="h-full w-full object-cover"
                        src={themePreviewUrl}
                        alt=""
                      />
                    ) : activeTheme ? (
                      <ThemeDesktopPreview theme={activeTheme} />
                    ) : (
                      <div className="h-full w-full bg-black/5" />
                    )}
                  </div>

                  <div className="mt-3 min-w-0">
                    <div className="font-semibold truncate">
                      {activeTheme ? activeTheme.name : personalization.themeId}
                    </div>
                    {activeTheme?.description ? (
                      <div className="text-xs opacity-70 mt-1 line-clamp-2">
                        {activeTheme.description}
                      </div>
                    ) : (
                      <div className="text-xs opacity-50 mt-1">暂无描述</div>
                    )}
                  </div>

                  <div className="text-xs opacity-70 mt-2">已应用</div>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <div
              role="button"
              tabIndex={0}
              className={itemHeaderClassName}
              onClick={() => toggle("wallpaper")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggle("wallpaper");
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <RiLandscapeLine size={16} className="opacity-70" />
                  <div className="font-medium">背景</div>
                </div>
                <div className="mt-1 text-sm text-black/60 truncate">
                  {wallpaperName}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="text"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(themeRoute.path.wallpaper);
                  }}
                >
                  管理
                </Button>
                <RiArrowDownSLine
                  size={18}
                  className={cx(
                    "opacity-60 transition-transform",
                    openKey === "wallpaper" ? "rotate-180" : "rotate-0",
                  )}
                />
              </div>
            </div>

            {openKey === "wallpaper" ? (
              <div className={panelClassName}>
                <div
                  className={cx(
                    "rounded-2xl border p-4 transition select-none",
                    "bg-[rgba(255,255,255,0.18)]",
                  )}
                  style={{
                    borderColor: "rgba(0,0,0,0.08)",
                    boxShadow: `0 0 0 2px ${activeRingColor}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {wallpaperName}
                      </div>
                      <div className="text-xs opacity-70 mt-1">
                        {personalization.wallpaper.type === "none"
                          ? "使用默认背景"
                          : "已应用"}
                      </div>
                    </div>
                    <div
                      className="h-8 w-8 rounded-xl border"
                      style={{
                        ...(personalization.wallpaper.type === "none"
                          ? { background: "rgba(0,0,0,0.04)" }
                          : wallpaperPreviewStyle),
                        borderColor: "rgba(0,0,0,0.08)",
                      }}
                    />
                  </div>

                  <div
                    className="mt-4 h-20 rounded-xl border overflow-hidden"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <div
                      className="h-full w-full"
                      style={wallpaperPreviewStyle}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </SettingsCard>
    </DefaultAppView>
  );
};

export default PersonalizationView;
