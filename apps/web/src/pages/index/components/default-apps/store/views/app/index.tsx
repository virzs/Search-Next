import React, { useEffect, useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { Button, Empty, Pagination, Skeleton, Spin, Tag } from "antd";
import { RiApps2Line } from "@remixicon/react";
import { AppCategoryRail, DefaultAppView } from "@/components";
import { useApp } from "@/hooks/useApp";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import type {
  AppApiItem,
  AppScreenshot,
  AppSizeConfig,
} from "@/types";
import type { StoreAddPayload } from "../../index";
import { toBackendAssetUrl } from "@/utils/utils";
import StoreHeroCard, {
  StoreHeroArtwork,
} from "../../components/StoreHeroCard";
import { css } from "@emotion/css";
import {
  getTabsAppClassifyPublicLevel1,
  getTabsAppCollectionPublicList,
  type AppCollectionPublicItem,
} from "@/services/app";
import {
  resolveAppDescription,
  resolveAppDisplayName,
  resolveAppTags,
  useI18n,
} from "@/i18n";
import { useNavigate } from "react-router";
import { storeRoute } from "../../route-paths";

type PreviewTheme = "light" | "dark";

const appViewClassName = css`
  .apple-store-get-button.ant-btn {
    border-color: var(--sn-accent) !important;
    background: var(--sn-accent) !important;
    color: #ffffff !important;
    box-shadow: none;
  }

  .apple-store-get-link.ant-btn {
    color: var(--sn-accent) !important;
  }
`;

const FALLBACK_SIZE_CONFIG: AppSizeConfig = {
  row: 2,
  col: 2,
  name: "2x2",
  id: "2x2",
};

const getPreviewTheme = (themeId?: string): PreviewTheme =>
  themeId === "dark" ? "dark" : "light";

const supportsIconMode = (app: AppApiItem) =>
  Boolean(app.configSnapshot?.supportIconMode ?? app.supportIconMode);

const supportsAppMode = (app: AppApiItem) =>
  Boolean(app.configSnapshot?.supportAppMode ?? app.supportAppMode);

const getCollectionApps = (collection: AppCollectionPublicItem) =>
  ((collection.previewApps || collection.apps || []) as AppApiItem[]).filter(
    supportsAppMode,
  );

const getPreviewSortIndex = (sizeId: string) => {
  const order = ["1x1", "2x1", "2x2", "3x2", "4x2"];
  const index = order.indexOf(sizeId);
  return index >= 0 ? index : order.length;
};

const getAppScreenshots = (app: AppApiItem): AppScreenshot[] => {
  if (app.screenshots?.length) return app.screenshots;
  const snapshotScreenshots = app.configSnapshot?.screenshots;
  return Array.isArray(snapshotScreenshots)
    ? (snapshotScreenshots as AppScreenshot[])
    : [];
};

const pickScreenshot = (
  screenshots: AppScreenshot[],
  sizeId: string,
  theme?: PreviewTheme,
) =>
  screenshots
    .filter(
      (item) =>
        item.sizeId === sizeId &&
        (!theme || getPreviewTheme(item.themeId) === theme),
    )
    .sort((a, b) => Number(b.mode === "icon") - Number(a.mode === "icon"))[0];

const parseSizeFromId = (
  sizeId: string,
): Pick<AppSizeConfig, "row" | "col"> => {
  const match = sizeId.match(/^(\d+)x(\d+)$/);
  if (!match) return { row: 2, col: 2 };
  return { col: Number(match[1]), row: Number(match[2]) };
};

const getPreviewItems = (app: AppApiItem, theme: PreviewTheme) => {
  const screenshots = getAppScreenshots(app).filter(
    (item) => item?.url && item?.sizeId,
  );
  const sizeConfigs = app.sizeConfigs?.length
    ? app.sizeConfigs
    : [FALLBACK_SIZE_CONFIG];
  const sizeConfigMap = new Map(sizeConfigs.map((item) => [item.id, item]));
  const sizeIds = Array.from(
    new Set([
      ...sizeConfigs.map((item) => item.id),
      ...screenshots.map((item) => item.sizeId),
    ]),
  );

  return sizeIds
    .sort((a, b) => {
      const configDiff =
        (sizeConfigs.findIndex((item) => item.id === a) + 1 ||
          Number.MAX_SAFE_INTEGER) -
        (sizeConfigs.findIndex((item) => item.id === b) + 1 ||
          Number.MAX_SAFE_INTEGER);
      return (
        configDiff ||
        getPreviewSortIndex(a) - getPreviewSortIndex(b) ||
        a.localeCompare(b)
      );
    })
    .map((sizeId) => {
      const screenshot =
        pickScreenshot(screenshots, sizeId, theme) ||
        pickScreenshot(screenshots, sizeId);
      const fallbackSize = parseSizeFromId(sizeId);
      const sizeConfig = sizeConfigMap.get(sizeId) ?? {
        ...fallbackSize,
        id: sizeId,
        name: sizeId,
      };
      return {
        sizeId,
        label: sizeConfig.name || sizeId,
        screenshot,
        sizeConfig,
      };
    });
};

type PreviewItem = ReturnType<typeof getPreviewItems>[number];

const getPreviewAspectRatio = (
  screenshot?: AppScreenshot,
  sizeConfig?: AppSizeConfig,
) => {
  if (screenshot?.width && screenshot.height) {
    return `${screenshot.width} / ${screenshot.height}`;
  }
  if (sizeConfig?.col && sizeConfig.row) {
    return `${sizeConfig.col} / ${sizeConfig.row}`;
  }
  return "1 / 1";
};

const getPreviewTileWidth = (item: PreviewItem) => {
  const ratio = item.sizeConfig.col / item.sizeConfig.row;
  return Math.round(Math.min(188, Math.max(108, ratio * 104)));
};

const getScreenshotUrl = (screenshot?: AppScreenshot) =>
  screenshot?.url ? toBackendAssetUrl(screenshot.url) : "";

interface AppViewProps {
  onAddStoreItem?: (payload: StoreAddPayload) => void;
  query?: string;
  variant?: "app" | "widget";
}

const AppArtwork = ({
  apps,
  getIconUrl,
}: {
  apps: AppApiItem[];
  getIconUrl: (app: AppApiItem) => string | null;
}) => (
  <div className="grid h-24 w-24 shrink-0 grid-cols-2 gap-2 rounded-[8px] bg-white/15 p-2">
    {Array.from({ length: 4 }).map((_, idx) => {
      const app = apps[idx];
      const icon = app ? getIconUrl(app) : "";
      const name = app?.name || "";
      return (
        <div
          key={idx}
          className="flex items-center justify-center overflow-hidden rounded-[7px] bg-white/85"
        >
          {icon ? (
            <img src={icon} alt={name} className="h-full w-full object-contain p-2" />
          ) : (
            <RiApps2Line className="text-xl text-[var(--sn-accent)]" />
          )}
        </div>
      );
    })}
  </div>
);

const FeaturedCollectionCard = ({
  collection,
  getIconUrl,
  onOpen,
}: {
  collection: AppCollectionPublicItem;
  getIconUrl: (app: AppApiItem) => string | null;
  onOpen: (id: string) => void;
}) => {
  const apps = getCollectionApps(collection);
  const accent = collection.accentColor || "var(--sn-accent)";
  return (
    <button
      type="button"
      onClick={() => onOpen(collection._id)}
      className="group flex min-h-[168px] w-full cursor-pointer items-end justify-between gap-5 overflow-hidden rounded-[8px] border-0 p-5 text-left shadow-[var(--sn-shadow)] transition hover:-translate-y-px active:translate-y-0"
      style={{ background: `linear-gradient(135deg, ${accent}, #111827)` }}
    >
      <div className="min-w-0 text-white">
        <div className="mb-2 text-[11px] font-bold uppercase leading-4 text-white/72">
          {collection.kicker || "App Collection"}
        </div>
        <div className="line-clamp-2 text-[24px] font-bold leading-[30px]">
          {collection.title}
        </div>
        {collection.description ? (
          <div className="mt-2 line-clamp-2 max-w-md text-sm font-semibold leading-5 text-white/74">
            {collection.description}
          </div>
        ) : null}
      </div>
      <AppArtwork apps={apps} getIconUrl={getIconUrl} />
    </button>
  );
};

const AppCompactCard = ({
  app,
  getIconUrl,
  onAdd,
}: {
  app: AppApiItem;
  getIconUrl: (app: AppApiItem) => string | null;
  onAdd: (app: AppApiItem, sizeId?: string) => void;
}) => {
  const { t, language } = useI18n();
  const displayName = resolveAppDisplayName(app, language);
  const description = resolveAppDescription(app, language);
  const iconUrl = getIconUrl(app);
  return (
    <div className="flex min-h-[76px] w-[252px] shrink-0 snap-start items-center gap-3 rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-3 shadow-[var(--sn-shadow)] max-[640px]:w-[calc(100vw-176px)]">
      <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)]">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={displayName}
            className="h-full w-full object-contain p-2.5"
          />
        ) : (
          <RiApps2Line className="text-2xl text-[var(--sn-accent)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold leading-5 text-[var(--sn-text)]">
          {displayName}
        </div>
        {description ? (
          <div className="mt-0.5 line-clamp-1 text-[12px] font-medium leading-4 text-[var(--sn-text-secondary)]">
            {description}
          </div>
        ) : null}
      </div>
      <Button
        type="primary"
        size="small"
        shape="round"
        className="apple-store-get-button h-7! shrink-0 px-3! text-xs! font-bold!"
        onClick={() => onAdd(app, app.defaultSizeId)}
      >
        {t("ui.get")}
      </Button>
    </div>
  );
};

const AppListCard = ({
  app,
  getIconUrl,
  onAdd,
}: {
  app: AppApiItem;
  getIconUrl: (app: AppApiItem) => string | null;
  onAdd: (app: AppApiItem) => void;
}) => {
  const { t, language } = useI18n();
  const displayName = resolveAppDisplayName(app, language);
  const description = resolveAppDescription(app, language);
  const tags = resolveAppTags(app, language);
  const iconUrl = getIconUrl(app);

  return (
    <article className="flex min-h-[96px] items-center gap-4 rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-4 shadow-[var(--sn-shadow)] transition hover:-translate-y-px">
      <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)]">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={displayName}
            className="h-full w-full object-contain p-3"
            loading="lazy"
          />
        ) : (
          <RiApps2Line className="text-3xl text-[var(--sn-accent)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-5 text-[var(--sn-text)]">
          {displayName}
        </div>
        {description ? (
          <div className="mt-1 line-clamp-2 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
            {description}
          </div>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#8e8e93]">
          {(tags.length ? tags.slice(0, 4) : [t("ui.app")]).map((tag) => (
            <Tag
              key={tag}
              className="m-0! rounded-full! border-0! bg-[var(--sn-surface-secondary)]! text-xs! font-medium! text-[var(--sn-text-secondary)]!"
            >
              {tag}
            </Tag>
          ))}
          {app.version ? <span>v{app.version}</span> : null}
        </div>
      </div>
      <Button
        type="primary"
        size="small"
        shape="round"
        className="apple-store-get-button h-7! shrink-0 px-4! text-xs! font-bold!"
        onClick={() => onAdd(app)}
      >
        {t("ui.get")}
      </Button>
    </article>
  );
};

const AppCard = ({
  app,
  previewTheme,
  getIconUrl,
  onAdd,
}: {
  app: AppApiItem;
  previewTheme: PreviewTheme;
  getIconUrl: (app: AppApiItem) => string | null;
  onAdd: (app: AppApiItem, sizeId?: string) => void;
}) => {
  const { t, language } = useI18n();
  const iconUrl = getIconUrl(app);
  const previewItems = getPreviewItems(app, previewTheme);
  const displayName = resolveAppDisplayName(app, language);
  const description = resolveAppDescription(app, language);
  const tags = resolveAppTags(app, language);
  const hasScreenshots = previewItems.some((item) => item.screenshot);

  return (
    <article className="overflow-hidden rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] shadow-[var(--sn-shadow)]">
      <div className="flex items-start gap-3.5 px-5 pt-5">
        <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)]">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={displayName}
              className="h-full w-full object-contain p-3"
              loading="lazy"
            />
          ) : (
            <RiApps2Line className="text-3xl text-[var(--sn-accent)]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3 max-[640px]:flex-col max-[640px]:gap-2">
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold leading-5 text-[var(--sn-text)]">
                {displayName}
              </div>
              {description ? (
                <div className="mt-1 line-clamp-2 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
                  {description}
                </div>
              ) : null}
            </div>
            <Button
              type="primary"
              size="small"
              shape="round"
              className="apple-store-get-button h-7! shrink-0 px-4! text-xs! font-bold! max-[640px]:self-start"
              onClick={() => onAdd(app, app.defaultSizeId)}
            >
              {t("ui.getApp")}
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8e8e93]">
            {(tags.length ? tags.slice(0, 4) : [t("ui.app")]).map((tag) => (
              <Tag
                key={tag}
                className="m-0! rounded-full! border-0! bg-[var(--sn-surface-secondary)]! text-xs! font-medium! text-[var(--sn-text-secondary)]!"
              >
                {tag}
              </Tag>
            ))}
            {app.version ? <span>v{app.version}</span> : null}
          </div>
        </div>
      </div>

      {hasScreenshots ? (
        <div className="mt-4 overflow-x-auto pb-5">
          <div className="flex w-max snap-x snap-mandatory gap-3 px-5">
            {previewItems.map((item) => (
              <div
                key={item.sizeId}
                className="group shrink-0 snap-start rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)] p-2 text-left transition hover:-translate-y-px hover:bg-[var(--sn-surface-strong)]"
                style={{ width: getPreviewTileWidth(item) }}
              >
                <div
                  className="flex min-h-[92px] w-full items-center justify-center overflow-hidden rounded-[7px] border border-[var(--sn-separator)] bg-[var(--sn-surface-strong)] p-2"
                  style={{
                    aspectRatio: getPreviewAspectRatio(
                      item.screenshot,
                      item.sizeConfig,
                    ),
                  }}
                >
                  {item.screenshot ? (
                    <img
                      src={getScreenshotUrl(item.screenshot)}
                      alt={`${displayName} ${item.label}`}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <RiApps2Line className="text-2xl text-gray-400" />
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] font-semibold text-[var(--sn-text)]">
                    {item.label}
                  </span>
                  <Button
                    type="link"
                    size="small"
                    className="apple-store-get-link h-5! px-0! text-[11px]! font-bold!"
                    aria-label={t("ui.addNameLabel", {
                      name: displayName,
                      label: item.label,
                    })}
                    onClick={() => onAdd(app, item.sizeId)}
                  >
                    {t("ui.addWidgetSize", { size: item.label })}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5 pt-4">
          <div className="flex h-24 w-full items-center justify-center rounded-[8px] border border-dashed border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)] text-[13px] font-medium text-[var(--sn-text-secondary)]">
            <span>{app.defaultSizeId || "2x2"}</span>
            <Button
              type="link"
              className="apple-store-get-link ml-2 px-0! font-bold!"
              onClick={() => onAdd(app, app.defaultSizeId)}
            >
              {t("ui.get")}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
};

const AppGridSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="grid grid-cols-1 gap-3">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="rounded-[8px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-5"
      >
        <Skeleton active avatar paragraph={{ rows: 3 }} />
      </div>
    ))}
  </div>
);

const AppFeaturedView = ({
  collectionItems,
  collectionListLoading,
  getIconUrl,
  onOpenCollection,
  onAdd,
}: {
  collectionItems: AppCollectionPublicItem[];
  collectionListLoading: boolean;
  getIconUrl: (app: AppApiItem) => string | null;
  onOpenCollection: (collectionId: string) => void;
  onAdd: (app: AppApiItem, sizeId?: string) => void;
}) => {
  const { t, language } = useI18n();
  const appCollections = collectionItems.filter(
    (collection) => getCollectionApps(collection).length > 0,
  );
  const featuredCollections = appCollections
    .filter((item) => item.featured)
    .slice(0, 2);
  const normalCollections = appCollections.filter(
    (item) => !featuredCollections.some((c) => c._id === item._id),
  );
  const heroApps = appCollections.flatMap(getCollectionApps).slice(0, 4);

  return (
    <div className="h-full overflow-y-auto px-4 pb-8 pt-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <StoreHeroCard
          title={t("ui.desktopInfoAtAGlance")}
          description={t("ui.store.appHeroDescription")}
          tone="app"
          artwork={
            <StoreHeroArtwork
              items={heroApps.map((app) => ({
                src: getIconUrl(app),
                label: resolveAppDisplayName(app, language),
              }))}
            />
          }
        />

        {collectionListLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Spin />
          </div>
        ) : null}

        {!collectionListLoading && appCollections.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center">
            <Empty description={t("ui.noCollections")} />
          </div>
        ) : null}

        {featuredCollections.length ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {featuredCollections.map((collection) => (
              <FeaturedCollectionCard
                key={collection._id}
                collection={collection}
                getIconUrl={getIconUrl}
                onOpen={onOpenCollection}
              />
            ))}
          </div>
        ) : null}

        {normalCollections.map((collection) => {
          const apps = getCollectionApps(collection);
          return (
            <section key={collection._id}>
              <div className="mb-3 flex items-end justify-between gap-3 px-1">
                <div className="min-w-0">
                  {collection.kicker ? (
                    <div className="mb-1 text-[11px] font-bold uppercase leading-4 text-[var(--sn-accent)]">
                      {collection.kicker}
                    </div>
                  ) : null}
                  <div className="line-clamp-1 text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">
                    {collection.title}
                  </div>
                  <div className="mt-1 line-clamp-1 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
                    {collection.description ||
                      t("ui.storeItemCount", {
                        count: collection.total ?? apps.length,
                      })}
                  </div>
                </div>
                <Button
                  type="link"
                  className="px-0! font-semibold! text-[var(--sn-accent)]!"
                  onClick={() => onOpenCollection(collection._id)}
                >
                  {t("ui.viewMore")}
                </Button>
              </div>
              <div className="-mx-1 flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto overflow-y-hidden px-1 pb-2">
                {apps.map((app) => (
                  <AppCompactCard
                    key={app._id}
                    app={app}
                    getIconUrl={getIconUrl}
                    onAdd={onAdd}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

const AppView: React.FC<AppViewProps> = ({
  onAddStoreItem,
  query,
  variant = "app",
}) => {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const isWidgetView = variant === "widget";
  const { resolvedColorScheme } = useDesktopTheme();
  const {
    refresh,
    getIconUrl,
    apps: allApps,
    loading: appLoading,
  } = useApp();
  const previewTheme: PreviewTheme =
    resolvedColorScheme === "dark" ? "dark" : "light";
  const [activeView, setActiveView] = useState<string>(
    variant === "app" ? "featured" : "all",
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: collectionListData,
    loading: collectionListLoading,
    run: runCollectionList,
  } = useRequest(getTabsAppCollectionPublicList, { manual: true });
  const { data: classifyLevel1Data, run: runClassifyLevel1 } = useRequest(
    getTabsAppClassifyPublicLevel1,
    { manual: true },
  );

  const visibleApps = useMemo(
    () =>
      (allApps ?? []).filter((app) =>
        isWidgetView ? supportsIconMode(app) : supportsAppMode(app),
      ),
    [allApps, isWidgetView],
  );

  const categories = useMemo(() => {
    const fromApi = ((classifyLevel1Data as any[]) || [])
      .filter((c) => c?._id && c?.name)
      .map((c) => ({
        key: c._id,
        label: c.name,
        count: visibleApps.filter((item) => item.classify?._id === c._id)
          .length,
      }));
    const map = new Map(fromApi.map((item) => [item.key, item]));
    for (const app of visibleApps) {
      const classify = app.classify;
      if (!classify?._id || !classify?.name || map.has(classify._id)) continue;
      map.set(classify._id, {
        key: classify._id,
        label: classify.name,
        count: visibleApps.filter((item) => item.classify?._id === classify._id)
          .length,
      });
    }
    return Array.from(map.values()).filter((item) => (item.count ?? 0) > 0);
  }, [classifyLevel1Data, visibleApps]);

  const activeCategory = useMemo(() => {
    if (!activeView.startsWith("cat:")) return null;
    const key = activeView.slice("cat:".length);
    return categories.find((c) => c.key === key) || null;
  }, [activeView, categories]);

  const filteredListItems = useMemo(() => {
    const q = query?.trim().toLowerCase() || "";
    return visibleApps.filter((app) => {
      if (activeCategory?.key && app.classify?._id !== activeCategory.key) {
        return false;
      }
      if (!q) return true;
      const displayName = resolveAppDisplayName(app, language);
      const description = resolveAppDescription(app, language);
      const tags = resolveAppTags(app, language);
      const haystack = [
        displayName,
        app.name,
        description,
        app.description,
        app.author,
        app.version,
        app.classify?.name,
        ...tags,
        ...(app.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory?.key, language, query, visibleApps]);
  const listTotal = filteredListItems.length;
  const listItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredListItems.slice(start, start + pageSize);
  }, [filteredListItems, page, pageSize]);
  const widgetHeroItems = useMemo(
    () =>
      visibleApps.slice(0, 4).map((app) => {
        const preview = getPreviewItems(app, previewTheme).find(
          (item) => item.screenshot,
        );
        return {
          src: preview?.screenshot
            ? getScreenshotUrl(preview.screenshot)
            : getIconUrl(app),
          label: resolveAppDisplayName(app, language),
        };
      }),
    [getIconUrl, language, previewTheme, visibleApps],
  );
  const listLoading = appLoading;
  const collectionItems = useMemo(
    () => ((collectionListData as any[]) || []) as AppCollectionPublicItem[],
    [collectionListData],
  );

  useEffect(() => {
    void refresh();
    runClassifyLevel1({});
  }, [refresh, runClassifyLevel1]);

  useEffect(() => {
    if (isWidgetView || activeView !== "featured") return;
    runCollectionList({});
  }, [activeView, isWidgetView, runCollectionList]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory?.key, query]);

  const viewOptions = useMemo(() => {
    const options: { label: string; value: string }[] = isWidgetView
      ? [{ label: t("ui.all"), value: "all" }]
      : [
          { label: t("ui.featured"), value: "featured" },
          { label: t("ui.all"), value: "all" },
        ];
    for (const cat of categories) {
      options.push({ label: cat.label, value: `cat:${cat.key}` });
    }
    return options;
  }, [categories, isWidgetView, t]);

  const handleViewChange = (value: string | number) => {
    setActiveView(String(value));
    setPage(1);
  };

  const handleAdd = (app: AppApiItem, sizeId?: string) => {
    if (!supportsIconMode(app) && supportsAppMode(app)) {
      onAddStoreItem?.({ kind: "app", appId: app._id });
      return;
    }
    onAddStoreItem?.({ kind: "app", appId: app._id, sizeId });
  };

  const handleAddApp = (app: AppApiItem) => {
    onAddStoreItem?.({ kind: "app", appId: app._id });
  };

  const openCollection = (collectionId: string) => {
    navigate(storeRoute.path.appCollection(collectionId));
  };

  return (
    <DefaultAppView
      className={appViewClassName}
      contentClassName="flex h-full flex-col overflow-hidden px-0 pt-0 pb-0"
    >
      <div className="shrink-0 px-4 pb-2 pt-3">
        <AppCategoryRail
          options={viewOptions}
          value={activeView}
          onChange={handleViewChange}
          ariaLabel={t("ui.categories")}
          previousLabel={t("ui.previousCategories")}
          nextLabel={t("ui.nextCategories")}
        />
      </div>
      {!isWidgetView && activeView === "featured" ? (
        <div className="min-h-0 flex-1">
          <AppFeaturedView
            collectionItems={collectionItems}
            collectionListLoading={collectionListLoading}
            getIconUrl={getIconUrl}
            onOpenCollection={openCollection}
            onAdd={handleAddApp}
          />
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
            <div className="mx-auto w-full max-w-6xl">
              {isWidgetView ? (
                <StoreHeroCard
                  title={t("ui.desktopInfoAtAGlance")}
                  description={t("ui.store.widgetHeroDescription")}
                  tone="widget"
                  artwork={<StoreHeroArtwork items={widgetHeroItems} />}
                  className="mb-6"
                />
              ) : null}

              <div className="mb-4 px-1">
                <div className="text-[28px] font-bold leading-[34px] text-[var(--sn-text)]">
                  {activeCategory?.label ??
                    t(isWidgetView ? "ui.allWidgets" : "ui.allApps")}
                </div>
                <div className="mt-1 text-[13px] font-medium leading-5 text-[var(--sn-text-secondary)]">
                  {t("ui.storeItemCount", { count: listTotal })}
                </div>
              </div>

              {listLoading && listItems.length === 0 ? (
                <AppGridSkeleton count={Math.min(6, pageSize)} />
              ) : null}

              {!listLoading && listItems.length === 0 ? (
                <div className="flex min-h-80 items-center justify-center">
                  <Empty
                    description={t(
                      query
                        ? isWidgetView
                          ? "ui.noMatchingWidgets"
                          : "ui.noMatchingApps"
                        : isWidgetView
                          ? "ui.noWidgetsAvailable"
                          : "ui.noAppsAvailable",
                    )}
                  />
                </div>
              ) : null}

              {listItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {listItems.map((app) => (
                    isWidgetView ? (
                      <AppCard
                        key={app._id}
                        app={app}
                        previewTheme={previewTheme}
                        getIconUrl={getIconUrl}
                        onAdd={handleAdd}
                      />
                    ) : (
                      <AppListCard
                        key={app._id}
                        app={app}
                        getIconUrl={getIconUrl}
                        onAdd={handleAddApp}
                      />
                    )
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {listTotal > pageSize ? (
          <div className="shrink-0 border-t border-[var(--sn-separator)] px-4 pb-4 pt-3">
            <Pagination
              size="small"
              current={page}
              pageSize={pageSize}
              total={listTotal}
              showSizeChanger
              pageSizeOptions={[10, 20, 40, 80]}
              onChange={(p, ps) => {
                setPage(p);
                if (ps !== pageSize) setPageSize(ps);
              }}
              disabled={listLoading}
              className="flex justify-end"
            />
          </div>
          ) : null}
        </div>
      )}
    </DefaultAppView>
  );
};

export default AppView;
