import { DefaultAppView } from "@/components";
import { useRequest } from "ahooks";
import { Empty, Pagination, Skeleton } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getWallpaperImageUrl,
  getWallpaperPreviewUrl,
  getUserWallpaperCategories,
  getUserWallpapers,
  type WallpaperApiItem,
  type WallpaperCategoryApiItem,
} from "@/services/desktop";
import PreviewCard, { PreviewCardAction } from "../components/PreviewCard";
import ApplicationWallpaperMetadata from "../components/ApplicationWallpaperMetadata";
import { useI18n } from "@/i18n";

const WallpaperCategoryView: FC = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = id ? decodeURIComponent(String(id)) : "";
  const typeParam = searchParams.get("type");
  const wallpaperType =
    typeParam === "application" || typeParam === "gradient"
      ? typeParam
      : "image";
  const { personalization, setWallpaper } = useDesktopTheme();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const { data: categories, loading: categoryLoading } = useRequest(
    () => getUserWallpaperCategories({ type: wallpaperType }),
    { refreshDeps: [wallpaperType] },
  );

  useEffect(() => {
    setPage(1);
  }, [categoryId, wallpaperType]);

  const { data: wallpapersPage, loading: wallpaperLoading } = useRequest(
    () =>
      getUserWallpapers({
        page,
        pageSize,
        categoryId: categoryId || undefined,
        type: wallpaperType,
      }),
    {
      ready: Boolean(categoryId),
      refreshDeps: [categoryId, page, pageSize, wallpaperType],
    },
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

  const handleSelectApplication = (wallpaper: WallpaperApiItem) => {
    const previewUrl = getWallpaperPreviewUrl(wallpaper);
    const revision = wallpaper.application?.revision;
    if (!previewUrl || !revision) return;
    setWallpaper({
      type: "application",
      id: wallpaper._id,
      revision,
      previewUrl,
      name: wallpaper.name,
    });
  };

  const handleSelectGradient = (wallpaper: WallpaperApiItem) => {
    if (!wallpaper.css) return;
    setWallpaper({
      type: "gradient",
      css: wallpaper.css,
      name: wallpaper.name,
    });
  };

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
      contentClassName="overflow-y-auto px-6 pb-8 pt-3 max-[640px]:px-4"
    >
      {categoryLoading || wallpaperLoading ? (
        <div className="h-[220px] w-full flex items-center justify-center">
          <div className="text-[13px] text-[var(--sn-text-secondary)]">
            {t("ui.loadingWallpapers")}
          </div>
        </div>
      ) : visibleWallpapers.length ? (
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleWallpapers.map((w) => {
              const url = getWallpaperPreviewUrl(w);
              const gradientCss =
                wallpaperType === "gradient" ? w.css : undefined;
              const active =
                wallpaperType === "application"
                  ? personalization.wallpaper.type === "application" &&
                    personalization.wallpaper.id === w._id
                  : wallpaperType === "gradient"
                    ? Boolean(
                        gradientCss &&
                        personalization.wallpaper.type === "gradient" &&
                        personalization.wallpaper.css === gradientCss,
                      )
                    : url
                      ? isImageActive(url)
                      : false;
              return (
                <PreviewCard
                  key={w._id}
                  active={active}
                  disabled={wallpaperType === "gradient" ? !gradientCss : !url}
                  title={w.name}
                  description={
                    wallpaperType === "application" ||
                    wallpaperType === "gradient" ||
                    w.author ||
                    w.url ? (
                      <ApplicationWallpaperMetadata wallpaper={w} />
                    ) : (
                      w.description ||
                      (url
                        ? t("ui.imageWallpaper")
                        : t("ui.resourceUnavailable"))
                    )
                  }
                  action={
                    (url || gradientCss) && !active ? (
                      <PreviewCardAction
                        onClick={() =>
                          wallpaperType === "application"
                            ? handleSelectApplication(w)
                            : wallpaperType === "gradient"
                              ? handleSelectGradient(w)
                              : handleSelectImage(w)
                        }
                      >
                        {t("action.apply")}
                      </PreviewCardAction>
                    ) : null
                  }
                  cover={
                    gradientCss ? (
                      <div
                        className="h-full w-full"
                        style={{ background: gradientCss }}
                      />
                    ) : url ? (
                      <img
                        className="h-full w-full object-cover"
                        src={url}
                        alt={w.name}
                      />
                    ) : (
                      <div className="h-full w-full bg-black/5" />
                    )
                  }
                />
              );
            })}
          </div>

          {total > pageSize ? (
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
          ) : null}
        </div>
      ) : (
        <div className="h-[220px] w-full flex items-center justify-center">
          <Empty description={t("ui.noWallpapers")} />
        </div>
      )}
    </DefaultAppView>
  );
};

export default WallpaperCategoryView;
