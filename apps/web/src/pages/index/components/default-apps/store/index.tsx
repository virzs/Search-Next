import { FC } from "react";
import {
  RiAppsFill,
  RiAppsLine,
  RiCodeSSlashFill,
  RiCodeSSlashLine,
  RiLinksFill,
  RiLinksLine,
  RiSearchLine,
} from "@remixicon/react";
import { css } from "@emotion/css";
import { AppRoutedOverlay } from "@/components";
import { storeRoute } from "./route-paths";
import { useWidget } from "@/hooks/useWidget";

export type DesktopOutletContext = {
  onAddWidget?: (widgetId: string) => void;
  onAddWebsite?: (site: any) => void;
};

export type StoreOutletContext = {
  query: string;
  setQuery: (value: string) => void;
  onAddWidget?: (widgetId: string) => void;
  onAddWebsite?: (site: any) => void;
};

const buildStoreRouteContext = ({
  parentContext,
  search,
}: {
  parentContext: DesktopOutletContext;
  search: { value: string; setValue: (value: string) => void };
}): StoreOutletContext => ({
  query: search.value,
  setQuery: search.setValue,
  onAddWebsite: parentContext?.onAddWebsite,
  onAddWidget: parentContext?.onAddWidget,
});

const storeSidebarClassName = css`
  padding-right: 18px;

  .ant-input-affix-wrapper {
    height: 38px;
    border: 0;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.68);
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
  }

  .ant-menu {
    border-inline-end: 0 !important;
    background: transparent !important;
  }

  .ant-menu-item {
    height: 42px !important;
    margin: 4px 0 !important;
    border-radius: 13px !important;
    color: rgba(31, 41, 55, 0.78);
    font-weight: 600;
  }

  .ant-menu-item-selected {
    background: rgba(255, 255, 255, 0.82) !important;
    color: rgb(255, 69, 29) !important;
    box-shadow:
      0 8px 20px rgba(15, 23, 42, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.62);
  }
`;

const StoreModalRoute: FC = () => {
  const { devModeEnabled } = useWidget();

  const menuItems = [
    {
      key: "website",
      label: "网站",
      path: storeRoute.path.website.root,
      icon: <RiLinksLine size={16} />,
      activeIcon: <RiLinksFill size={16} />,
    },
    {
      key: "widget",
      label: "小组件",
      path: storeRoute.path.widget,
      icon: <RiAppsLine size={16} />,
      activeIcon: <RiAppsFill size={16} />,
    },
    ...(devModeEnabled
      ? [
          {
            key: "dev",
            label: "开发者",
            path: storeRoute.path.dev,
            icon: <RiCodeSSlashLine size={16} />,
            activeIcon: <RiCodeSSlashFill size={16} />,
          },
        ]
      : []),
  ];

  return (
    <AppRoutedOverlay<DesktopOutletContext, StoreOutletContext>
      closeTo="/"
      title="应用商店"
      wrapContent
      overlayProps={{
        modalProps: { width: 940 },
      }}
      sidebarProps={{
        header: (
          <div className="px-1">
            <div className="text-[28px] font-bold leading-8 tracking-normal text-gray-950 dark:text-gray-50">应用商店</div>
            <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">精选、组件与网站</div>
          </div>
        ),
        search: {
          placeholder: "搜索",
          prefix: <RiSearchLine size={16} className="text-gray-400" />,
        },
        menuItems,
        footer: <div className="font-medium text-gray-500">Search Next Store</div>,
        className: storeSidebarClassName,
        menuStyles: {
          item: {
            paddingLeft: 14,
          },
        },
      }}
      keepAlive={{ enabled: true }}
      getRouteContext={buildStoreRouteContext}
    />
  );
};

export default StoreModalRoute;
