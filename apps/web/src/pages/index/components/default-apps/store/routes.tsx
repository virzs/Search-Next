import { useAppRouteContext } from "@/components";
import type { ReactNode } from "react";
import { createRouteObjectsFromDefinitions } from "../route-config";
import WebsiteCollectionRoute from "./views/website/collection";
import WebsiteDetailView from "./views/website/detail";
import StoreNotFoundRoute from "./views/not-found";
import WebsiteView from "./views/website";
import StoreModalRoute, { type StoreOutletContext } from "./index";
import { Navigate } from "react-router";
import AppView from "./views/app";
import AppCollectionRoute from "./views/app/collection";
import DevView from "./views/dev";
import { storeRouteDefinitions } from "./route-definitions";
import { storeRoute } from "./route-paths";
import StoreSearchView from "./views/search";

const AppRoute = () => {
  const { query, onAddStoreItem } = useAppRouteContext<StoreOutletContext>();
  return <AppView variant="app" query={query} onAddStoreItem={onAddStoreItem} />;
};

const WidgetRoute = () => {
  const { query, onAddStoreItem } = useAppRouteContext<StoreOutletContext>();
  return <AppView variant="widget" query={query} onAddStoreItem={onAddStoreItem} />;
};

const storeRouteElements = {
  "store.website": <WebsiteView />,
  "store.website-collection": <WebsiteCollectionRoute />,
  "store.website-detail": <WebsiteDetailView />,
  "store.search": <StoreSearchView />,
  "store.app": <AppRoute />,
  "store.widget": <WidgetRoute />,
  "store.app-collection": <AppCollectionRoute />,
  "store.dev": <DevView />,
} satisfies Record<string, ReactNode>;

export const storeRoutes = {
  path: storeRoute.segment.root,
  element: <StoreModalRoute />,
  children: [
    {
      index: true,
      element: <Navigate to={storeRoute.segment.website} replace />,
    },
    ...createRouteObjectsFromDefinitions(storeRouteDefinitions, storeRouteElements),
    {
      path: `${storeRoute.segment.website}/${storeRoute.segment.wildcard}`,
      element: <StoreNotFoundRoute />,
    },
    { path: storeRoute.segment.wildcard, element: <StoreNotFoundRoute /> },
  ],
};
