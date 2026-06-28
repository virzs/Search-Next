import { Navigate, RouteObject } from "react-router";
import Website from "./website/index";
import { Menu } from "@/utils/menu";
import WebsiteClassify from "./website/classify";
import WebsiteTag from "./website/tag";
import DesktopConfig from "./desktop/desktop-config";
import DesktopConfigHandle from "./desktop/desktop-config/handle";
import DesktopUserLimitConfig from "./desktop/user-limit";
import DesktopUserDataSync from "./desktop/user-data-sync";
import { RiNavigationLine } from "@remixicon/react";
import SearchEngine from "./search/engine";
import SearchEngineHandle from "./search/engine/handle";
import TabRouteContainer from "@/components/containter/tabs";
import DesktopThemeConfigTheme from "./desktop/theme-config/theme";
import DesktopThemeConfigCategory from "./desktop/theme-config/category";
import DesktopThemeConfigHandle from "./desktop/theme-config/handle";
import DesktopConfigPreview from "./desktop/desktop-config/preview";
import WallpaperIndex from "./wallpaper";
import WallpaperCategoryIndex from "./wallpaper/category";
import WallpaperHandle from "./wallpaper/handle";
import WidgetIndex from "./widget";
import WidgetHandle from "./widget/handle";
import WidgetClassify from "./widget/classify";
import WebsiteCollection from "./website/collection";
import WebsiteCollectionHandle from "./website/collection/handle";
import WebsiteCollectionDetail from "./website/collection/detail";

export const TabsPaths = {
  index: "/tabs",
  website: "/tabs/website/website",
  websiteClassify: "/tabs/website/classify",
  websiteTag: "/tabs/website/tag",
  websiteCollection: "/tabs/website/collection",
  websiteCollectionHandle: "/tabs/website/collection/handle",
  websiteCollectionDetail: "/tabs/website/collection/detail",
  desktop: "/tabs/desktop",
  desktopConfig: "/tabs/desktop/desktop-config",
  desktopConfigHandle: "/tabs/desktop/desktop-config/handle",
  desktopConfigPreview: "/tabs/desktop/desktop-config/preview",
  desktopUserLimit: "/tabs/desktop/user-limit",
  desktopUserDataSync: "/tabs/desktop/user-data-sync",
  desktopThemeConfig: "/tabs/desktop/theme-config",
  desktopThemeConfigTheme: "/tabs/desktop/theme-config/theme",
  desktopThemeConfigCategory: "/tabs/desktop/theme-config/category",
  desktopThemeConfigHandle: "/tabs/desktop/theme-config/handle",
  // 普通搜索相关路径
  searchEngine: "/tabs/search/engine",
  searchEngineHandle: "/tabs/search/engine/handle",
  // 壁纸相关路径
  wallpaper: "/tabs/wallpaper",
  wallpaperHandle: "/tabs/wallpaper/handle",
  wallpaperCategory: "/tabs/wallpaper/category",
  wallpaperUpload: "/tabs/wallpaper/upload",
  // 小组件相关路径
  widget: "/tabs/widget",
  widgetHandle: "/tabs/widget/handle",
  widgetClassify: "/tabs/widget-classify",
};

const TabsRouter: RouteObject = {
  path: TabsPaths.index,
  children: [
    {
      path: TabsPaths.website,
      element: <Website />,
    },
    {
      path: TabsPaths.websiteClassify,
      element: <WebsiteClassify />,
    },
    {
      path: TabsPaths.websiteTag,
      element: <WebsiteTag />,
    },
    {
      path: TabsPaths.websiteCollection,
      element: <WebsiteCollection />,
    },
    {
      path: TabsPaths.websiteCollectionHandle,
      element: <WebsiteCollectionHandle />,
    },
    {
      path: TabsPaths.websiteCollectionHandle + "/:id",
      element: <WebsiteCollectionHandle />,
    },
    {
      path: TabsPaths.websiteCollectionDetail + "/:id",
      element: <WebsiteCollectionDetail />,
    },
    {
      path: TabsPaths.desktopConfig,
      element: <DesktopConfig />,
    },
    {
      path: TabsPaths.desktopConfigHandle,
      element: <DesktopConfigHandle />,
    },
    {
      path: TabsPaths.desktopConfigHandle + "/:id",
      element: <DesktopConfigHandle />,
    },
    {
      path: TabsPaths.desktopConfigPreview + "/:id",
      element: <DesktopConfigPreview />,
    },
    {
      path: TabsPaths.desktopUserLimit,
      element: <DesktopUserLimitConfig />,
    },
    {
      path: TabsPaths.desktopUserDataSync,
      element: <DesktopUserDataSync />,
    },
    {
      path: TabsPaths.desktopThemeConfig,
      element: (
        <TabRouteContainer parent={TabsPaths.desktopThemeConfigCategory} />
      ),
      children: [
        {
          index: true,
          element: <Navigate to="category" replace />,
        },
        {
          path: "theme",
          element: <DesktopThemeConfigTheme />,
        },
        {
          path: "category",
          element: <DesktopThemeConfigCategory />,
        },
      ],
    },
    {
      path: TabsPaths.desktopThemeConfigHandle,
      element: <DesktopThemeConfigHandle />,
    },
    {
      path: TabsPaths.desktopThemeConfigHandle + "/:id",
      element: <DesktopThemeConfigHandle />,
    },
    // 普通搜索路由
    {
      path: TabsPaths.searchEngine,
      element: <SearchEngine />,
    },
    {
      path: TabsPaths.searchEngineHandle,
      element: <SearchEngineHandle />, // 新增/编辑组件
    },
    {
      path: TabsPaths.searchEngineHandle + "/:id",
      element: <SearchEngineHandle />, // 编辑组件
    },
    // 壁纸路由
    {
      path: TabsPaths.wallpaperUpload,
      element: <WallpaperIndex />,
    },
    {
      path: TabsPaths.wallpaperCategory,
      element: <WallpaperCategoryIndex />,
    },
    {
      path: TabsPaths.wallpaperHandle,
      element: <WallpaperHandle />,
    },
    {
      path: TabsPaths.wallpaperHandle + "/:id",
      element: <WallpaperHandle />,
    },
    // 小组件路由
    {
      path: TabsPaths.widget,
      element: <WidgetIndex />,
    },
    {
      path: TabsPaths.widgetHandle,
      element: <WidgetHandle />,
    },
    {
      path: TabsPaths.widgetHandle + "/:id",
      element: <WidgetHandle />,
    },
    {
      path: TabsPaths.widgetClassify,
      element: <WidgetClassify />,
    },
  ],
};

export const TabsMenu: Menu = {
  name: "新标签页",
  path: TabsPaths.index,
  icon: <RiNavigationLine size={16} />,
  children: [
    {
      name: "搜索引擎",
      path: TabsPaths.searchEngine,
      hideChildrenInMenu: true,
      children: [
        {
          name: "新增",
          path: TabsPaths.searchEngineHandle,
        },
        {
          name: "编辑",
          path: TabsPaths.searchEngineHandle + "/:id",
        },
      ],
    },
    {
      name: "网站",
      children: [
        {
          name: "分类",
          path: TabsPaths.websiteClassify,
        },
        {
          name: "标签",
          path: TabsPaths.websiteTag,
        },
        {
          name: "合集",
          path: TabsPaths.websiteCollection,
          hideChildrenInMenu: true,
          children: [
            {
              name: "新增",
              path: TabsPaths.websiteCollectionHandle,
            },
            {
              name: "编辑",
              path: TabsPaths.websiteCollectionHandle + "/:id",
            },
            {
              name: "详情",
              path: TabsPaths.websiteCollectionDetail + "/:id",
            },
          ],
        },
        {
          name: "网站",
          path: TabsPaths.website,
        },
      ],
    },
    {
      name: "小组件",
      children: [
        {
          name: "分类",
          path: TabsPaths.widgetClassify,
        },
        {
          name: "小组件",
          path: TabsPaths.widget,
          hideChildrenInMenu: true,
          children: [
            {
              name: "新增",
              path: TabsPaths.widgetHandle,
            },
            {
              name: "编辑",
              path: TabsPaths.widgetHandle + "/:id",
            },
          ],
        },
      ],
    },
    {
      name: "壁纸",
      children: [
        {
          name: "分类",
          path: TabsPaths.wallpaperCategory,
        },
        {
          name: "壁纸",
          path: TabsPaths.wallpaperUpload,
          hideChildrenInMenu: true,
          children: [
            {
              name: "新增",
              path: TabsPaths.wallpaperHandle,
              hideInTab: true,
            },
            {
              name: "编辑",
              path: TabsPaths.wallpaperHandle + "/:id",
              hideInTab: true,
            },
          ],
        },
      ],
    },
    {
      name: "桌面",
      path: TabsPaths.desktop,
      children: [
        {
          name: "用户限制",
          path: TabsPaths.desktopUserLimit,
          hideChildrenInMenu: true,
        },
        {
          name: "云同步",
          path: TabsPaths.desktopUserDataSync,
          hideChildrenInMenu: true,
        },
        {
          name: "主题配置",
          path: TabsPaths.desktopThemeConfigCategory,
          hideChildrenInMenu: true,
          children: [
            {
              name: "主题分类",
              path: TabsPaths.desktopThemeConfigCategory,
            },
            {
              name: "主题配置",
              path: TabsPaths.desktopThemeConfigTheme,
            },
            {
              name: "新增",
              path: TabsPaths.desktopThemeConfigHandle,
              hideInTab: true,
            },
            {
              name: "编辑",
              path: TabsPaths.desktopThemeConfigHandle + "/:id",
              hideInTab: true,
            },
          ],
        },
        {
          name: "桌面配置",
          path: TabsPaths.desktopConfig,
          hideChildrenInMenu: true,
          children: [
            {
              name: "新增",
              path: TabsPaths.desktopConfigHandle,
            },
            {
              name: "编辑",
              path: TabsPaths.desktopConfigHandle + "/:id",
            },
            {
              name: "预览",
              path: TabsPaths.desktopConfigPreview + "/:id",
            },
          ],
        },
      ],
    },
  ],
};

export default TabsRouter;
