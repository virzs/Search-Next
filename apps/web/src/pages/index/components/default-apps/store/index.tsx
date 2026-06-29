import { FC } from "react";
import {
  RiAppsFill,
  RiApps2Fill,
  RiApps2Line,
  RiAppsLine,
  RiCodeSSlashFill,
  RiCodeSSlashLine,
  RiLinksFill,
  RiLinksLine,
  RiSearchLine,
} from "@remixicon/react";
import { AppRoutedOverlay } from "@/components";
import { storeRoute } from "./route-paths";
import { useWidget } from "@/hooks/useWidget";

export type StoreWebsitePayload = {
  name?: string;
  url?: string;
  iconEdited?: { url?: string };
  icon?: { url?: string };
};

export type StoreAddPayload =
  | { kind: "website"; site: StoreWebsitePayload }
  | { kind: "widget"; widgetId: string; sizeId?: string }
  | { kind: "app"; widgetId: string };

export type DesktopOutletContext = {
  onAddStoreItem?: (payload: StoreAddPayload) => void;
};

export type StoreOutletContext = {
  query: string;
  setQuery: (value: string) => void;
  onAddStoreItem?: (payload: StoreAddPayload) => void;
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
  onAddStoreItem: parentContext?.onAddStoreItem,
});

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
      key: "app",
      label: "应用",
      path: storeRoute.path.app,
      icon: <RiApps2Line size={16} />,
      activeIcon: <RiApps2Fill size={16} />,
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
      componentSize="small"
      overlayProps={{
        modalProps: { width: 940 },
      }}
      sidebarProps={{
        search: {
          placeholder: "搜索",
          prefix: <RiSearchLine size={16} className="text-gray-400" />,
          redirectPath: storeRoute.path.search,
          throttleWait: 360,
        },
        menuItems,
        menuStyles: {
          item: {
            height: 32,
            lineHeight: "32px",
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
