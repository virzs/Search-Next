import {
  RiLandscapeFill,
  RiLandscapeLine,
  RiTShirtFill,
  RiTShirtLine,
  RiUserFill,
  RiUserLine,
} from "@remixicon/react";
import type { DefaultAppRouteDefinition } from "../route-config";
import { personalizationRoute } from "./route-paths";

export const personalizationRootRouteDefinition: DefaultAppRouteDefinition = {
  key: "personalization.root",
  segment: personalizationRoute.segment.root,
  path: personalizationRoute.path.root,
  meta: {
    title: "个性化",
    description: "管理桌面主题、壁纸与自定义外观",
    icon: <RiTShirtLine size={16} />,
    activeIcon: <RiTShirtFill size={16} />,
    keywords: ["personalization", "appearance", "个性化", "外观"],
  },
  sidebar: false,
  search: false,
};

export const personalizationRouteDefinitions: DefaultAppRouteDefinition[] = [
  {
    key: "personalization.theme",
    index: true,
    segment: "",
    path: personalizationRoute.path.root,
    meta: {
      title: "主题",
      description: "浏览和应用桌面主题",
      icon: <RiTShirtLine size={16} />,
      activeIcon: <RiTShirtFill size={16} />,
      keywords: ["theme", "appearance", "个性化", "外观"],
    },
    sidebar: { enabled: true },
    search: { enabled: true, group: "page" },
  },
  {
    key: "personalization.detail",
    segment: personalizationRoute.segment.detail,
    path: "/personalization/detail/:id",
    meta: {
      title: "主题详情",
      description: "查看主题详情",
      keywords: ["theme", "detail", "详情"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "personalization.wallpaper-category",
    segment: personalizationRoute.segment.wallpaperCategory,
    path: "/personalization/wallpaper/category/:id",
    meta: {
      title: "壁纸分类",
      description: "查看壁纸分类",
      keywords: ["wallpaper", "category", "分类"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "personalization.wallpaper",
    segment: personalizationRoute.segment.wallpaper,
    path: personalizationRoute.path.wallpaper,
    meta: {
      title: "壁纸",
      description: "浏览和应用桌面背景",
      icon: <RiLandscapeLine size={16} />,
      activeIcon: <RiLandscapeFill size={16} />,
      keywords: ["wallpaper", "background", "背景", "桌面背景"],
    },
    sidebar: { enabled: true },
    search: { enabled: true, group: "page" },
  },
  {
    key: "personalization.my",
    segment: personalizationRoute.segment.my,
    path: personalizationRoute.path.my,
    meta: {
      title: "我的",
      description: "管理自定义主题与壁纸",
      icon: <RiUserLine size={16} />,
      activeIcon: <RiUserFill size={16} />,
      keywords: ["mine", "my", "custom", "自定义"],
    },
    sidebar: { enabled: true },
    search: { enabled: true, group: "page" },
  },
  {
    key: "personalization.my-create",
    segment: personalizationRoute.segment.myCreate,
    path: personalizationRoute.path.myCreate,
    meta: {
      title: "创建壁纸",
      description: "创建自定义壁纸",
      keywords: ["create", "wallpaper", "创建"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "personalization.my-edit",
    segment: personalizationRoute.segment.myEdit,
    path: "/personalization/my/edit/:id",
    meta: {
      title: "编辑壁纸",
      description: "编辑自定义壁纸",
      keywords: ["edit", "wallpaper", "编辑"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "personalization.my-theme-create",
    segment: personalizationRoute.segment.myThemeCreate,
    path: personalizationRoute.path.myThemeCreate,
    meta: {
      title: "创建主题",
      description: "创建自定义主题",
      keywords: ["create", "theme", "创建"],
    },
    sidebar: false,
    search: false,
  },
  {
    key: "personalization.my-theme-edit",
    segment: personalizationRoute.segment.myThemeEdit,
    path: "/personalization/my/theme/edit/:id",
    meta: {
      title: "编辑主题",
      description: "编辑自定义主题",
      keywords: ["edit", "theme", "编辑"],
    },
    sidebar: false,
    search: false,
  },
];
