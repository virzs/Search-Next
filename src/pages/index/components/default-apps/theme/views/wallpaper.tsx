import { AppSegmented, DefaultAppView } from "@/components";
import { cx } from "@emotion/css";
import { useRequest } from "ahooks";
import { Empty, Image, Pagination, Space } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getWallpaperImageUrl,
  getUserWallpaperCategories,
  getUserWallpapers,
  WallpaperApiItem,
  WallpaperCategoryApiItem,
} from "@/services/desktop";
import {
  GradientWallpaperPreset,
  gradientWallpaperPresets,
} from "./wallpaper-gradients";

const WallpaperView: FC = () => {
  const { personalization, setWallpaper } = useDesktopTheme();
  const [activeType, setActiveType] = useState<"gradient" | "image">(
    "gradient",
  );
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const { data: categories, loading: categoryLoading } = useRequest(
    getUserWallpaperCategories,
    { ready: activeType === "image" },
  );

  const {
    data: wallpapersPage,
    loading: wallpaperLoading,
    run: runWallpapers,
  } = useRequest(getUserWallpapers as any, { manual: true });

  const cardClassName = cx(
    "rounded-2xl border p-4 transition select-none",
    "hover:opacity-95 active:opacity-90",
    "cursor-pointer",
  );

  const categoryOptions = useMemo(() => {
    const items: WallpaperCategoryApiItem[] = categories ?? [];
    return [
      { label: "全部", value: "all" },
      ...items.map((c) => ({ label: c.name, value: c._id })),
    ];
  }, [categories]);

  useEffect(() => {
    if (activeType !== "image") return;
    const params = {
      page,
      pageSize,
      categoryId: activeCategoryId === "all" ? undefined : activeCategoryId,
    };
    runWallpapers(params);
  }, [activeCategoryId, activeType, page, pageSize, runWallpapers]);

  useEffect(() => {
    setPage(1);
  }, [activeCategoryId]);

  const isGradientActive = (css: string) => {
    if (css === "") return personalization.wallpaper.type === "none";
    return (
      personalization.wallpaper.type === "gradient" &&
      personalization.wallpaper.css === css
    );
  };

  const handleSelectGradient = (wallpaper: GradientWallpaperPreset) => {
    if (wallpaper.id === "none") {
      setWallpaper({ type: "none", name: wallpaper.name });
      return;
    }
    setWallpaper({
      type: "gradient",
      css: wallpaper.css,
      name: wallpaper.name,
    });
  };

  const visibleWallpapers = useMemo(() => {
    return ((wallpapersPage as any)?.data as WallpaperApiItem[]) ?? [];
  }, [wallpapersPage]);

  const total = useMemo(() => {
    return (wallpapersPage as any)?.total ?? 0;
  }, [wallpapersPage]);

  const isImageActive = (url: string) => {
    return (
      personalization.wallpaper.type === "image" &&
      personalization.wallpaper.url === url
    );
  };

  const handleSelectImage = (wallpaper: WallpaperApiItem) => {
    const url = getWallpaperImageUrl(wallpaper);
    if (!url) return;
    setWallpaper({ type: "image", url, name: wallpaper.name });
  };

  return (
    <DefaultAppView
      headerLeft={
        <Space>
          <AppSegmented
            options={[
              { label: "渐变", value: "gradient" },
              { label: "图片", value: "image" },
            ]}
            value={activeType}
            onChange={(v) => setActiveType(v as any)}
            className="max-w-full overflow-auto"
          />
          {activeType === "image" ? (
            <AppSegmented
              options={categoryOptions}
              value={activeCategoryId}
              onChange={(v) => setActiveCategoryId(String(v))}
              className="max-w-full overflow-auto"
            />
          ) : null}
        </Space>
      }
      contentClassName="overflow-y-auto px-1 pb-4"
    >
      {activeType === "gradient" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gradientWallpaperPresets.map((w) => {
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
      ) : wallpaperLoading || categoryLoading ? (
        <div className="h-[220px] w-full flex items-center justify-center">
          <div className="text-sm text-gray-500">正在加载壁纸…</div>
        </div>
      ) : visibleWallpapers.length ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleWallpapers.map((w) => {
              const url = getWallpaperImageUrl(w);
              const active = url ? isImageActive(url) : false;
              const ringColor = active
                ? "rgba(22, 119, 255, 0.45)"
                : "transparent";
              return (
                <div
                  key={w._id}
                  role="button"
                  tabIndex={0}
                  className={cardClassName}
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    borderColor: "rgba(0,0,0,0.08)",
                    boxShadow: `0 0 0 2px ${ringColor}`,
                    cursor: url ? "pointer" : "not-allowed",
                    opacity: url ? 1 : 0.55,
                  }}
                  onClick={() => (url ? handleSelectImage(w) : null)}
                  onKeyDown={(e) => {
                    if (!url) return;
                    if (e.key === "Enter" || e.key === " ")
                      handleSelectImage(w);
                  }}
                >
                  <div
                    className="h-28 rounded-xl border overflow-hidden"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    {url ? (
                      <Image
                        className="w-full! h-full! object-cover"
                        src={url}
                        preview={false}
                      />
                    ) : (
                      <div className="h-full w-full bg-black/5" />
                    )}
                  </div>

                  <div className="mt-3 min-w-0">
                    <div className="font-semibold truncate">{w.name}</div>
                    {w.description ? (
                      <div className="text-xs opacity-70 mt-1 line-clamp-2">
                        {w.description}
                      </div>
                    ) : (
                      <div className="text-xs opacity-50 mt-1">暂无描述</div>
                    )}
                  </div>

                  <div className="text-xs opacity-70 mt-2">
                    {active ? "已应用" : url ? "点击应用到桌面" : "资源不可用"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showQuickJumper
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                if (nextPageSize !== pageSize) setPageSize(nextPageSize);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="h-[220px] w-full flex items-center justify-center">
          <Empty description="暂无数据" />
        </div>
      )}
    </DefaultAppView>
  );
};

export default WallpaperView;
