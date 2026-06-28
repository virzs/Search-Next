import { RouteObject } from "react-router";
import Providers from "./providers";
import { Menu } from "@/utils/menu";
import { RiCoinsLine, RiKey2Line, RiListCheck2, RiRobot2Line, RiServerLine, RiShiningLine } from "@remixicon/react";
import Preset from "./preset";
import Playground from "./playground";
import Models from "./models";
import ConsumerKeys from "./consumer-keys";
import RequestLogs from "./request-logs";
import Balances from "./balances";
import ProvidersHandle from "./providers/handle";

export const AIPaths = {
  index: "/ai",
  providers: "/ai/providers",
  providerHandle: "/ai/providers/handle",
  models: "/ai/models",
  consumerKeys: "/ai/consumer-keys",
  requestLogs: "/ai/request-logs",
  balances: "/ai/balances",
  preset: "/ai/preset",
  playground: "/ai/playground",
};

const AIRouter: RouteObject = {
  path: AIPaths.index,
  children: [
    {
      path: AIPaths.providers,
      element: <Providers />,
    },
    {
      path: AIPaths.providerHandle,
      element: <ProvidersHandle />,
    },
    {
      path: AIPaths.providerHandle + "/:id",
      element: <ProvidersHandle />,
    },
    {
      path: AIPaths.models,
      element: <Models />,
    },
    {
      path: AIPaths.consumerKeys,
      element: <ConsumerKeys />,
    },
    {
      path: AIPaths.requestLogs,
      element: <RequestLogs />,
    },
    {
      path: AIPaths.balances,
      element: <Balances />,
    },
    {
      path: AIPaths.preset,
      element: <Preset />,
    },
    {
      path: AIPaths.playground,
      element: <Playground />,
    },
  ],
};

export const AIMenu: Menu = {
  name: "AI",
  path: AIPaths.index,
  icon: <RiShiningLine size={16} />,
  children: [
    {
      name: "服务商管理",
      path: AIPaths.providers,
      icon: <RiServerLine size={16} />,
    },
    {
      name: "模型管理",
      path: AIPaths.models,
      icon: <RiRobot2Line size={16} />,
    },
    {
      name: "API Key管理",
      path: AIPaths.consumerKeys,
      icon: <RiKey2Line size={16} />,
    },
    {
      name: "调用日志",
      path: AIPaths.requestLogs,
      icon: <RiListCheck2 size={16} />,
    },
    {
      name: "余额管理",
      path: AIPaths.balances,
      icon: <RiCoinsLine size={16} />,
    },
    {
      name: "模型预设",
      path: AIPaths.preset,
    },
    {
      name: "模型测试",
      path: AIPaths.playground,
    },
  ],
};

export default AIRouter;
