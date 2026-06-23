import { Menu } from "@/utils/menu";
import { RiFolderLine } from "@remixicon/react";
import { RouteObject } from "react-router";
import R2Page from "./r2";
import R2DetailPage from "./qiniu/detail";
import LocalDetailPage from "./qiniu/detail";
import RecyclePage from "./recycle/index";
import LocalPage from "./local";

export const ResourcePaths = {
  index: "/resource",
  r2: "/resource/r2",
  r2Detail: "/resource/r2/:id",
  local: "/resource/local",
  localDetail: "/resource/local/:id",
  recycle: "/resource/recycle",
};

const ResourceRouter: RouteObject = {
  path: ResourcePaths.index,
  children: [
    {
      path: ResourcePaths.r2,
      element: <R2Page />,
    },
    {
      path: ResourcePaths.r2Detail,
      element: <R2DetailPage />,
    },
    {
      path: ResourcePaths.local,
      element: <LocalPage />,
    },
    {
      path: ResourcePaths.localDetail,
      element: <LocalDetailPage />,
    },
    {
      path: ResourcePaths.recycle,
      element: <RecyclePage />,
    },
  ],
};

export const ResourceMenu: Menu = {
  name: "资源",
  path: ResourcePaths.index,
  icon: <RiFolderLine size={16} />,
  children: [
    {
      name: "Cloudflare R2",
      path: ResourcePaths.r2,
      hideChildrenInMenu: true,
      children: [
        {
          name: "详情",
          path: ResourcePaths.r2Detail,
        },
      ],
    },
    {
      name: "本地资源",
      path: ResourcePaths.local,
      hideChildrenInMenu: true,
      children: [
        {
          name: "详情",
          path: ResourcePaths.localDetail,
        },
      ],
    },
    {
      name: "回收站",
      path: ResourcePaths.recycle,
    },
  ],
};

export default ResourceRouter;
