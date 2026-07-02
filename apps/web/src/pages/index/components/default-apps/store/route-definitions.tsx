import {
  RiApps2Fill,
  RiApps2Line,
  RiAppsFill,
  RiAppsLine,
  RiCodeSSlashFill,
  RiCodeSSlashLine,
  RiLinksFill,
  RiLinksLine,
  RiSearchLine,
  RiStore2Fill,
  RiStore2Line,
} from "@remixicon/react";
import type { DefaultAppRouteDefinition } from "../route-config";
import { storeRoute } from "./route-paths";

export const storeRootRouteDefinition: DefaultAppRouteDefinition = {
  key: "store.root",
  segment: storeRoute.segment.root,
  path: storeRoute.path.root,
  meta: {
    title: "应用商店",
    description: "发现网站、应用与桌面小组件",
    icon: <RiStore2Line size={16} />,
    activeIcon: <RiStore2Fill size={16} />,
    keywords: ["store", "market", "应用市场", "商店"],
  },
  sidebar: false,
  search: { enabled: true, group: "page" },
};

export const storeRouteDefinitions: DefaultAppRouteDefinition[] = [
  {
    key: "store.website",
    segment: storeRoute.segment.website,
    path: storeRoute.path.website.root,
    meta: {
      title: "网站",
      description: "发现和添加常用网站",
      icon: <RiLinksLine size={16} />,
      activeIcon: <RiLinksFill size={16} />,
      keywords: ["site", "website", "link", "网页", "站点"],
    },
    sidebar: { enabled: true },
    search: { enabled: true, group: "page" },
  },
  {
    key: "store.website-collection",
    segment: `${storeRoute.segment.website}/${storeRoute.segment.websiteCollection}`,
    path: "/store/website/collection/:id",
    meta: {
      title: "网站合集",
      description: "查看网站合集",
      keywords: ["collection", "合集"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "store.website-detail",
    segment: `${storeRoute.segment.website}/${storeRoute.segment.websiteDetail}`,
    path: "/store/website/detail/:id",
    meta: {
      title: "网站详情",
      description: "查看网站详情",
      keywords: ["detail", "详情"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "store.search",
    segment: storeRoute.segment.search,
    path: storeRoute.path.search,
    meta: {
      title: "商店搜索",
      description: "搜索网站、应用与小组件",
      icon: <RiSearchLine size={16} />,
      keywords: ["search", "搜索"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "store.app",
    segment: storeRoute.segment.app,
    path: storeRoute.path.app,
    meta: {
      title: "应用",
      description: "支持桌面打开的应用",
      icon: <RiApps2Line size={16} />,
      activeIcon: <RiApps2Fill size={16} />,
      keywords: ["app", "apps", "application", "应用"],
    },
    sidebar: { enabled: true },
    search: { enabled: true, group: "page" },
  },
  {
    key: "store.widget",
    segment: storeRoute.segment.widget,
    path: storeRoute.path.widget,
    meta: {
      title: "小组件",
      description: "添加桌面小组件",
      icon: <RiAppsLine size={16} />,
      activeIcon: <RiAppsFill size={16} />,
      keywords: ["widget", "widgets", "组件", "桌面组件"],
    },
    sidebar: { enabled: true },
    search: { enabled: true, group: "page" },
  },
  {
    key: "store.dev",
    segment: storeRoute.segment.dev,
    path: storeRoute.path.dev,
    meta: {
      title: "开发者",
      description: "测试自定义小组件和本地 ESM 入口",
      icon: <RiCodeSSlashLine size={16} />,
      activeIcon: <RiCodeSSlashFill size={16} />,
      keywords: ["dev", "developer", "widget", "esm", "开发"],
    },
    sidebar: {
      enabled: true,
      visible: ({ devModeEnabled }) => Boolean(devModeEnabled),
    },
    search: {
      enabled: true,
      group: "page",
      visible: ({ devModeEnabled }) => Boolean(devModeEnabled),
    },
  },
];
