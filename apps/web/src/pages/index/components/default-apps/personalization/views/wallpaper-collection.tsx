import { DefaultAppView } from "@/components";
import { useI18n } from "@/i18n";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getUserWallpaperCollections,
  getUserWallpaperCollectionWallpapers,
  getWallpaperImageUrl,
  getWallpaperPreviewUrl,
  type WallpaperApiItem,
  type WallpaperCollectionPublicItem,
} from "@/services/desktop";
import { useRequest } from "ahooks";
import { Empty, Pagination, Skeleton } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import ApplicationWallpaperMetadata from "../components/ApplicationWallpaperMetadata";
import PreviewCard, { PreviewCardAction } from "../components/PreviewCard";

const WallpaperCollectionView: FC = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const collectionId = id ? decodeURIComponent(id) : "";
  const typeParam = searchParams.get("type");
  const wallpaperType =
    typeParam === "application" ||
    typeParam === "gradient" ||
    typeParam === "image"
      ? typeParam
      : undefined;
  const { personalization, setWallpaper } = useDesktopTheme();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const { data: collectionList } = useRequest(
    () => getUserWallpaperCollections({ wallpaperType }),
    { refreshDeps: [wallpaperType] },
  );
  const { data, loading } = useRequest(
    () =>
      getUserWallpaperCollectionWallpapers(collectionId, {
        page,
        pageSize,
        wallpaperType,
      }),
    {
      ready: Boolean(collectionId),
      refreshDeps: [collectionId, page, pageSize, wallpaperType],
    },
  );

  useEffect(() => {
    setPage(1);
  }, [collectionId, wallpaperType]);

  const collection = useMemo<WallpaperCollectionPublicItem | null>(() => {
    return (
      (data as any)?.collection ||
      (collectionList ?? []).find((item) => item._id === collectionId) ||
      null
    );
  }, [collectionId, collectionList, data]);
  const wallpapers = useMemo(
    () => ((data as any)?.data as WallpaperApiItem[]) ?? [],
    [data],
  );
  const total = Number((data as any)?.total ?? wallpapers.length);

  const handleApply = (wallpaper: WallpaperApiItem) => {
    if (wallpaper.type === "application") {
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
      return;
    }
    if (wallpaper.type === "gradient") {
      if (!wallpaper.css) return;
      setWallpaper({
        type: "gradient",
        css: wallpaper.css,
        name: wallpaper.name,
      });
      return;
    }
    const url = getWallpaperImageUrl(wallpaper);
    if (!url) return;
    setWallpaper({ type: "image", url, name: wallpaper.name });
  };

  const isActive = (wallpaper: WallpaperApiItem) => {
    if (wallpaper.type === "application") {
      return (
        personalization.wallpaper.type === "application" &&
        personalization.wallpaper.id === wallpaper._id
      );
    }
    if (wallpaper.type === "gradient") {
      return Boolean(
        wallpaper.css &&
        personalization.wallpaper.type === "gradient" &&
        personalization.wallpaper.css === wallpaper.css,
      );
    }
    const url = getWallpaperImageUrl(wallpaper);
    return Boolean(
      url &&
      personalization.wallpaper.type === "image" &&
      personalization.wallpaper.url === url,
    );
  };

  return (
    <DefaultAppView
      className="h-full"
      animate
      title={
        collection?.title ? (
          collection.title
        ) : (
          <Skeleton.Input active size="small" style={{ width: 180 }} />
        )
      }
      contentClassName="overflow-y-auto px-6 pb-8 pt-3 max-[640px]:px-4"
    >
      <div className="mx-auto w-full max-w-6xl">
        {collection ? (
          <div className="mb-6 rounded-[var(--sn-radius-panel)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-5 shadow-[var(--sn-shadow)]">
            {collection.kicker ? (
              <div className="text-[11px] font-bold uppercase leading-4 tracking-[0.08em] text-[var(--sn-accent-text)]">
                {collection.kicker}
              </div>
            ) : null}
            <div className="mt-1 text-[24px] font-bold leading-[30px] text-[var(--sn-text)]">
              {collection.title}
            </div>
            {collection.description ? (
              <div className="mt-2 max-w-3xl text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
                {collection.description}
              </div>
            ) : null}
            <div className="mt-3 text-[12px] font-medium text-[var(--sn-text-tertiary)]">
              {t("ui.storeItemCount", { count: total })}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} active paragraph={{ rows: 3 }} />
            ))}
          </div>
        ) : wallpapers.length ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {wallpapers.map((wallpaper) => {
                const previewUrl = getWallpaperPreviewUrl(wallpaper);
                const gradientCss =
                  wallpaper.type === "gradient" ? wallpaper.css : undefined;
                const active = isActive(wallpaper);
                return (
                  <PreviewCard
                    key={wallpaper._id}
                    active={active}
                    disabled={
                      wallpaper.type === "gradient" ? !gradientCss : !previewUrl
                    }
                    title={wallpaper.name}
                    description={
                      wallpaper.type === "application" ||
                      wallpaper.type === "gradient" ||
                      wallpaper.author ||
                      wallpaper.url ? (
                        <ApplicationWallpaperMetadata wallpaper={wallpaper} />
                      ) : (
                        wallpaper.description || t("ui.imageWallpaper")
                      )
                    }
                    action={
                      (previewUrl || gradientCss) && !active ? (
                        <PreviewCardAction
                          onClick={() => handleApply(wallpaper)}
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
                      ) : previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={wallpaper.name}
                          className="h-full w-full object-cover"
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
          </>
        ) : (
          <div className="grid h-[220px] place-items-center">
            <Empty description={t("ui.noWallpapers")} />
          </div>
        )}
      </div>
    </DefaultAppView>
  );
};

export default WallpaperCollectionView;
