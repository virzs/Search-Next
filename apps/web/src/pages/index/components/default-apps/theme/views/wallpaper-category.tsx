import { DefaultAppView } from "@/components";
import { cx } from "@emotion/css";
import { useRequest } from "ahooks";
import { Empty, Image, Pagination, Skeleton } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getWallpaperImageUrl,
  getUserWallpaperCategories,
  getUserWallpapers,
  type WallpaperApiItem,
  type WallpaperCategoryApiItem,
} from "@/services/desktop";

const WallpaperCategoryView: FC = () => {
  const { id } = useParams();
  const categoryId = id ? decodeURIComponent(String(id)) : "";
  const { personalization, setWallpaper } = useDesktopTheme();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const { data: categories, loading: categoryLoading } = useRequest(
    getUserWallpaperCategories,
  );

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  const { data: wallpapersPage, loading: wallpaperLoading } = useRequest(
    () => getUserWallpapers({ page, pageSize, categoryId: categoryId || undefined }),
    { ready: Boolean(categoryId), refreshDeps: [categoryId, page, pageSize] },
  );

  const activeCategory = useMemo(() => {
    const items: WallpaperCategoryApiItem[] = categories ?? [];
    return items.find((c) => c._id === categoryId) ?? null;
  }, [categories, categoryId]);

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

  const cardClassName = cx(
    "rounded-2xl border p-4 transition select-none",
    "hover:opacity-95 active:opacity-90",
    "cursor-pointer",
  );

  return (
    <DefaultAppView
      className="h-full"
      animate
      title={
        activeCategory?.name ? (
          activeCategory.name
        ) : (
          <Skeleton.Input active size="small" style={{ width: 180 }} />
        )
      }
      contentClassName="overflow-y-auto px-1 pb-4"
    >
      {categoryLoading || wallpaperLoading ? (
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
          <Empty description="暂无壁纸" />
        </div>
      )}
    </DefaultAppView>
  );
};

export default WallpaperCategoryView;
