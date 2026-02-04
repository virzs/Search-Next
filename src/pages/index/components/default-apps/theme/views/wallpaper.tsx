import { AppSegmented, DefaultAppView } from "@/components";
import { cx } from "@emotion/css";
import { useRequest } from "ahooks";
import { Button, Empty, Image, Pagination, Skeleton } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getWallpaperImageUrl,
  getUserWallpaperCategories,
  getUserWallpapers,
  WallpaperApiItem,
  WallpaperCategoryApiItem,
} from "@/services/desktop";
import { themeRoute } from "../route-paths";
import {
  GradientWallpaperPreset,
  gradientWallpaperPresets,
} from "./wallpaper-gradients";

const WallpaperView: FC = () => {
  const navigate = useNavigate();
  const { personalization, setWallpaper } = useDesktopTheme();
  const [activeType, setActiveType] = useState<"gradient" | "image">(
    "gradient",
  );
  const [imageViewMode, setImageViewMode] = useState<"categories" | "category">(
    "categories",
  );
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [categoryWallpapersMap, setCategoryWallpapersMap] = useState<
    Record<string, WallpaperApiItem[]>
  >({});
  const [categoryWallpapersLoading, setCategoryWallpapersLoading] =
    useState(false);

  const { data: categories, loading: categoryLoading } = useRequest(
    getUserWallpaperCategories,
    { ready: activeType === "image" },
  );

  const categoryNameMap = useMemo(() => {
    const items: WallpaperCategoryApiItem[] = categories ?? [];
    const map: Record<string, string> = {};
    items.forEach((c) => {
      map[c._id] = c.name;
    });
    return map;
  }, [categories]);

  const activeCategoryName = useMemo(() => {
    if (!activeCategoryId) return "壁纸";
    return categoryNameMap[activeCategoryId] ?? "壁纸";
  }, [activeCategoryId, categoryNameMap]);

  const categoryIdList = useMemo(() => {
    const items: WallpaperCategoryApiItem[] = categories ?? [];
    return items.map((c) => c._id);
  }, [categories]);

  const resolvedCategoryId = useMemo(() => {
    return activeCategoryId ? activeCategoryId : (categoryIdList[0] ?? "");
  }, [activeCategoryId, categoryIdList]);

  const { data: wallpapersPage, loading: wallpaperLoading } = useRequest(
    () =>
      getUserWallpapers({
        page,
        pageSize,
        categoryId: resolvedCategoryId || undefined,
      }),
    {
      ready: activeType === "image" && imageViewMode === "category",
      refreshDeps: [
        activeType,
        imageViewMode,
        page,
        pageSize,
        resolvedCategoryId,
      ],
    },
  );

  const cardClassName = cx(
    "rounded-2xl border p-4 transition select-none",
    "hover:opacity-95 active:opacity-90",
    "cursor-pointer",
  );

  useEffect(() => {
    if (activeType !== "image") {
      setImageViewMode("categories");
      return;
    }
    if (!categoryIdList.length) return;
    setActiveCategoryId((v) => v || categoryIdList[0] || "");
  }, [activeType, categoryIdList]);

  useEffect(() => {
    if (activeType !== "image") return;
    if (imageViewMode !== "categories") return;
    if (!categoryIdList.length) return;
    let cancelled = false;
    const run = async () => {
      setCategoryWallpapersLoading(true);
      try {
        const results = await Promise.all(
          categoryIdList.map(async (categoryId) => {
            try {
              const res = await getUserWallpapers({
                page: 1,
                pageSize: 5,
                categoryId,
              });
              return { categoryId, items: res?.data ?? [] };
            } catch {
              return { categoryId, items: [] as WallpaperApiItem[] };
            }
          }),
        );
        if (cancelled) return;
        const next: Record<string, WallpaperApiItem[]> = {};
        results.forEach((r) => {
          next[r.categoryId] = r.items;
        });
        setCategoryWallpapersMap(next);
      } finally {
        if (!cancelled) setCategoryWallpapersLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [activeType, categoryIdList, imageViewMode]);

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

  const openCategory = (categoryId: string) => {
    navigate(themeRoute.path.wallpaperCategory(categoryId));
  };

  const renderWallpaperCard = (w: WallpaperApiItem) => {
    const url = getWallpaperImageUrl(w);
    const active = url ? isImageActive(url) : false;
    const ringColor = active ? "rgba(22, 119, 255, 0.45)" : "transparent";
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
          if (e.key === "Enter" || e.key === " ") handleSelectImage(w);
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
  };

  return (
    <DefaultAppView
      title={
        activeType === "image" && imageViewMode === "category"
          ? activeCategoryName
          : undefined
      }
      headerLeft={
        <AppSegmented
          options={[
            { label: "渐变", value: "gradient" },
            { label: "图片", value: "image" },
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
      ) : categoryLoading ||
        (imageViewMode === "categories" && categoryWallpapersLoading) ? (
        <div className="w-full flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx}>
              <div className="flex items-end justify-between gap-3 mb-3 px-1">
                <Skeleton
                  active
                  title={{ width: 160 }}
                  paragraph={{ rows: 1, width: 260 }}
                />
                <Skeleton.Button active size="small" shape="round" />
              </div>
              <div className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1">
                {Array.from({ length: 5 }).map((__, cardIdx) => (
                  <div key={cardIdx} className="w-56 shrink-0">
                    <Skeleton.Image
                      active
                      style={{ width: 224, height: 120, borderRadius: 16 }}
                    />
                    <div className="mt-2 px-1">
                      <Skeleton
                        active
                        title={false}
                        paragraph={{ rows: 2, width: ["80%", "60%"] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : imageViewMode === "categories" ? (
        (categories ?? []).length ? (
          <div className="flex flex-col gap-6">
            {(categories ?? []).map((c) => {
              const items = categoryWallpapersMap[c._id] ?? [];
              return (
                <div key={c._id}>
                  <div className="flex items-end justify-between gap-3 mb-3 px-1">
                    <div className="min-w-0">
                      <div className="text-lg font-bold line-clamp-1">
                        {c.name}
                      </div>
                    </div>
                    <Button
                      type="link"
                      className="px-0!"
                      onClick={() => openCategory(c._id)}
                    >
                      查看更多
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => renderWallpaperCard(item))}
                    {items.length === 0 ? (
                      <Empty className="mt-2" description="暂无壁纸" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[220px] w-full flex items-center justify-center">
            <Empty description="暂无分类" />
          </div>
        )
      ) : wallpaperLoading ? (
        <div className="h-[220px] w-full flex items-center justify-center">
          <div className="text-sm text-gray-500">正在加载壁纸…</div>
        </div>
      ) : visibleWallpapers.length ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleWallpapers.map((w) => renderWallpaperCard(w))}
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
          <Empty
            description={imageViewMode === "category" ? "暂无壁纸" : "暂无数据"}
          />
        </div>
      )}
    </DefaultAppView>
  );
};

export default WallpaperView;
