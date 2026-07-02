import type { DefaultAppRouteDefinition } from "../route-config";
import { accountRoute } from "./route-paths";

export const accountRootRouteDefinition: DefaultAppRouteDefinition = {
  key: "account.root",
  segment: accountRoute.segment.root,
  path: accountRoute.path.root,
  meta: {
    title: "账号",
    description: "登录、注册与查看账号资料",
    keywords: ["account", "user", "账号"],
  },
  sidebar: false,
  search: false,
};

export const accountRouteDefinitions: DefaultAppRouteDefinition[] = [
  {
    key: "account.login",
    segment: accountRoute.segment.login,
    path: accountRoute.path.login,
    meta: {
      title: "登录",
      description: "登录 Search Next 账号",
      keywords: ["login", "account", "登录"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "account.register",
    segment: accountRoute.segment.register,
    path: accountRoute.path.register,
    meta: {
      title: "注册",
      description: "注册 Search Next 账号",
      keywords: ["register", "account", "注册"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "account.profile",
    segment: accountRoute.segment.profile,
    path: accountRoute.path.profile,
    meta: {
      title: "账号资料",
      description: "查看当前账号资料",
      keywords: ["profile", "account", "资料"],
    },
    sidebar: false,
    search: false,
  },
];
