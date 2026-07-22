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
import WallpaperDetail from "./wallpaper/detail";
import WallpaperCollectionIndex from "./wallpaper/collection";
import WallpaperCollectionHandle from "./wallpaper/collection/handle";
import WallpaperCollectionDetail from "./wallpaper/collection/detail";
import AppIndex from "./app";
import AppHandle from "./app/handle";
import AppClassify from "./app/classify";
import AppCollection from "./app/collection";
import AppCollectionHandle from "./app/collection/handle";
import WebsiteCollection from "./website/collection";
import WebsiteCollectionHandle from "./website/collection/handle";
import WebsiteCollectionDetail from "./website/collection/detail";
import { routeAuth } from "@/contexts/AccessContext";
import { APP_PERMISSIONS } from "./app/permissions";

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
  wallpaperDetail: "/tabs/wallpaper/detail",
  wallpaperCategory: "/tabs/wallpaper/category",
  wallpaperCollection: "/tabs/wallpaper/collection",
  wallpaperCollectionHandle: "/tabs/wallpaper/collection/handle",
  wallpaperCollectionDetail: "/tabs/wallpaper/collection/detail",
  wallpaperUpload: "/tabs/wallpaper/upload",
  // 应用相关路径
  app: "/tabs/app",
  appHandle: "/tabs/app/handle",
  appClassify: "/tabs/app-classify",
  appCollection: "/tabs/app/collection",
  appCollectionHandle: "/tabs/app/collection/handle",
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
    {
      path: TabsPaths.wallpaperDetail + "/:id",
      element: <WallpaperDetail />,
    },
    {
      path: TabsPaths.wallpaperCollection,
      element: <WallpaperCollectionIndex />,
    },
    {
      path: TabsPaths.wallpaperCollectionHandle,
      element: <WallpaperCollectionHandle />,
    },
    {
      path: TabsPaths.wallpaperCollectionHandle + "/:id",
      element: <WallpaperCollectionHandle />,
    },
    {
      path: TabsPaths.wallpaperCollectionDetail + "/:id",
      element: <WallpaperCollectionDetail />,
    },
    // 应用路由
    {
      path: TabsPaths.app,
      element: <AppIndex />,
    },
    {
      path: TabsPaths.appHandle,
      element: <AppHandle />,
    },
    {
      path: TabsPaths.appHandle + "/:id",
      element: <AppHandle />,
    },
    {
      path: TabsPaths.appClassify,
      element: <AppClassify />,
    },
    {
      path: TabsPaths.appCollection,
      element: <AppCollection />,
    },
    {
      path: TabsPaths.appCollectionHandle,
      element: <AppCollectionHandle />,
    },
    {
      path: TabsPaths.appCollectionHandle + "/:id",
      element: <AppCollectionHandle />,
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
      auth: routeAuth("GET", "/tabs/search-engine"),
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
          auth: routeAuth("GET", "/tabs/website_classify"),
        },
        {
          name: "标签",
          path: TabsPaths.websiteTag,
          auth: routeAuth("GET", "/tabs/website_tag"),
        },
        {
          name: "合集",
          path: TabsPaths.websiteCollection,
          auth: routeAuth("GET", "/tabs/website_collection"),
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
          auth: routeAuth("GET", "/tabs/website"),
        },
      ],
    },
    {
      name: "应用",
      children: [
        {
          name: "应用分类",
          path: TabsPaths.appClassify,
          auth: routeAuth("GET", "/tabs/app-classify"),
        },
        {
          name: "应用合集",
          path: TabsPaths.appCollection,
          auth: routeAuth("GET", "/tabs/app-collection"),
          hideChildrenInMenu: true,
          children: [
            {
              name: "新增",
              path: TabsPaths.appCollectionHandle,
            },
            {
              name: "编辑",
              path: TabsPaths.appCollectionHandle + "/:id",
            },
          ],
        },
        {
          name: "应用管理",
          path: TabsPaths.app,
          auth: APP_PERMISSIONS.list,
          hideChildrenInMenu: true,
          children: [
            {
              name: "新增",
              path: TabsPaths.appHandle,
              auth: APP_PERMISSIONS.create,
            },
            {
              name: "编辑",
              path: TabsPaths.appHandle + "/:id",
              auth: APP_PERMISSIONS.update,
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
          auth: routeAuth("GET", "/tabs/desktop/wallpaper/category"),
        },
        {
          name: "合集",
          path: TabsPaths.wallpaperCollection,
          auth: routeAuth("GET", "/tabs/desktop/wallpaper/collection"),
          hideChildrenInMenu: true,
          children: [
            {
              name: "新增",
              path: TabsPaths.wallpaperCollectionHandle,
              hideInTab: true,
            },
            {
              name: "编辑",
              path: TabsPaths.wallpaperCollectionHandle + "/:id",
              hideInTab: true,
            },
            {
              name: "详情",
              path: TabsPaths.wallpaperCollectionDetail + "/:id",
              hideInTab: true,
            },
          ],
        },
        {
          name: "壁纸",
          path: TabsPaths.wallpaperUpload,
          auth: routeAuth("GET", "/tabs/desktop/wallpaper/upload"),
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
            {
              name: "详情",
              path: TabsPaths.wallpaperDetail + "/:id",
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
          auth: routeAuth("GET", "/tabs/desktop/user-limit"),
          hideChildrenInMenu: true,
        },
        {
          name: "云同步",
          path: TabsPaths.desktopUserDataSync,
          auth: routeAuth("GET", "/tabs/user-data/sync/admin"),
          hideChildrenInMenu: true,
        },
        {
          name: "主题配置",
          path: TabsPaths.desktopThemeConfigCategory,
          auth: [
            routeAuth("GET", "/tabs/desktop/theme-config-category"),
            routeAuth("GET", "/tabs/desktop/theme-config"),
          ],
          hideChildrenInMenu: true,
          children: [
            {
              name: "主题分类",
              path: TabsPaths.desktopThemeConfigCategory,
              auth: routeAuth("GET", "/tabs/desktop/theme-config-category"),
            },
            {
              name: "主题配置",
              path: TabsPaths.desktopThemeConfigTheme,
              auth: routeAuth("GET", "/tabs/desktop/theme-config"),
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
          auth: routeAuth("GET", "/tabs/desktop/config/admin"),
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
