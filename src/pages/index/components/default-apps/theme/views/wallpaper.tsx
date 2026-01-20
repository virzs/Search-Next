import { AppSegmented, DefaultAppView } from "@/components";
import { cx } from "@emotion/css";
import { FC, useMemo, useState } from "react";
import useDesktopTheme from "@/hooks/useDesktopTheme";

const WallpaperView: FC = () => {
  const { personalization, setWallpaper } = useDesktopTheme();
  const [activeType, setActiveType] = useState<"gradient" | "image">(
    "gradient",
  );
  const cardClassName = cx(
    "rounded-2xl border p-4 transition select-none",
    "hover:opacity-95 active:opacity-90",
    "cursor-pointer",
  );

  const gradientWallpapers = useMemo(
    () => [
      { id: "none", name: "无", css: "" },
      {
        id: "aurora",
        name: "极光",
        css: "radial-gradient(80% 70% at 15% 20%, rgba(0, 199, 190, 0.70) 0%, rgba(0, 0, 0, 0) 65%), radial-gradient(80% 70% at 85% 15%, rgba(10, 132, 255, 0.62) 0%, rgba(0, 0, 0, 0) 60%), radial-gradient(90% 80% at 55% 92%, rgba(255, 45, 85, 0.55) 0%, rgba(0, 0, 0, 0) 62%), linear-gradient(135deg, #0b0b10 0%, #111325 40%, #0b1220 100%)",
      },
      {
        id: "sky",
        name: "天光",
        css: "radial-gradient(120% 90% at 20% 10%, rgba(90, 200, 250, 0.85) 0%, rgba(10, 132, 255, 0.0) 55%), radial-gradient(100% 80% at 90% 30%, rgba(88, 86, 214, 0.55) 0%, rgba(88, 86, 214, 0) 60%), linear-gradient(135deg, rgba(242, 242, 247, 1) 0%, rgba(224, 235, 255, 1) 55%, rgba(236, 232, 255, 1) 100%)",
      },
      {
        id: "sunset",
        name: "落日",
        css: "radial-gradient(110% 90% at 15% 25%, rgba(255, 159, 10, 0.80) 0%, rgba(255, 159, 10, 0) 55%), radial-gradient(120% 100% at 85% 20%, rgba(255, 45, 85, 0.70) 0%, rgba(255, 45, 85, 0) 60%), linear-gradient(135deg, rgba(255, 250, 245, 1) 0%, rgba(255, 231, 220, 1) 60%, rgba(255, 220, 236, 1) 100%)",
      },
      {
        id: "lime",
        name: "青柠",
        css: "radial-gradient(110% 90% at 20% 20%, rgba(48, 209, 88, 0.70) 0%, rgba(48, 209, 88, 0) 55%), radial-gradient(120% 90% at 80% 30%, rgba(0, 199, 190, 0.55) 0%, rgba(0, 199, 190, 0) 60%), linear-gradient(135deg, rgba(245, 255, 252, 1) 0%, rgba(226, 255, 243, 1) 55%, rgba(224, 248, 255, 1) 100%)",
      },
      {
        id: "mono",
        name: "雾白",
        css: "radial-gradient(120% 90% at 25% 20%, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0) 55%), radial-gradient(120% 90% at 85% 35%, rgba(199, 199, 204, 0.55) 0%, rgba(199, 199, 204, 0) 60%), linear-gradient(135deg, rgba(242, 242, 247, 1) 0%, rgba(232, 232, 236, 1) 100%)",
      },
      {
        id: "midnight",
        name: "深夜",
        css: "radial-gradient(100% 80% at 20% 25%, rgba(88, 86, 214, 0.55) 0%, rgba(88, 86, 214, 0) 60%), radial-gradient(120% 90% at 82% 18%, rgba(10, 132, 255, 0.55) 0%, rgba(10, 132, 255, 0) 60%), radial-gradient(110% 90% at 60% 92%, rgba(255, 45, 85, 0.40) 0%, rgba(255, 45, 85, 0) 62%), linear-gradient(135deg, #050509 0%, #0b0b14 55%, #070710 100%)",
      },
    ],
    [],
  );

  const isGradientActive = (css: string) => {
    if (css === "") return personalization.wallpaper.type === "none";
    return (
      personalization.wallpaper.type === "gradient" &&
      personalization.wallpaper.css === css
    );
  };

  const handleSelectGradient = (wallpaper: (typeof gradientWallpapers)[number]) => {
    if (wallpaper.id === "none") {
      setWallpaper({ type: "none", name: wallpaper.name });
      return;
    }
    setWallpaper({ type: "gradient", css: wallpaper.css, name: wallpaper.name });
  };

  return (
    <DefaultAppView
      headerLeft={
        <AppSegmented
          options={[
            { label: "渐变", value: "gradient" },
            { label: "图片", value: "image", disabled: true },
          ]}
          value={activeType}
          onChange={(v) => setActiveType(v as any)}
          className="max-w-full overflow-auto"
        />
      }
      contentClassName="overflow-y-auto px-1 pb-4"
    >

      {activeType === "gradient" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gradientWallpapers.map((w) => {
            const active = isGradientActive(w.css);
            const ringColor = active
              ? "rgba(22, 119, 255, 0.45)"
              : "transparent";
            return (
              <div
                key={w.id}
                role="button"
                tabIndex={0}
                className={cardClassName}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  borderColor: "rgba(0,0,0,0.08)",
                  boxShadow: `0 0 0 2px ${ringColor}`,
                }}
                onClick={() => handleSelectGradient(w)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleSelectGradient(w);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{w.name}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {w.id === "none" ? "使用默认背景" : "点击应用到桌面"}
                    </div>
                  </div>
                  <div
                    className="h-8 w-8 rounded-xl border"
                    style={{
                      background: w.id === "none" ? "rgba(0,0,0,0.04)" : w.css,
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
                    style={{
                      background: w.id === "none" ? "rgba(0,0,0,0.04)" : w.css,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[280px] w-full flex items-center justify-center">
          <div className="text-sm text-gray-500">图片壁纸功能开发中</div>
        </div>
      )}
    </DefaultAppView>
  );
};

export default WallpaperView;
