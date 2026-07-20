import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { createRouteObjectsFromDefinitions } from "../route-config";
import AccountModalRoute, {
  AccountAuthView,
  AccountIndexRedirect,
  AccountProfileView,
} from "./index";
import { accountRouteDefinitions } from "./route-definitions";
import { accountRoute } from "./route-paths";

const accountRouteElements = {
  "account.login": <AccountAuthView action="login" />,
  "account.register": <AccountAuthView action="register" />,
  "account.profile": <AccountProfileView />,
} satisfies Record<string, ReactNode>;

export const accountRoutes = {
  path: accountRoute.segment.root,
  element: <AccountModalRoute />,
  children: [
    { index: true, element: <AccountIndexRedirect /> },
    ...createRouteObjectsFromDefinitions(
      accountRouteDefinitions,
      accountRouteElements,
    ),
    {
      path: accountRoute.segment.wildcard,
      element: <Navigate to={accountRoute.path.profile} replace />,
    },
  ],
};
