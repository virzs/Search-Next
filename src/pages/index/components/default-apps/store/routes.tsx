import { useAppRouteContext } from "@/components";
import WidgetView from "./views/widget";
import WebsiteCollectionRoute from "./views/WebsiteCollectionRoute";
import WebsiteDetailRoute from "./views/WebsiteDetailRoute";
import StoreNotFoundRoute from "./views/StoreNotFoundRoute";
import WebsiteLayoutRoute from "./views/WebsiteLayoutRoute";
import WebsiteNotFoundRoute from "./views/WebsiteNotFoundRoute";
import StoreModalRoute, { type StoreOutletContext } from "./index";
import { Navigate } from "react-router";

const WidgetRoute = () => {
  const { query, onAddWidget } = useAppRouteContext<StoreOutletContext>();
  return <WidgetView query={query} onAddWidget={onAddWidget} />;
};

export const storeRoutes = {
  path: "store",
  element: <StoreModalRoute />,
  children: [
    { index: true, element: <Navigate to="website" replace /> },
    {
      path: "website",
      element: <WebsiteLayoutRoute />,
      children: [
        { path: "collection/:id", element: <WebsiteCollectionRoute /> },
        { path: "detail/:id", element: <WebsiteDetailRoute /> },
        { path: "*", element: <WebsiteNotFoundRoute /> },
      ],
    },
    { path: "widget", element: <WidgetRoute /> },
    { path: "*", element: <StoreNotFoundRoute /> },
  ],
};
