import { useAppRouteContext } from "@/components";
import WebsiteCollectionRoute from "./views/website/collection";
import WebsiteDetailView from "./views/website/detail";
import StoreNotFoundRoute from "./views/not-found";
import WebsiteView from "./views/website";
import StoreModalRoute, { type StoreOutletContext } from "./index";
import { Navigate } from "react-router";
import WidgetView from "./views/widget";
import AppView from "./views/app";
import DevView from "./views/dev";
import { storeRoute } from "./route-paths";
import StoreSearchView from "./views/search";

const WidgetRoute = () => {
  const { query, onAddStoreItem } = useAppRouteContext<StoreOutletContext>();
  return <WidgetView query={query} onAddStoreItem={onAddStoreItem} />;
};

const AppRoute = () => {
  const { query, onAddStoreItem } = useAppRouteContext<StoreOutletContext>();
  return <AppView query={query} onAddStoreItem={onAddStoreItem} />;
};

export const storeRoutes = {
  path: storeRoute.segment.root,
  element: <StoreModalRoute />,
  children: [
    {
      index: true,
      element: <Navigate to={storeRoute.segment.website} replace />,
    },
    {
      path: storeRoute.segment.website,
      children: [
        { index: true, element: <WebsiteView /> },
        {
          path: storeRoute.segment.websiteCollection,
          element: <WebsiteCollectionRoute />,
        },
        { path: storeRoute.segment.websiteDetail, element: <WebsiteDetailView /> },
        { path: storeRoute.segment.wildcard, element: <StoreNotFoundRoute /> },
      ],
    },
    { path: storeRoute.segment.search, element: <StoreSearchView /> },
    { path: storeRoute.segment.app, element: <AppRoute /> },
    { path: storeRoute.segment.widget, element: <WidgetRoute /> },
    { path: storeRoute.segment.dev, element: <DevView /> },
    { path: storeRoute.segment.wildcard, element: <StoreNotFoundRoute /> },
  ],
};
