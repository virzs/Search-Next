import { RouteObject } from "react-router";
import { Menu } from "@/utils/menu";
import { UserOutlined } from "@ant-design/icons";
import User from "./all";
import UserDetail from "./all/detail";
import { routeAuth } from "@/contexts/AccessContext";

export const UserPaths = {
  index: "/user",
  all: "/user/all",
  detail: "/user/all",
  center: "/my",
};

const UserRouter: RouteObject = {
  path: UserPaths.index,
  children: [
    {
      path: UserPaths.all,
      element: <User />,
    },
    {
      path: UserPaths.detail + "/:id",
      element: <UserDetail />,
    },
  ],
};

export const UserMenu: Menu = {
  name: "用户",
  path: UserPaths.index,
  icon: <UserOutlined />,
  children: [
    {
      name: "全部用户",
      path: UserPaths.all,
      auth: routeAuth("GET", "/users"),
      hideChildrenInMenu: true,
      children: [
        {
          name: "用户详情",
          path: UserPaths.detail + "/:id",
          auth: routeAuth("GET", "/users/:id"),
        },
      ],
    },
    {
      name: "个人中心",
      path: UserPaths.center,
      hideInMenu: true,
    },
  ],
};

export default UserRouter;
