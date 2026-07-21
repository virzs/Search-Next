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
  getUserWallpapers,
  WallpaperApiItem,
  WallpaperCategoryApiItem,
} from "@/services/desktop";
import { personalizationRoute } from "../route-paths";
import {
  GradientWallpaperPreset,
  gradientWallpaperPresets,
} from "./wallpaper-gradients";
import PreviewCard, { PreviewCardAction } from "../components/PreviewCard";
import ApplicationWallpaperMetadata from "../components/ApplicationWallpaperMetadata";
import { useI18n } from "@/i18n";
import { RiCheckLine, RiLandscapeLine } from "@remixicon/react";

const WallpaperView: FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { personalization, setWallpaper } = useDesktopTheme();
  const currentWallpaperName = t(
    personalization.wallpaper.name ||
      (personalization.wallpaper.type === "none" ? "ui.none" : "ui.wallpaper"),
  );
  const [activeType, setActiveType] = useState<
    "gradient" | "image" | "application"
  >(() =>
    personalization.wallpaper.type === "application"
      ? "application"
      : personalization.wallpaper.type === "image"
        ? "image"
        : "gradient",
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
    () =>
      getUserWallpaperCategories({
        type: activeType === "application" ? "application" : "image",
      }),
    { ready: activeType !== "gradient", refreshDeps: [activeType] },
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
      ready: activeType !== "gradient" && imageViewMode === "category",
      refreshDeps: [
        activeType,
        imageViewMode,
        page,
        pageSize,
        resolvedCategoryId,
      ],
    },
  );

  useEffect(() => {
    setActiveCategoryId("");
    setCategoryWallpapersMap({});
    setImageViewMode("categories");
    setPage(1);
  }, [activeType]);

  useEffect(() => {
    if (activeType === "gradient") {
      setImageViewMode("categories");
      return;
    }
    if (!categoryLoading && !categoryIdList.length) {
      setImageViewMode("category");
      setActiveCategoryId("");
      return;
    }
    setActiveCategoryId((v) => v || categoryIdList[0] || "");
  }, [activeType, categoryIdList, categoryLoading]);

  useEffect(() => {
    if (activeType === "gradient") return;
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

  const renderWallpaperCard = (w: WallpaperApiItem) => {
    const previewUrl = getWallpaperPreviewUrl(w);
    const active =
      w.type === "application"
        ? isApplicationActive(w)
        : previewUrl
          ? isImageActive(previewUrl)
          : false;
    const disabled = !previewUrl;
    return (
      <PreviewCard
        key={w._id}
        active={active}
        disabled={disabled}
        title={w.name}
        description={
          w.type === "application" || w.author || w.url ? (
            <ApplicationWallpaperMetadata wallpaper={w} />
          ) : (
            w.description ||
            (previewUrl ? t("ui.imageWallpaper") : t("ui.resourceUnavailable"))
          )
        }
        action={
          previewUrl && !active ? (
            <PreviewCardAction
              onClick={() =>
                w.type === "application"
                  ? handleSelectApplication(w)
                  : handleSelectImage(w)
              }
            >
              {t("action.apply")}
            </PreviewCardAction>
          ) : null
        }
        cover={
          previewUrl ? (
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
        {activeType === "gradient" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gradientWallpaperPresets.map((w) => {
              const active = isGradientActive(w.css);
              const coverBackground =
                w.id === "none"
                  ? "linear-gradient(135deg, var(--sn-surface-secondary), var(--sn-page))"
                  : w.css;
              return (
                <PreviewCard
                  key={w.id}
                  active={active}
                  title={t(w.name)}
                  description={
                    w.id === "none"
                      ? t("ui.useDefaultBackground")
                      : t("ui.gradientBackground")
                  }
                  action={
                    active ? null : (
                      <PreviewCardAction
                        onClick={() => handleSelectGradient(w)}
                      >
                        {t("action.apply")}
                      </PreviewCardAction>
                    )
                  }
                  cover={
                    <div
                      className="grid h-full w-full place-items-center"
                      style={{ background: coverBackground }}
                    >
                      {w.id === "none" ? (
                        <span className="grid h-12 w-12 place-items-center rounded-[var(--sn-radius-surface)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] text-[var(--sn-text-tertiary)] shadow-[var(--sn-shadow)]">
                          <RiLandscapeLine size={22} />
                        </span>
                      ) : null}
                    </div>
                  }
                />
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
