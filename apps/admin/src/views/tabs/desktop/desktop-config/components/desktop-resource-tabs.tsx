import {
  Descriptions,
  Empty,
  Input,
  Modal,
  Pagination,
  Spin,
  Tabs,
  Tooltip,
} from "antd";
import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  RiApps2Line,
  RiGlobalLine,
  RiLayoutGridLine,
} from "@remixicon/react";
import {
  buildAppLauncherDesktopItem,
  buildSizedAppDesktopItem,
  buildWebsiteDesktopItem,
  getAppIconUrl as getDesktopAppIconUrl,
  type DesktopItemData,
  type DesktopSortItem,
} from "@search-next/desktop";
import { useTablePage } from "@/hooks/useTablePage2";
import { getApp, type AppItem } from "@/services/tabs/app";
import { getWebsiteList } from "@/services/tabs/website";
import type { Website } from "@/services/tabs/website_classifty";
import { toBackendAssetUrl } from "./desktop-assets";

export interface DesktopResourceTabsProps {
  onResourceDragStart: (
    event: DragEvent<HTMLElement>,
    item: DesktopSortItem<DesktopItemData>,
  ) => void;
  onResourceDragEnd: () => void;
  onAddItem: (item: DesktopSortItem<DesktopItemData>) => void;
}

const supportsAppMode = (item: AppItem) =>
  Boolean(
    (item.configSnapshot?.supportAppMode as boolean | undefined) ??
      item.supportAppMode,
  );

const supportsIconMode = (item: AppItem) =>
  Boolean(
    (item.configSnapshot?.supportIconMode as boolean | undefined) ??
      item.supportIconMode,
  );

const getSizeConfigs = (item: AppItem) => {
  const snapshotSizeConfigs = Array.isArray(item.configSnapshot?.sizeConfigs)
    ? item.configSnapshot.sizeConfigs
    : undefined;
  const sizeConfigs = snapshotSizeConfigs?.length
    ? snapshotSizeConfigs
    : item.sizeConfigs;
  return sizeConfigs?.length
    ? sizeConfigs
    : [{ row: 2, col: 2, name: "2x2", id: "2x2" }];
};

const getDefaultSizeId = (item: AppItem) => {
  const snapshotDefaultSizeId =
    typeof item.configSnapshot?.defaultSizeId === "string"
      ? item.configSnapshot.defaultSizeId
      : undefined;
  return (
    snapshotDefaultSizeId ||
    item.defaultSizeId ||
    getSizeConfigs(item)[0]?.id ||
    "2x2"
  );
};

const getItemKey = (item: Pick<AppItem, "_id"> | Pick<Website, "_id">) =>
  item._id || uuidv4();

const getDetailText = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === "") return undefined;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    const text = value
      .map((item) => getDetailText(item))
      .filter(Boolean)
      .join(" / ");
    return text || undefined;
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return getDetailText(record.name ?? record.title ?? record.label);
  }
  return undefined;
};

const websiteResourceParams = { enable: true };
const appResourceParams = { enable: true, supportAppMode: true };
const componentResourceParams = { enable: true, supportIconMode: true };

const getConfigurableWebsiteList = (params: any) =>
  getWebsiteList({
    ...params,
    ...websiteResourceParams,
  });

const getConfigurableApps = (params: any) =>
  getApp({
    ...params,
    ...appResourceParams,
  });

const getConfigurableComponents = (params: any) =>
  getApp({
    ...params,
    ...componentResourceParams,
  });

const isEnabledApp = (item: AppItem) => item.enable !== false;

const isEnabledWebsite = (item: Website) => item.enable !== false;

interface ResourceCardProps {
  icon?: string;
  title: ReactNode;
  disabled?: boolean;
  extra?: ReactNode;
  createItem: () => DesktopSortItem<DesktopItemData> | null;
  onOpenDetail: () => void;
  onResourceDragStart: DesktopResourceTabsProps["onResourceDragStart"];
  onResourceDragEnd: DesktopResourceTabsProps["onResourceDragEnd"];
}

const ResourceCard = ({
  icon,
  title,
  disabled,
  extra,
  createItem,
  onOpenDetail,
  onResourceDragStart,
  onResourceDragEnd,
}: ResourceCardProps) => {
  const handleCreateItem = () => {
    if (disabled) return null;
    return createItem();
  };

  return (
    <div
      className={`${resourceCardClassName} ${
        disabled ? resourceCardDisabledClassName : ""
      }`}
      draggable={!disabled}
      onClick={onOpenDetail}
      onDragStart={(event) => {
        const item = handleCreateItem();
        if (!item) {
          event.preventDefault();
          return;
        }
        onResourceDragStart(event, item);
      }}
      onDragEnd={onResourceDragEnd}
    >
      <div className={resourceIconClassName}>
        {icon ? (
          <img
            alt=""
            className="h-full w-full object-contain"
            draggable={false}
            src={icon}
          />
        ) : (
          <span className={resourceIconFallbackClassName}>
            {typeof title === "string" ? title.trim().charAt(0) : null}
          </span>
        )}
      </div>
      <div className={resourceInfoClassName}>
        <div className={resourceTitleClassName}>{title}</div>
        {extra ? <div className={resourceExtraClassName}>{extra}</div> : null}
      </div>
    </div>
  );
};

interface ResourceDetail {
  title: string;
  icon?: string;
  items: Array<{ key: string; label: string; children?: ReactNode }>;
}

const ResourceDetailModal = ({
  detail,
  onClose,
}: {
  detail: ResourceDetail | null;
  onClose: () => void;
}) => (
  <Modal
    open={Boolean(detail)}
    title={detail?.title}
    width={420}
    footer={null}
    onCancel={onClose}
  >
    {detail ? (
      <div className={detailModalBodyClassName}>
        {detail.icon ? (
          <img alt="" className={detailIconClassName} src={detail.icon} />
        ) : null}
        <Descriptions
          column={1}
          size="small"
          items={detail.items.filter((item) => Boolean(item.children))}
        />
      </div>
    ) : null}
  </Modal>
);

interface ResourceTabFrameProps {
  keyword: string;
  placeholder: string;
  loading: boolean;
  total: number;
  itemCount: number;
  current: number;
  pageSize: number;
  emptyText: string;
  hasData: boolean;
  onKeywordChange: (value: string) => void;
  onSearch: (value?: string) => void;
  onPageChange: (page: number, pageSize: number) => void;
  children: ReactNode;
}

const ResourceTabFrame = ({
  keyword,
  placeholder,
  loading,
  total,
  itemCount,
  current,
  pageSize,
  emptyText,
  hasData,
  onKeywordChange,
  onSearch,
  onPageChange,
  children,
}: ResourceTabFrameProps) => {
  const mergedTotal = Math.max(total || 0, hasData ? current * pageSize : 0);

  return (
    <div className={resourceTabFrameClassName}>
      <div className={resourceToolbarClassName}>
        <Input.Search
          allowClear
          size="small"
          placeholder={placeholder}
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          onSearch={onSearch}
          onClear={() => onSearch("")}
        />
      </div>
      <div className={resourceBodyClassName}>
        <Spin wrapperClassName={resourceSpinClassName} spinning={loading}>
          {hasData ? (
            <div className={resourceGridClassName}>{children}</div>
          ) : (
            <Empty className={resourceEmptyClassName} description={emptyText} />
          )}
        </Spin>
      </div>
      <div className={resourcePaginationClassName}>
        <Pagination
          disabled={!hasData && mergedTotal === 0}
          hideOnSinglePage={false}
          simple
          size="small"
          pageSize={pageSize}
          current={current}
          total={mergedTotal || itemCount || pageSize}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
};

const WebsiteResourceTab = ({
  onResourceDragStart,
  onResourceDragEnd,
}: DesktopResourceTabsProps) => {
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const table = useTablePage<Website>(getConfigurableWebsiteList, {
    pathname: "/desktop/resource-tabs/websites",
    defaultParams: {
      page: 1,
      pageSize: 24,
      ...websiteResourceParams,
    },
  });

  const websiteData = useMemo(
    () => table.data.filter(isEnabledWebsite),
    [table.data],
  );

  const handleSearch = (value?: string) => {
    const nextKeyword = (value || "").trim();
    setKeyword(nextKeyword);
    table.run({
      ...table.params,
      ...websiteResourceParams,
      page: 1,
      search: nextKeyword || undefined,
    });
  };

  return (
    <ResourceTabFrame
      keyword={keyword}
      placeholder="搜索网站"
      loading={table.loading}
      total={table.total}
      itemCount={websiteData.length}
      current={table.current}
      pageSize={table.pageSize}
      emptyText="暂无网站"
      hasData={websiteData.length > 0}
      onKeywordChange={setKeyword}
      onSearch={handleSearch}
      onPageChange={(page) => table.setCurrent(page)}
    >
      {websiteData.map((website) => {
        const rawIcon = website.iconEdited?.url || website.icon?.url;
        const icon = rawIcon ? toBackendAssetUrl(rawIcon) : "";
        return (
          <ResourceCard
            key={getItemKey(website)}
            icon={icon}
            title={website.name}
            disabled={!website.url}
            createItem={() =>
              website.url
                ? buildWebsiteDesktopItem({
                    id: uuidv4(),
                    name: website.name,
                    icon,
                    iconColor: website.themeColor,
                    url: website.url,
                  })
                : null
            }
            onOpenDetail={() =>
              setDetail({
                title: website.name,
                icon,
                items: [
                  { key: "url", label: "网址", children: website.url },
                  {
                    key: "description",
                    label: "描述",
                    children: website.description,
                  },
                  {
                    key: "classify",
                    label: "分类",
                    children: getDetailText(website.classify),
                  },
                ],
              })
            }
            onResourceDragStart={onResourceDragStart}
            onResourceDragEnd={onResourceDragEnd}
          />
        );
      })}
      <ResourceDetailModal detail={detail} onClose={() => setDetail(null)} />
    </ResourceTabFrame>
  );
};

const AppResourceTab = ({
  onResourceDragStart,
  onResourceDragEnd,
}: DesktopResourceTabsProps) => {
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const table = useTablePage<AppItem>(getConfigurableApps, {
    pathname: "/desktop/resource-tabs/apps",
    defaultParams: {
      page: 1,
      pageSize: 24,
      ...appResourceParams,
    },
  });

  const appData = useMemo(
    () =>
      table.data.filter((item) => isEnabledApp(item) && supportsAppMode(item)),
    [table.data],
  );

  const handleSearch = (value?: string) => {
    const nextKeyword = (value || "").trim();
    setKeyword(nextKeyword);
    table.run({
      ...table.params,
      ...appResourceParams,
      page: 1,
      search: nextKeyword || undefined,
    });
  };

  return (
    <ResourceTabFrame
      keyword={keyword}
      placeholder="搜索应用"
      loading={table.loading}
      total={table.total}
      itemCount={appData.length}
      current={table.current}
      pageSize={table.pageSize}
      emptyText="暂无应用"
      hasData={appData.length > 0}
      onKeywordChange={setKeyword}
      onSearch={handleSearch}
      onPageChange={(page) => table.setCurrent(page)}
    >
      {appData.map((app) => {
        const icon = getDesktopAppIconUrl(app, toBackendAssetUrl) || "";
        return (
          <ResourceCard
            key={getItemKey(app)}
            icon={icon}
            title={app.name}
            createItem={() =>
              buildAppLauncherDesktopItem(app, {
                instanceId: uuidv4(),
                appId: app._id,
                name: app.name,
                description: app.description,
                resolveAssetUrl: toBackendAssetUrl,
              })
            }
            onOpenDetail={() =>
              setDetail({
                title: app.name,
                icon,
                items: [
                  { key: "version", label: "版本", children: app.version },
                  { key: "author", label: "作者", children: app.author },
                  {
                    key: "description",
                    label: "描述",
                    children: app.description,
                  },
                ],
              })
            }
            onResourceDragStart={onResourceDragStart}
            onResourceDragEnd={onResourceDragEnd}
          />
        );
      })}
      <ResourceDetailModal detail={detail} onClose={() => setDetail(null)} />
    </ResourceTabFrame>
  );
};

const ComponentResourceTab = ({
  onResourceDragStart,
  onResourceDragEnd,
}: DesktopResourceTabsProps) => {
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const table = useTablePage<AppItem>(getConfigurableComponents, {
    pathname: "/desktop/resource-tabs/components",
    defaultParams: {
      page: 1,
      pageSize: 24,
      ...componentResourceParams,
    },
  });

  const componentData = useMemo(
    () =>
      table.data.filter((item) => isEnabledApp(item) && supportsIconMode(item)),
    [table.data],
  );

  const handleSearch = (value?: string) => {
    const nextKeyword = (value || "").trim();
    setKeyword(nextKeyword);
    table.run({
      ...table.params,
      ...componentResourceParams,
      page: 1,
      search: nextKeyword || undefined,
    });
  };

  return (
    <ResourceTabFrame
      keyword={keyword}
      placeholder="搜索组件"
      loading={table.loading}
      total={table.total}
      itemCount={componentData.length}
      current={table.current}
      pageSize={table.pageSize}
      emptyText="暂无组件"
      hasData={componentData.length > 0}
      onKeywordChange={setKeyword}
      onSearch={handleSearch}
      onPageChange={(page) => table.setCurrent(page)}
    >
      {componentData.map((app) => {
        const icon = getDesktopAppIconUrl(app, toBackendAssetUrl) || "";
        const sizeConfigs = getSizeConfigs(app);
        const defaultSizeId = getDefaultSizeId(app);
        return (
          <ResourceCard
            key={getItemKey(app)}
            icon={icon}
            title={app.name}
            createItem={() =>
              buildSizedAppDesktopItem(app, {
                instanceId: uuidv4(),
                appId: app._id,
                name: app.name,
                description: app.description,
                sizeId: defaultSizeId,
                resolveAssetUrl: toBackendAssetUrl,
              })
            }
            onOpenDetail={() =>
              setDetail({
                title: app.name,
                icon,
                items: [
                  { key: "version", label: "版本", children: app.version },
                  { key: "size", label: "默认尺寸", children: defaultSizeId },
                  {
                    key: "sizes",
                    label: "支持尺寸",
                    children: sizeConfigs
                      .map((size) => size.name || size.id)
                      .filter(Boolean)
                      .join(" / "),
                  },
                  { key: "author", label: "作者", children: app.author },
                  {
                    key: "description",
                    label: "描述",
                    children: app.description,
                  },
                ],
              })
            }
            onResourceDragStart={onResourceDragStart}
            onResourceDragEnd={onResourceDragEnd}
          />
        );
      })}
      <ResourceDetailModal detail={detail} onClose={() => setDetail(null)} />
    </ResourceTabFrame>
  );
};

const createTabLabel = (title: string, icon: ReactNode) => (
  <Tooltip title={title} placement="bottom">
    <span className={resourceTabLabelClassName}>{icon}</span>
  </Tooltip>
);

const DesktopResourceTabs = (props: DesktopResourceTabsProps) => (
  <div className={resourceTabsClassName}>
    <Tabs
      size="small"
      items={[
        {
          key: "website",
          label: createTabLabel("网站", <RiGlobalLine size={16} />),
          children: <WebsiteResourceTab {...props} />,
        },
        {
          key: "app",
          label: createTabLabel("应用", <RiApps2Line size={16} />),
          children: <AppResourceTab {...props} />,
        },
        {
          key: "component",
          label: createTabLabel("组件", <RiLayoutGridLine size={16} />),
          children: <ComponentResourceTab {...props} />,
        },
      ]}
    />
  </div>
);

const resourceTabsClassName = [
  "box-border flex h-full max-h-full min-h-0 w-[268px] min-w-[252px] max-w-[280px] flex-none basis-[268px] flex-col overflow-hidden border-r border-slate-200 bg-white",
  "[&_.ant-tabs]:flex [&_.ant-tabs]:h-full [&_.ant-tabs]:max-h-full [&_.ant-tabs]:min-h-0 [&_.ant-tabs]:min-w-0 [&_.ant-tabs]:flex-1 [&_.ant-tabs]:flex-col [&_.ant-tabs]:overflow-hidden",
  "[&_.ant-tabs-nav]:!m-0 [&_.ant-tabs-nav]:border-b [&_.ant-tabs-nav]:border-slate-200 [&_.ant-tabs-nav]:px-3",
  "[&_.ant-tabs-tab]:!m-0 [&_.ant-tabs-tab]:pb-2",
  "[&_.ant-tabs-tab-btn]:flex [&_.ant-tabs-tab-btn]:items-center",
  "[&_.ant-tabs-content-holder]:h-0 [&_.ant-tabs-content-holder]:min-h-0 [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content-holder]:overflow-hidden",
  "[&_.ant-tabs-content]:h-full [&_.ant-tabs-content]:max-h-full [&_.ant-tabs-content]:min-h-0 [&_.ant-tabs-content]:overflow-hidden",
  "[&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:max-h-full [&_.ant-tabs-tabpane]:min-h-0 [&_.ant-tabs-tabpane]:overflow-hidden",
  "[&_.ant-tabs-tabpane-active]:flex [&_.ant-tabs-tabpane-active]:flex-col",
  "[&_.ant-tabs-tab-active_.resource-tab-label]:text-[#ff4d1f]",
].join(" ");

const resourceTabLabelClassName =
  "resource-tab-label inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500";

const resourceTabFrameClassName =
  "box-border grid h-full max-h-full min-h-0 grid-rows-[32px_minmax(0,1fr)_28px] gap-2 overflow-hidden px-3 pb-3 pt-2.5";

const resourceToolbarClassName =
  "flex items-center gap-2 [&_.ant-input-search]:min-w-0 [&_.ant-input-search]:flex-1";

const resourceBodyClassName =
  "flex h-full max-h-full min-h-0 overflow-hidden";

const resourceSpinClassName = [
  "flex h-full max-h-full min-h-0 w-full flex-1 flex-col overflow-hidden",
  "[&_.ant-spin-container]:flex [&_.ant-spin-container]:h-full [&_.ant-spin-container]:max-h-full [&_.ant-spin-container]:min-h-0 [&_.ant-spin-container]:flex-1 [&_.ant-spin-container]:flex-col [&_.ant-spin-container]:overflow-hidden",
].join(" ");

const resourceGridClassName =
  "grid h-full max-h-full min-h-0 flex-1 content-start grid-cols-3 gap-x-2 gap-y-1.5 overflow-y-auto overflow-x-hidden overscroll-contain px-1.5 py-2 [scrollbar-width:thin]";

const resourceCardClassName =
  "group flex h-[66px] min-w-0 cursor-grab flex-col items-center justify-start gap-1 rounded-md px-1 py-1 active:scale-[0.98] active:cursor-grabbing";

const resourceCardDisabledClassName = "!cursor-not-allowed opacity-50";

const resourceIconClassName =
  "grid h-9 w-9 flex-none place-items-center overflow-hidden rounded-lg bg-transparent transition-[background-color,box-shadow,transform] group-hover:bg-slate-100 group-hover:shadow-sm";

const resourceIconFallbackClassName =
  "grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500";

const resourceInfoClassName = "w-full min-w-0";

const resourceTitleClassName =
  "w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[11px] font-medium leading-[14px] text-gray-900";

const resourceExtraClassName = "mt-1 flex justify-center";

const resourceEmptyClassName =
  "m-0 flex h-full flex-col justify-center";

const resourcePaginationClassName =
  "flex min-h-7 shrink-0 items-center justify-center";

const detailModalBodyClassName =
  "flex flex-col items-center gap-3";

const detailIconClassName = "h-14 w-14 object-contain";

export default DesktopResourceTabs;
