import { ComponentClass, FunctionComponent, ReactNode, lazy } from "react";

type ChannelType = "preview" | "development" | "production" | "testing";

type StatusType =
  | "development_completed"
  | "in_development"
  | "development_paused"
  | "development_delayed"
  | "development_canceled"
  | "development_exception";

export interface Router {
  path: string;
  component:
    | string
    | FunctionComponent<object>
    | ComponentClass<object, unknown>;
  exact?: boolean; // 精确匹配，默认 true，设置 false 一般用于 layout 路由
  routes?: Router[];
  redirect?: string;
  wrappers?: string[];
  title?: string;
  icon?: ReactNode;
  status?: StatusType; // 当前状态 开发完成 开发中 开发暂停 开发延期 开发取消 开发异常
  channel?: ChannelType; // 预览渠道 开发渠道 正式渠道 测试渠道
}

export const routes: Router[] = [
  {
    path: "/",
    title: "首页",
    component: lazy(() => import("@/pages/home/index")),
  },
];
