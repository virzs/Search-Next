import { AppSegmented, DefaultAppView, useAppRouteContext } from "@/components";
import {
  RiApps2Line,
  RiArrowRightUpLine,
  RiLinksLine,
} from "@remixicon/react";
import { Button, Empty, Spin, Tag } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import WebsiteCard from "../../components/WebsiteCard";
import { storeRoute } from "../../route-paths";
import type { StoreOutletContext } from "../../index";
import { getWebsiteId } from "../../utils";
import { useRequest } from "ahooks";
import { getTabsWebsitePublic } from "@/services/website";
import { useWidget } from "@/hooks/useWidget";
import type { WidgetApiItem } from "@/types";
import { css } from "@emotion/css";
import { useI18n } from "@/i18n";

type SearchKind = "all" | "website" | "app" | "widget";

const SEARCH_KIND_OPTIONS = [
  { label: "ui.all", value: "all" },
  { label: "ui.websites", value: "website" },
  { label: "ui.app", value: "app" },
  { label: "ui.widget", value: "widget" },
];

const SEARCH_PAGE_SIZE = 12;

const storeSearchClassName = css`
  .apple-store-get-button.ant-btn {
    border-color: #007aff !important;
    background: #007aff !important;
    color: #ffffff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }

  .apple-link.ant-btn-text {
    color: #007aff !important;
  }
`;

const toTagLabel = (tag: unknown) => {
  if (typeof tag === "string") return tag;
  if (tag && typeof tag === "object") {
    const record = tag as Record<string, unknown>;
    return String(record.name ?? record.title ?? record.label ?? "");
  }
  return "";
};

const getWidgetTags = (item: WidgetApiItem) => {
  const tags = item.configSnapshot?.tags ?? item.tags ?? [];
  return tags.map(toTagLabel).filter(Boolean);
};

const getWidgetDefaultSizeId = (item: WidgetApiItem) =>
  item.configSnapshot?.defaultSizeId ??
  item.defaultSizeId ??
  item.sizeConfigs?.[0]?.id ??
  "2x2";

const supportsAppMode = (item: WidgetApiItem) =>
  Boolean(item.configSnapshot?.supportAppMode ?? item.supportAppMode);

const supportsIconMode = (item: WidgetApiItem) =>
  Boolean(item.configSnapshot?.supportIconMode ?? item.supportIconMode);

const matchesQuery = (item: any, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const haystack = [
    item.name,
    item.url,
    item.description,
    item.author,
    item.version,
    item.classify?.name,
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
          <div className="text-base font-extrabold tracking-normal text-gray-950 dark:text-gray-50">
            {t(title)}
          </div>
          <div className="mt-0.5 text-xs font-semibold text-gray-500">
            {t("ui.countResults", { count })}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
};

const WidgetResultCard = ({
  item,
  iconUrl,
  onAdd,
}: {
  item: WidgetApiItem;
  iconUrl?: string | null;
  onAdd?: (widget: WidgetApiItem, sizeId?: string) => void;
}) => {
  const { t } = useI18n();
  return (
  <article className="flex min-h-[112px] items-start gap-3.5 rounded-[20px] border border-white/80 bg-white/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_34px_rgba(15,23,42,0.055),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.08]">
    <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[15px] bg-[#f2f2f7] text-[#007aff] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_1px_2px_rgba(0,0,0,0.08)]">
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={item.name}
          className="h-full w-full object-contain p-2.5"
          loading="lazy"
        />
      ) : (
        <RiApps2Line size={22} />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-extrabold tracking-normal text-gray-950 dark:text-gray-50">
        {item.name}
      </div>
      <div className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-gray-500 dark:text-gray-400">
        {item.description}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Tag className="m-0! rounded-full! border-0! bg-[#f2f2f7]! text-[11px]! font-semibold! text-[#6e6e73]!">
          {getWidgetDefaultSizeId(item)}
        </Tag>
        {getWidgetTags(item)
          .slice(0, 3)
          .map((tag) => (
            <Tag
              key={tag}
              className="m-0! rounded-full! border-0! bg-[#f2f2f7]! text-[11px]! font-semibold! text-[#6e6e73]!"
            >
              {tag}
            </Tag>
          ))}
      </div>
    </div>
    <Button
      type="primary"
      size="small"
      shape="round"
      className="apple-store-get-button h-7! shrink-0 px-4! text-xs! font-bold!"
      onClick={() => onAdd?.(item, getWidgetDefaultSizeId(item))}
    >
      {t("ui.get")}
    </Button>
  </article>
  );
};

const AppResultCard = ({
  item,
  iconUrl,
  onAdd,
}: {
  item: WidgetApiItem;
  iconUrl?: string | null;
  onAdd?: (widget: WidgetApiItem) => void;
}) => {
  const { t } = useI18n();
  return (
  <article className="flex min-h-[112px] items-start gap-3.5 rounded-[20px] border border-white/80 bg-white/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_34px_rgba(15,23,42,0.055),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.08]">
    <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#f2f2f7] text-[#007aff] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_1px_2px_rgba(0,0,0,0.08)]">
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={item.name}
          className="h-full w-full object-contain p-2.5"
          loading="lazy"
        />
      ) : (
        <RiApps2Line size={22} />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-extrabold tracking-normal text-gray-950 dark:text-gray-50">
        {item.name}
      </div>
      <div className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-gray-500 dark:text-gray-400">
        {item.description}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Tag className="m-0! rounded-full! border-0! bg-[#f2f2f7]! text-[11px]! font-semibold! text-[#6e6e73]!">
          {t("ui.app")}
        </Tag>
        {getWidgetTags(item)
          .slice(0, 3)
          .map((tag) => (
            <Tag
              key={tag}
              className="m-0! rounded-full! border-0! bg-[#f2f2f7]! text-[11px]! font-semibold! text-[#6e6e73]!"
            >
              {tag}
            </Tag>
          ))}
      </div>
    </div>
    <Button
      type="primary"
      size="small"
      shape="round"
      className="apple-store-get-button h-7! shrink-0 px-4! text-xs! font-bold!"
      onClick={() => onAdd?.(item)}
    >
      {t("ui.get")}
    </Button>
  </article>
  );
};

const StoreSearchView = () => {
  const { t } = useI18n();
  const { query, setQuery, onAddStoreItem } =
    useAppRouteContext<StoreOutletContext>();
  const {
    widgets,
    devWidgets,
    devModeEnabled,
    loading: widgetLoading,
    getIconUrl,
    getAppIconUrl,
  } = useWidget();
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

  const searchableWidgets = useMemo<WidgetApiItem[]>(() => {
    const backendWidgets = widgets ?? [];
    const localDevWidgets = devModeEnabled
      ? devWidgets.map(
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
            }) as WidgetApiItem,
        )
      : [];
    return [...backendWidgets, ...localDevWidgets];
  }, [devModeEnabled, devWidgets, widgets]);

  const widgetResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return searchableWidgets
      .filter(supportsIconMode)
      .filter((item) => matchesQuery(item, normalizedQuery))
      .slice(0, SEARCH_PAGE_SIZE);
  }, [normalizedQuery, searchableWidgets]);

  const appResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return (widgets ?? [])
      .filter(supportsAppMode)
      .filter((item) => matchesQuery(item, normalizedQuery))
      .slice(0, SEARCH_PAGE_SIZE);
  }, [normalizedQuery, widgets]);

  const resultCount =
    (showWebsites ? websiteResults.length : 0) +
    (showApps ? appResults.length : 0) +
    (showWidgets ? widgetResults.length : 0);
  const searching =
    Boolean(normalizedQuery) &&
    ((showWebsites && websiteLoading) ||
      ((showApps || showWidgets) && widgetLoading));

  const openWebsiteDetail = (item: any) => {
    setQuery("");
    navigate(storeRoute.path.website.detail(getWebsiteId(item)), {
      state: { item },
    });
  };

  const navigateFromSearch = (path: string) => {
    setQuery("");
    navigate(path);
  };

  const handleAddWidget = (item: WidgetApiItem, sizeId?: string) => {
    onAddStoreItem?.({ kind: "widget", widgetId: item._id, sizeId });
  };

  const handleAddApp = (item: WidgetApiItem) => {
    onAddStoreItem?.({ kind: "app", widgetId: item._id });
  };

  return (
    <DefaultAppView
      className={storeSearchClassName}
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
                <Button
                  type="text"
                  size="small"
                  icon={<RiLinksLine size={15} />}
                  className="apple-link"
                  onClick={() => navigateFromSearch(storeRoute.path.website.root)}
                >
                  {t("ui.viewWebsites")}
                </Button>
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

          {(showApps || showWidgets) && widgetLoading ? (
            <div className="flex min-h-32 items-center justify-center">
              <Spin />
            </div>
          ) : null}

          {showApps && appResults.length > 0 ? (
            <ResultSection
              title={t("ui.app")}
              count={appResults.length}
              action={
                <Button
                  type="text"
                  size="small"
                  icon={<RiArrowRightUpLine size={15} />}
                  className="apple-link"
                  onClick={() => navigateFromSearch(storeRoute.path.app)}
                >
                  {t("ui.viewApps")}
                </Button>
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
              title={t("ui.widget")}
              count={widgetResults.length}
              action={
                <Button
                  type="text"
                  size="small"
                  icon={<RiArrowRightUpLine size={15} />}
                  className="apple-link"
                  onClick={() => navigateFromSearch(storeRoute.path.widget)}
                >
                  {t("ui.viewWidgets")}
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {widgetResults.map((item) => (
                  <WidgetResultCard
                    key={item._id}
                    item={item}
                    iconUrl={getIconUrl(item)}
                    onAdd={handleAddWidget}
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
