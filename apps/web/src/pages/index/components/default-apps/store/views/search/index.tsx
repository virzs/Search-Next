import { AppSegmented, DefaultAppView, useAppRouteContext } from "@/components";
import {
  RiApps2Line,
  RiArrowRightUpLine,
  RiLinksLine,
} from "@remixicon/react";
import { Button, Empty, Tag } from "antd";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import WebsiteCard from "../../components/WebsiteCard";
import { storeRoute } from "../../route-paths";
import type { StoreOutletContext } from "../../index";
import { getWebsiteId } from "../../utils";

type SearchKind = "all" | "website" | "widget";

const SEARCH_KIND_OPTIONS = [
  { label: "全部", value: "all" },
  { label: "网站", value: "website" },
  { label: "小组件", value: "widget" },
];

const STATIC_WEBSITES = [
  {
    _id: "static-site-fontawesome",
    name: "Font Awesome",
    url: "https://fontawesome.com",
    description: "图标库和视觉素材资源。",
    tags: ["设计", "图标"],
  },
  {
    _id: "static-site-opencode",
    name: "OpenCode",
    url: "https://opencode.ai",
    description: "开发者代码协作与 AI 工具入口。",
    tags: ["开发", "AI"],
  },
  {
    _id: "static-site-openrouter",
    name: "OpenRouter",
    url: "https://openrouter.ai",
    description: "模型路由、API 调试和开发集成。",
    tags: ["AI", "开发"],
  },
  {
    _id: "static-site-dribbble",
    name: "Dribbble",
    url: "https://dribbble.com",
    description: "产品设计灵感和作品集平台。",
    tags: ["设计", "灵感"],
  },
];

const STATIC_WIDGETS = [
  {
    _id: "static-widget-calendar",
    name: "日历",
    description: "查看月视图、今日日程和日期偏好。",
    tags: ["工具", "日历", "iPadOS"],
    size: "2×2",
  },
  {
    _id: "static-widget-clock",
    name: "时钟",
    description: "常用城市时间和桌面时钟展示。",
    tags: ["工具", "时间"],
    size: "1×1",
  },
  {
    _id: "static-widget-todo",
    name: "待办",
    description: "桌面快速查看任务状态和今日事项。",
    tags: ["效率", "任务"],
    size: "4×2",
  },
  {
    _id: "static-widget-weather",
    name: "天气",
    description: "显示当前天气、温度和短期趋势。",
    tags: ["生活", "天气"],
    size: "2×1",
  },
];

const matchesQuery = (item: any, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    item.name,
    item.url,
    item.description,
    ...(Array.isArray(item.tags) ? item.tags : []),
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
}) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-3 px-1">
      <div>
        <div className="text-base font-extrabold tracking-normal text-gray-950 dark:text-gray-50">
          {title}
        </div>
        <div className="mt-0.5 text-xs font-semibold text-gray-500">
          {count} 个结果
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const WidgetResultCard = ({
  item,
  onAdd,
}: {
  item: (typeof STATIC_WIDGETS)[number];
  onAdd?: (widgetId: string) => void;
}) => (
  <article className="flex min-h-[112px] items-start gap-3 rounded-2xl border border-black/[0.07] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_26px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-blue-200 dark:border-white/10 dark:bg-white/[0.08]">
    <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#eef6ff,#f7f2ff)] text-blue-500 shadow-inner">
      <RiApps2Line size={22} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-extrabold tracking-normal text-gray-950 dark:text-gray-50">
        {item.name}
      </div>
      <div className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-gray-500 dark:text-gray-400">
        {item.description}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Tag className="m-0! rounded-full! border-0! bg-gray-100! text-[11px]! font-semibold! text-gray-600!">
          {item.size}
        </Tag>
        {item.tags.slice(0, 3).map((tag) => (
          <Tag
            key={tag}
            className="m-0! rounded-full! border-0! bg-gray-100! text-[11px]! font-semibold! text-gray-600!"
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
      className="h-7! shrink-0 px-4! text-xs! font-extrabold!"
      onClick={() => onAdd?.(item._id)}
    >
      获取
    </Button>
  </article>
);

const StoreSearchView = () => {
  const { query, setQuery, onAddWebsite, onAddWidget } =
    useAppRouteContext<StoreOutletContext>();
  const [kind, setKind] = useState<SearchKind>("all");
  const navigate = useNavigate();
  const normalizedQuery = query.trim();

  const websiteResults = useMemo(
    () => STATIC_WEBSITES.filter((item) => matchesQuery(item, normalizedQuery)),
    [normalizedQuery],
  );
  const widgetResults = useMemo(
    () => STATIC_WIDGETS.filter((item) => matchesQuery(item, normalizedQuery)),
    [normalizedQuery],
  );

  const showWebsites = kind === "all" || kind === "website";
  const showWidgets = kind === "all" || kind === "widget";
  const resultCount =
    (showWebsites ? websiteResults.length : 0) +
    (showWidgets ? widgetResults.length : 0);

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

  return (
    <DefaultAppView
      title={normalizedQuery ? `搜索「${normalizedQuery}」` : "搜索"}
      headerClassName="items-center px-3 pt-3 pb-2"
      headerRight={
        <AppSegmented
          options={SEARCH_KIND_OPTIONS}
          value={kind}
          onChange={(value) => setKind(value as SearchKind)}
          className="max-w-full overflow-auto"
        />
      }
      contentClassName="h-full overflow-hidden px-0 pt-0 pb-0"
    >
      <div className="h-full overflow-y-auto px-3 pb-6 pt-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          {resultCount === 0 ? (
            <div className="flex min-h-72 items-center justify-center">
              <Empty
                description={
                  normalizedQuery ? "没有找到匹配内容" : "搜索结果会显示在这里"
                }
              />
            </div>
          ) : null}

          {showWebsites && websiteResults.length > 0 ? (
            <ResultSection
              title="网站"
              count={websiteResults.length}
              action={
                <Button
                  type="text"
                  size="small"
                  icon={<RiLinksLine size={15} />}
                  onClick={() => navigateFromSearch(storeRoute.path.website.root)}
                >
                  查看网站
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {websiteResults.map((item) => (
                  <WebsiteCard
                    key={item._id}
                    item={item}
                    layout="grid"
                    variant="small"
                    onAdd={onAddWebsite ?? (() => undefined)}
                    onClick={openWebsiteDetail}
                  />
                ))}
              </div>
            </ResultSection>
          ) : null}

          {showWidgets && widgetResults.length > 0 ? (
            <ResultSection
              title="小组件"
              count={widgetResults.length}
              action={
                <Button
                  type="text"
                  size="small"
                  icon={<RiArrowRightUpLine size={15} />}
                  onClick={() => navigateFromSearch(storeRoute.path.widget)}
                >
                  查看小组件
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {widgetResults.map((item) => (
                  <WidgetResultCard
                    key={item._id}
                    item={item}
                    onAdd={onAddWidget}
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
