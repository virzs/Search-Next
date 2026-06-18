import { Navigate } from "react-router";
import AccountModalRoute, {
  AccountAuthView,
  AccountIndexRedirect,
  AccountProfileView,
} from "./index";
import { accountRoute } from "./route-paths";

export const accountRoutes = {
  path: accountRoute.segment.root,
  element: <AccountModalRoute />,
  children: [
    { index: true, element: <AccountIndexRedirect /> },
    {
      path: accountRoute.segment.login,
      element: <AccountAuthView action="login" />,
    },
    {
      path: accountRoute.segment.register,
      element: <AccountAuthView action="register" />,
    },
    {
      path: accountRoute.segment.profile,
      element: <AccountProfileView />,
    },
    {
      path: accountRoute.segment.wildcard,
      element: <Navigate to={accountRoute.path.login} replace />,
    },
  ],
};
