import { AppCategoryRail, DefaultAppView } from "@/components";
import { AppButton } from "@/components/ui";
import { useRequest } from "ahooks";
import { Empty, Pagination, Skeleton } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getWallpaperImageUrl,
  getWallpaperPreviewUrl,
  getUserWallpaperCategories,
  getUserWallpaperCollections,
  getUserWallpapers,
  WallpaperApiItem,
  WallpaperCategoryApiItem,
  type WallpaperCollectionPublicItem,
} from "@/services/desktop";
import { personalizationRoute } from "../route-paths";
import PreviewCard, { PreviewCardAction } from "../components/PreviewCard";
import ApplicationWallpaperMetadata from "../components/ApplicationWallpaperMetadata";
import { useI18n } from "@/i18n";
import { RiCheckLine, RiLandscapeLine } from "@remixicon/react";

const getCollectionWallpapers = (collection: WallpaperCollectionPublicItem) =>
  collection.previewWallpapers || collection.wallpapers || [];

const FeaturedWallpaperCollectionCard: FC<{
  collection: WallpaperCollectionPublicItem;
  collectionLabel: string;
  itemLabel: string;
  onOpen: () => void;
}> = ({ collection, collectionLabel, itemLabel, onOpen }) => {
  const wallpapers = getCollectionWallpapers(collection).slice(0, 4);
  const accent = collection.accentColor || "var(--sn-accent)";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-[var(--sn-radius-panel)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] text-left shadow-[var(--sn-shadow)] transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-[var(--sn-accent)] active:translate-y-0 motion-reduce:transition-none"
    >
      <div
        className="grid h-36 grid-cols-4 gap-1 bg-[var(--sn-surface-secondary)] p-1"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        {Array.from({ length: 4 }).map((_, index) => {
          const wallpaper = wallpapers[index];
          const preview = wallpaper ? getWallpaperPreviewUrl(wallpaper) : null;
          const gradientCss =
            wallpaper?.type === "gradient" ? wallpaper.css : undefined;
          return (
            <div
              key={wallpaper?._id || index}
              className="overflow-hidden rounded-[calc(var(--sn-radius-compact)-2px)] bg-black/5"
            >
              {gradientCss ? (
                <div
                  className="h-full w-full"
                  style={{ background: gradientCss }}
                />
              ) : preview ? (
                <img
                  src={preview}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                />
              ) : (
                <div
                  className="h-full w-full opacity-20"
                  style={{ background: accent }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="p-4">
        <div className="text-[11px] font-bold uppercase leading-4 tracking-[0.06em] text-[var(--sn-accent-text)]">
          {collection.kicker || collectionLabel}
        </div>
        <div className="mt-1 line-clamp-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
          {collection.title}
        </div>
        {collection.description ? (
          <div className="mt-1 line-clamp-2 text-[12px] font-medium leading-[18px] text-[var(--sn-text-secondary)]">
            {collection.description}
          </div>
        ) : null}
        <div className="mt-2 text-[11px] font-medium text-[var(--sn-text-tertiary)]">
          {itemLabel}
        </div>
      </div>
    </button>
  );
};

const WallpaperView: FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { personalization, setWallpaper } = useDesktopTheme();
  const currentWallpaperName = t(
    personalization.wallpaper.name ||
      (personalization.wallpaper.type === "none" ? "ui.none" : "ui.wallpaper"),
  );
  const [activeType, setActiveType] = useState<
    "home" | "gradient" | "image" | "application"
  >("home");
  const isCatalogType = activeType === "image" || activeType === "application";
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
    () =>
      getUserWallpaperCategories({
        type: activeType === "application" ? "application" : "image",
      }),
    { ready: isCatalogType, refreshDeps: [activeType] },
  );

  const { data: collections, loading: collectionLoading } = useRequest(
    () => getUserWallpaperCollections(),
    { ready: activeType === "home", refreshDeps: [activeType] },
  );

  const featuredCollections = useMemo(
    () => (collections ?? []).filter((collection) => collection.featured),
    [collections],
  );
  const standardCollections = useMemo(
    () => (collections ?? []).filter((collection) => !collection.featured),
    [collections],
  );

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
        type: activeType === "application" ? "application" : "image",
      }),
    {
      ready: isCatalogType && imageViewMode === "category",
      refreshDeps: [
        activeType,
        imageViewMode,
        page,
        pageSize,
        resolvedCategoryId,
      ],
    },
  );

  const { data: gradientWallpapersPage, loading: gradientWallpaperLoading } =
    useRequest(
      () =>
        getUserWallpapers({
          page,
          pageSize,
          type: "gradient",
        }),
      {
        ready: activeType === "gradient",
        refreshDeps: [activeType, page, pageSize],
      },
    );

  useEffect(() => {
    setActiveCategoryId("");
    setCategoryWallpapersMap({});
    setImageViewMode("categories");
    setPage(1);
  }, [activeType]);

  useEffect(() => {
    if (!isCatalogType) {
      setImageViewMode("categories");
      return;
    }
    if (!categoryLoading && !categoryIdList.length) {
      setImageViewMode("category");
      setActiveCategoryId("");
      return;
    }
    setActiveCategoryId((v) => v || categoryIdList[0] || "");
  }, [activeType, categoryIdList, categoryLoading, isCatalogType]);

  useEffect(() => {
    if (!isCatalogType) return;
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
                type: activeType === "application" ? "application" : "image",
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
  }, [activeType, categoryIdList, imageViewMode, isCatalogType]);

  const isGradientActive = (css: string) => {
    if (css === "") return personalization.wallpaper.type === "none";
    return (
      personalization.wallpaper.type === "gradient" &&
      personalization.wallpaper.css === css
    );
  };

  const handleSelectGradient = (wallpaper: WallpaperApiItem) => {
    if (!wallpaper.css) return;
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

  const visibleGradientWallpapers = useMemo(() => {
    return ((gradientWallpapersPage as any)?.data as WallpaperApiItem[]) ?? [];
  }, [gradientWallpapersPage]);

  const gradientTotal = useMemo(
    () => (gradientWallpapersPage as any)?.total ?? 0,
    [gradientWallpapersPage],
  );

  const isImageActive = (url: string) => {
    return (
      personalization.wallpaper.type === "image" &&
      personalization.wallpaper.url === url
    );
  };

  const isApplicationActive = (wallpaper: WallpaperApiItem) =>
    personalization.wallpaper.type === "application" &&
    personalization.wallpaper.id === wallpaper._id;

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

  const openCategory = (categoryId: string) => {
    const type = activeType === "application" ? "application" : "image";
    navigate(
      `${personalizationRoute.path.wallpaperCategory(categoryId)}?type=${type}`,
    );
  };

  const openCollection = (collectionId: string) => {
    navigate(personalizationRoute.path.wallpaperCollection(collectionId));
  };

  const renderWallpaperCard = (w: WallpaperApiItem) => {
    const previewUrl = getWallpaperPreviewUrl(w);
    const gradientCss = w.type === "gradient" ? w.css : undefined;
    const active =
      w.type === "application"
        ? isApplicationActive(w)
        : w.type === "gradient"
          ? Boolean(gradientCss && isGradientActive(gradientCss))
          : previewUrl
            ? isImageActive(previewUrl)
            : false;
    const disabled = w.type === "gradient" ? !gradientCss : !previewUrl;
    return (
      <PreviewCard
        key={w._id}
        active={active}
        disabled={disabled}
        title={w.name}
        description={
          w.type === "application" ||
          w.type === "gradient" ||
          w.author ||
          w.url ? (
            <ApplicationWallpaperMetadata wallpaper={w} />
          ) : (
            w.description ||
            (previewUrl ? t("ui.imageWallpaper") : t("ui.resourceUnavailable"))
          )
        }
        action={
          (previewUrl || gradientCss) && !active ? (
            <PreviewCardAction
              onClick={() =>
                w.type === "application"
                  ? handleSelectApplication(w)
                  : w.type === "gradient"
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
          ) : previewUrl ? (
            <img
              className="h-full w-full object-cover"
              src={previewUrl}
              alt={w.name}
            />
          ) : (
            <div className="h-full w-full bg-black/5" />
          )
        }
      />
    );
  };

  return (
    <DefaultAppView contentClassName="overflow-y-auto px-6 pb-8 pt-3 max-[640px]:px-4">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex items-end justify-between gap-4 max-[640px]:items-start max-[640px]:flex-col">
          <div>
            <div className="text-[28px] font-bold leading-[34px] text-[var(--sn-text)]">
              {t("ui.wallpaper")}
            </div>
            <div className="mt-1 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
              {t("ui.wallpaper.chooseDescription")}
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--sn-radius-control)] bg-[var(--sn-surface-secondary)] px-3 py-1.5 text-[12px] font-medium leading-4 text-[var(--sn-text-secondary)]">
            <RiCheckLine size={13} className="text-[var(--sn-accent-text)]" />
            <span>
              {t("ui.currentWallpaper")} · {currentWallpaperName}
            </span>
          </div>
        </div>
        <div className="mb-6">
          <AppCategoryRail
            options={[
              { label: t("ui.wallpaperHome"), value: "home" },
              { label: t("ui.gradient"), value: "gradient" },
              { label: t("ui.image"), value: "image" },
              { label: t("ui.applicationWallpaper"), value: "application" },
            ]}
            value={activeType}
            onChange={(v) => setActiveType(v)}
            ariaLabel={t("ui.categories")}
            previousLabel={t("ui.previousCategories")}
            nextLabel={t("ui.nextCategories")}
          />
        </div>
        {activeType === "home" ? (
          collectionLoading ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} active paragraph={{ rows: 5 }} />
                ))}
              </div>
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} active paragraph={{ rows: 4 }} />
              ))}
            </div>
          ) : (collections ?? []).length ? (
            <div className="space-y-8">
              {featuredCollections.length ? (
                <section>
                  <div className="mb-3 px-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
                    {t("ui.wallpaperCollections")}
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {featuredCollections.map((collection) => (
                      <FeaturedWallpaperCollectionCard
                        key={collection._id}
                        collection={collection}
                        collectionLabel={t("ui.wallpaperCollection")}
                        itemLabel={t("ui.storeItemCount", {
                          count: collection.total ?? 0,
                        })}
                        onOpen={() => openCollection(collection._id)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {standardCollections.map((collection) => {
                const items = getCollectionWallpapers(collection);
                return (
                  <section key={collection._id}>
                    <div className="mb-3 flex items-end justify-between gap-3 px-1">
                      <div className="min-w-0">
                        {collection.kicker ? (
                          <div className="mb-1 text-[11px] font-bold uppercase leading-4 tracking-[0.06em] text-[var(--sn-accent-text)]">
                            {collection.kicker}
                          </div>
                        ) : null}
                        <div className="line-clamp-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
                          {collection.title}
                        </div>
                        <div className="mt-1 line-clamp-1 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
                          {collection.description ||
                            t("ui.storeItemCount", {
                              count: collection.total ?? items.length,
                            })}
                        </div>
                      </div>
                      <AppButton
                        intent="link"
                        size="small"
                        className="text-[var(--sn-accent-text)]!"
                        onClick={() => openCollection(collection._id)}
                      >
                        {t("ui.viewMore")}
                      </AppButton>
                    </div>
                    <div className="-mx-1 flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto overflow-y-hidden px-1 pb-2">
                      {items.map((wallpaper) => (
                        <div
                          key={wallpaper._id}
                          className="w-[280px] shrink-0 snap-start max-[640px]:w-[calc(100vw-112px)]"
                        >
                          {renderWallpaperCard(wallpaper)}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="grid h-[260px] place-items-center">
              <Empty description={t("ui.noCollections")} />
            </div>
          )
        ) : activeType === "gradient" ? (
          gradientWallpaperLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} active paragraph={{ rows: 3 }} />
              ))}
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PreviewCard
                  active={isGradientActive("")}
                  title={t("ui.none")}
                  description={t("ui.useDefaultBackground")}
                  action={
                    isGradientActive("") ? null : (
                      <PreviewCardAction
                        onClick={() =>
                          setWallpaper({ type: "none", name: t("ui.none") })
                        }
                      >
                        {t("action.apply")}
                      </PreviewCardAction>
                    )
                  }
                  cover={
                    <div
                      className="grid h-full w-full place-items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--sn-surface-secondary), var(--sn-page))",
                      }}
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-[var(--sn-radius-surface)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] text-[var(--sn-text-tertiary)] shadow-[var(--sn-shadow)]">
                        <RiLandscapeLine size={22} />
                      </span>
                    </div>
                  }
                />
                {visibleGradientWallpapers.map((wallpaper) =>
                  renderWallpaperCard(wallpaper),
                )}
              </div>
              {gradientTotal > pageSize ? (
                <div className="mt-5 flex justify-end">
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={gradientTotal}
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
          )
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
                  <Skeleton.Button active size="small" />
                </div>
                <div className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden pb-2 -mx-1 px-1">
                  {Array.from({ length: 5 }).map((__, cardIdx) => (
                    <div key={cardIdx} className="w-56 shrink-0">
                      <Skeleton.Image
                        active
                        style={{
                          width: 224,
                          height: 120,
                          borderRadius: "var(--sn-radius-compact)",
                        }}
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
                        <div className="line-clamp-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
                          {c.name}
                        </div>
                      </div>
                      <AppButton
                        intent="link"
                        size="small"
                        className="text-[var(--sn-accent-text)]!"
                        onClick={() => openCategory(c._id)}
                      >
                        {t("ui.viewMore")}
                      </AppButton>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {items.map((item) => renderWallpaperCard(item))}
                      {items.length === 0 ? (
                        <Empty
                          className="mt-2"
                          description={t("ui.noWallpapers")}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[220px] w-full flex items-center justify-center">
              <Empty description={t("ui.noCategories")} />
            </div>
          )
        ) : wallpaperLoading ? (
          <div className="h-[220px] w-full flex items-center justify-center">
            <div className="text-[13px] text-[var(--sn-text-secondary)]">
              {t("ui.loadingWallpapers")}
            </div>
          </div>
        ) : visibleWallpapers.length ? (
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleWallpapers.map((w) => renderWallpaperCard(w))}
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
            <Empty
              description={
                imageViewMode === "category"
                  ? t("ui.noWallpapers")
                  : t("ui.noData")
              }
            />
          </div>
        )}
      </div>
    </DefaultAppView>
  );
};

export default WallpaperView;
