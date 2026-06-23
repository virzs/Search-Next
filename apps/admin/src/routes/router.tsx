import { createBrowserRouter } from "react-router";
import HomeRouter from "../views/home/router";
import AuthRouter from "../views/auth/router";
import MainLayout from "../layouts/main";
import SystemRouter from "@/views/system/router";
import UserRouter, { UserPaths } from "@/views/user/router";
import TabsRouter from "@/views/tabs/router";
import ResourceRouter from "@/views/resource/router";
import NotFound from "../views/error/NotFound";
import UserCenter from "@/views/user/center";

export interface MyRouteObject {}

const enabledRouters = [
  SystemRouter,
  ResourceRouter,
  UserRouter,
  TabsRouter,
  // 与用户模块区分开
  {
    path: UserPaths.center,
    element: <UserCenter />,
  },
];

const router = createBrowserRouter([
  ...AuthRouter,
  {
    path: "/",
    element: <MainLayout />,
    children: [
      HomeRouter,
      ...enabledRouters,
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
