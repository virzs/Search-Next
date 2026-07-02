import { FC, useMemo } from "react";
import { RiSearchLine } from "@remixicon/react";
import { AppRoutedOverlay } from "@/components";
import { storeRoute } from "./route-paths";
import { useWidget } from "@/hooks/useWidget";
import { createSidebarMenuItems } from "../route-config";
import {
  storeRootRouteDefinition,
  storeRouteDefinitions,
} from "./route-definitions";

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

  const menuItems = useMemo(
    () =>
      createSidebarMenuItems(storeRouteDefinitions, {
        context: { devModeEnabled },
      }),
    [devModeEnabled],
  );

  return (
    <AppRoutedOverlay<DesktopOutletContext, StoreOutletContext>
      closeTo="/"
      title={storeRootRouteDefinition.meta.title}
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
