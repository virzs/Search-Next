import { AppSegmented, DefaultAppView, useAppRouteContext } from "@/components";
import { AppButton } from "@/components/ui";
import {
  RiApps2Line,
  RiArrowRightUpLine,
  RiLinksLine,
} from "@remixicon/react";
import { Empty, Spin, Tag } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import WebsiteCard from "../../components/WebsiteCard";
import { storeRoute } from "../../route-paths";
import type { StoreOutletContext } from "../../index";
import { getWebsiteId } from "../../utils";
import { useRequest } from "ahooks";
import { getTabsWebsitePublic } from "@/services/website";
import { useApp } from "@/hooks/useApp";
import type { AppApiItem } from "@/types";
import {
  resolveAppDescription,
  resolveAppDisplayName,
  resolveAppTags,
  useI18n,
} from "@/i18n";
import StoreGetButton from "../../components/StoreGetButton";

type SearchKind = "all" | "website" | "app" | "widget";

const SEARCH_KIND_OPTIONS = [
  { label: "ui.all", value: "all" },
  { label: "ui.websites", value: "website" },
  { label: "ui.app", value: "app" },
  { label: "ui.widgets", value: "widget" },
];

const SEARCH_PAGE_SIZE = 12;

const toTagLabel = (tag: unknown) => {
  if (typeof tag === "string") return tag;
  if (tag && typeof tag === "object") {
    const record = tag as Record<string, unknown>;
    return String(record.name ?? record.title ?? record.label ?? "");
  }
  return "";
};

const getAppTags = (item: AppApiItem, language: "zh-CN" | "en-US") => {
  const tags = resolveAppTags(item, language);
  return tags.map(toTagLabel).filter(Boolean);
};

const getAppDefaultSizeId = (item: AppApiItem) =>
  item.configSnapshot?.defaultSizeId ??
  item.defaultSizeId ??
  item.sizeConfigs?.[0]?.id ??
  "2x2";

const supportsAppMode = (item: AppApiItem) =>
  Boolean(item.configSnapshot?.supportAppMode ?? item.supportAppMode);

const supportsIconMode = (item: AppApiItem) =>
  Boolean(item.configSnapshot?.supportIconMode ?? item.supportIconMode);

const matchesQuery = (item: any, query: string, language: "zh-CN" | "en-US") => {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const displayName = resolveAppDisplayName(item, language);
  const description = resolveAppDescription(item, language);
  const tags = getAppTags(item, language);
  const haystack = [
    displayName,
    item.name,
    description,
    item.url,
    item.description,
    item.author,
    item.version,
    item.classify?.name,
    ...tags,
    ...(Array.isArray(item.tags) ? item.tags.map(toTagLabel) : []),
    ...(Array.isArray(item.configSnapshot?.tags)
      ? item.configSnapshot.tags.map(toTagLabel)
      : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
};

const ResultSection = ({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count: number;
  action?: ReactNode;
  children: ReactNode;
}) => {
  const { t } = useI18n();
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <div className="text-[17px] font-semibold leading-[22px] tracking-normal text-[var(--sn-text)]">
            {t(title)}
          </div>
          <div className="mt-0.5 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
            {t("ui.countResults", { count })}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
};

const AppResultCard = ({
  item,
  iconUrl,
  onAdd,
  showSize = false,
}: {
  item: AppApiItem;
  iconUrl?: string | null;
  showSize?: boolean;
  onAdd?: (app: AppApiItem, sizeId?: string) => void;
}) => {
  const { t, language } = useI18n();
  const displayName = resolveAppDisplayName(item, language);
  const description = resolveAppDescription(item, language);
  const tags = getAppTags(item, language);
  return (
    <article className="flex min-h-[112px] items-start gap-3.5 rounded-[var(--sn-radius-surface)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-4 shadow-[var(--sn-shadow)] transition hover:-translate-y-px hover:bg-[var(--sn-surface-strong)]">
      <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--sn-radius-control)] bg-[var(--sn-surface-secondary)] text-[var(--sn-accent)]">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={displayName}
            className="h-full w-full object-contain p-2.5"
            loading="lazy"
          />
        ) : (
          <RiApps2Line size={22} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold leading-5 tracking-normal text-[var(--sn-text)]">
          {displayName}
        </div>
        <div className="mt-1 line-clamp-2 text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
          {description || t("ui.app")}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {showSize ? (
            <Tag className="m-0! border-0! bg-[var(--sn-surface-secondary)]! text-[11px]! font-medium! text-[var(--sn-text-secondary)]!">
              {getAppDefaultSizeId(item)}
            </Tag>
          ) : null}
          {tags.slice(0, 3).map((tag) => (
            <Tag
              key={tag}
              className="m-0! border-0! bg-[var(--sn-surface-secondary)]! text-[11px]! font-medium! text-[var(--sn-text-secondary)]!"
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>
      <StoreGetButton
        onClick={() =>
          onAdd?.(
            item,
            showSize ? getAppDefaultSizeId(item) : undefined,
          )
        }
      >
        {t("ui.get")}
      </StoreGetButton>
    </article>
  );
};

const StoreSearchView = () => {
  const { t, language } = useI18n();
  const { query, setQuery, onAddStoreItem } =
    useAppRouteContext<StoreOutletContext>();
  const {
    apps,
    devApps,
    devModeEnabled,
    loading: appLoading,
    getAppIconUrl,
  } = useApp();
  const [kind, setKind] = useState<SearchKind>("all");
  const searchKindOptions = useMemo(
    () =>
      SEARCH_KIND_OPTIONS.map((option) => ({
        ...option,
        label: t(option.label),
      })),
    [t],
  );
  const navigate = useNavigate();
  const normalizedQuery = query.trim();
  const showWebsites = kind === "all" || kind === "website";
  const showApps = kind === "all" || kind === "app";
  const showWidgets = kind === "all" || kind === "widget";
  const shouldSearchWebsites = showWebsites && Boolean(normalizedQuery);

  const {
    data: websiteData,
    loading: websiteLoading,
    run: runWebsiteSearch,
  } = useRequest(getTabsWebsitePublic, { manual: true });

  useEffect(() => {
    if (!shouldSearchWebsites) return;
    runWebsiteSearch({
      page: 1,
      pageSize: SEARCH_PAGE_SIZE,
      search: normalizedQuery,
    });
  }, [normalizedQuery, runWebsiteSearch, shouldSearchWebsites]);

  const websiteResults = useMemo(() => {
    if (!normalizedQuery) return [];
    const data = websiteData as any;
    if (Array.isArray(data)) return data;
    return (data?.data as any[]) ?? [];
  }, [normalizedQuery, websiteData]);

  const websiteTotal = useMemo(() => {
    const data = websiteData as any;
    return data?.total ?? data?.count ?? websiteResults.length;
  }, [websiteData, websiteResults.length]);

  const searchableApps = useMemo<AppApiItem[]>(() => {
    const backendApps = apps ?? [];
    const localDevApps = devModeEnabled
      ? devApps.map(
          (item) =>
            ({
              _id: item.id,
              name: item.name,
              description: item.entry,
              entryFileName: "",
              enable: true,
              sizeConfigs: item.sizeConfigs,
              defaultSizeId: item.defaultSizeId,
              supportIconMode: false,
              supportAppMode: false,
              tags: ["Developer"],
              sortOrder: 0,
            }) as AppApiItem,
        )
      : [];
    return [...backendApps, ...localDevApps];
  }, [devModeEnabled, devApps, apps]);

  const appResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return searchableApps
      .filter(
        (item) =>
          supportsAppMode(item) && matchesQuery(item, normalizedQuery, language),
      )
      .slice(0, SEARCH_PAGE_SIZE);
  }, [language, normalizedQuery, searchableApps]);

  const widgetResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return searchableApps
      .filter(
        (item) =>
          supportsIconMode(item) &&
          matchesQuery(item, normalizedQuery, language),
      )
      .slice(0, SEARCH_PAGE_SIZE);
  }, [language, normalizedQuery, searchableApps]);

  const resultCount =
    (showWebsites ? websiteResults.length : 0) +
    (showApps ? appResults.length : 0) +
    (showWidgets ? widgetResults.length : 0);
  const searching =
    Boolean(normalizedQuery) &&
    ((showWebsites && websiteLoading) ||
      ((showApps || showWidgets) && appLoading));

  const openWebsiteDetail = (item: any) => {
    setQuery("");
    navigate(storeRoute.path.website.detail(getWebsiteId(item)), {
      state: { item },
    });
  };

  const navigateFromSearch = (path: string) => {
    navigate(path);
  };

  const handleAddApp = (item: AppApiItem, sizeId?: string) => {
    onAddStoreItem?.({ kind: "app", appId: item._id, sizeId });
  };

  return (
    <DefaultAppView
      title={
        normalizedQuery
          ? t("ui.searchQuery", { query: normalizedQuery })
          : t("ui.search")
      }
      headerClassName="items-center px-3 pt-3 pb-2"
      headerRight={
        <AppSegmented
          options={searchKindOptions}
          value={kind}
          onChange={(value) => setKind(value as SearchKind)}
          className="max-w-full overflow-auto"
        />
      }
      contentClassName="h-full overflow-hidden px-0 pt-0 pb-0"
    >
      <div className="h-full overflow-y-auto px-4 pb-8 pt-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          {!normalizedQuery ? (
            <div className="flex min-h-72 items-center justify-center">
              <Empty description={t("ui.enterKeywordsToShowRealStoreResults")} />
            </div>
          ) : null}

          {normalizedQuery && resultCount === 0 && !searching ? (
            <div className="flex min-h-72 items-center justify-center">
              <Empty description={t("ui.noMatchingContentFound")} />
            </div>
          ) : null}

          {showWebsites && websiteLoading ? (
            <div className="flex min-h-32 items-center justify-center">
              <Spin />
            </div>
          ) : null}

          {showWebsites && websiteResults.length > 0 ? (
            <ResultSection
              title={t("ui.websites")}
              count={websiteTotal}
              action={
                <AppButton
                  intent="quiet"
                  size="small"
                  icon={<RiLinksLine size={15} />}
                  className="text-[var(--sn-accent)]!"
                  onClick={() => navigateFromSearch(storeRoute.path.website.root)}
                >
                  {t("ui.viewWebsites")}
                </AppButton>
              }
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {websiteResults.map((item) => (
                  <WebsiteCard
                    key={getWebsiteId(item)}
                    item={item}
                    layout="grid"
                    variant="small"
                    onAdd={(site) =>
                      onAddStoreItem?.({ kind: "website", site })
                    }
                    onClick={openWebsiteDetail}
                  />
                ))}
              </div>
            </ResultSection>
          ) : null}

          {showApps && appLoading ? (
            <div className="flex min-h-32 items-center justify-center">
              <Spin />
            </div>
          ) : null}

          {showApps && appResults.length > 0 ? (
            <ResultSection
              title={t("ui.app")}
              count={appResults.length}
              action={
                <AppButton
                  intent="quiet"
                  size="small"
                  icon={<RiArrowRightUpLine size={15} />}
                  className="text-[var(--sn-accent)]!"
                  onClick={() => navigateFromSearch(storeRoute.path.app)}
                >
                  {t("ui.viewApps")}
                </AppButton>
              }
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {appResults.map((item) => (
                  <AppResultCard
                    key={item._id}
                    item={item}
                    iconUrl={getAppIconUrl(item)}
                    onAdd={handleAddApp}
                  />
                ))}
              </div>
            </ResultSection>
          ) : null}

          {showWidgets && widgetResults.length > 0 ? (
            <ResultSection
              title={t("ui.widgets")}
              count={widgetResults.length}
              action={
                <AppButton
                  intent="quiet"
                  size="small"
                  icon={<RiArrowRightUpLine size={15} />}
                  className="text-[var(--sn-accent)]!"
                  onClick={() => navigateFromSearch(storeRoute.path.widget)}
                >
                  {t("ui.viewWidgets")}
                </AppButton>
              }
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {widgetResults.map((item) => (
                  <AppResultCard
                    key={item._id}
                    item={item}
                    iconUrl={getAppIconUrl(item)}
                    showSize
                    onAdd={handleAddApp}
                  />
                ))}
              </div>
            </ResultSection>
          ) : null}

        </div>
      </div>
    </DefaultAppView>
  );
};

export default StoreSearchView;
