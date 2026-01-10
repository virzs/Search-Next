import { useAppRouteContext } from "@/components";
import WebsiteCollectionRoute from "./views/website/collection";
import WebsiteDetailView from "./views/website/detail";
import StoreNotFoundRoute from "./views/not-found";
import WebsiteView from "./views/website";
import StoreModalRoute, { type StoreOutletContext } from "./index";
import { Navigate } from "react-router";
import WidgetView from "./views/widget";

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
      children: [
        { index: true, element: <WebsiteView /> },
        { path: "collection/:id", element: <WebsiteCollectionRoute /> },
        { path: "detail/:id", element: <WebsiteDetailView /> },
        { path: "*", element: <StoreNotFoundRoute /> },
      ],
    },
    { path: "widget", element: <WidgetRoute /> },
    { path: "*", element: <StoreNotFoundRoute /> },
  ],
};
