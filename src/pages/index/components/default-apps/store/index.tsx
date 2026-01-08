import { FC } from "react";
import {
  RiAppsFill,
  RiAppsLine,
  RiLinksFill,
  RiLinksLine,
  RiSearchLine,
} from "@remixicon/react";
import {
  AppRouteModal,
} from "@/components";

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

const StoreModalRoute: FC = () => {
  return (
    <AppRouteModal<DesktopOutletContext, StoreOutletContext>
      closeTo="/"
      title="应用商店"
      wrapContent
      sidebarProps={{
        header: <div className="text-2xl font-bold tracking-tight">应用商店</div>,
        search: {
          placeholder: "搜索应用与组件",
          prefix: <RiSearchLine size={16} className="" />,
          inputClassName: "border-transparent! transition-all h-10",
        },
        menuItems: [
          {
            key: "website",
            label: "网站",
            path: "/store/website",
            icon: <RiLinksLine size={16} />,
            activeIcon: <RiLinksFill size={16} />,
          },
          {
            key: "widget",
            label: "小组件",
            path: "/store/widget",
            icon: <RiAppsLine size={16} />,
            activeIcon: <RiAppsFill size={16} />,
          },
        ],
        footer: "点击卡片查看详情，点击获取按钮添加到桌面",
      }}
      keepAlive={{ enabled: true }}
      getRouteContext={buildStoreRouteContext}
    />
  );
};

export default StoreModalRoute;
