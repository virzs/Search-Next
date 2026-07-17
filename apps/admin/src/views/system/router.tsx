import { RouteObject } from "react-router";
import Role from "./role";
import Permission from "./permission";
import { Menu } from "@/utils/menu";
import Setting from "./setting";
import RoleHandle from "./role/handle";
import RoleDetail from "./role/detail";
import Version from "./version";
import VersionHandle from "./version/handle";
import VersionDetail from "./version/detail";
import Notice from "./notice";
import NoticeHandle from "./notice/handle";
import NoticeDetail from "./notice/detail";
import ReleaseNotice from "./notice/release";
import { RiSettings3Line } from "@remixicon/react";
import { routeAuth } from "@/contexts/AccessContext";
import LegalDocumentManagement from "./legal-document";
import LegalDocumentHandle from "./legal-document/handle";
import LegalDocumentHistory from "./legal-document/history";
import LegalDocumentDetail from "./legal-document/detail";

export const SystemPaths = {
  index: "/system",
  role: "/system/role",
  roleHandle: "/system/role/handle",
  permission: "/system/permission",
  setting: "/system/setting",
  version: "/system/version",
  versionHandle: "/system/version/handle",
  notice: "/system/notice",
  noticeHandle: "/system/notice/handle",
  noticeRelease: "/system/notice/release",
  legalDocuments: "/system/legal-documents",
  legalDocumentHandle: "/system/legal-documents/handle",
  legalDocumentHistory: "/system/legal-documents/history",
  legalDocumentRevision: "/system/legal-documents/revision",
};

const SystemRouter: RouteObject = {
  path: "/system",
  children: [
    {
      path: SystemPaths.role,
      element: <Role />,
    },
    {
      path: SystemPaths.roleHandle,
      element: <RoleHandle />,
    },
    {
      path: SystemPaths.roleHandle + "/:id",
      element: <RoleHandle />,
    },
    {
      path: SystemPaths.role + "/:id",
      element: <RoleDetail />,
    },
    {
      path: SystemPaths.setting,
      element: <Setting />,
    },
    {
      path: SystemPaths.permission,
      element: <Permission />,
    },
    {
      path: SystemPaths.setting,
      element: <Setting />,
    },
    {
      path: SystemPaths.version,
      element: <Version />,
    },
    {
      path: SystemPaths.versionHandle,
      element: <VersionHandle />,
    },
    {
      path: SystemPaths.versionHandle + "/:id",
      element: <VersionHandle />,
    },
    {
      path: SystemPaths.version + "/:id",
      element: <VersionDetail />,
    },
    {
      path: SystemPaths.notice,
      element: <Notice />,
    },
    {
      path: SystemPaths.noticeHandle,
      element: <NoticeHandle />,
    },
    {
      path: SystemPaths.noticeHandle + "/:id",
      element: <NoticeHandle />,
    },
    {
      path: SystemPaths.noticeRelease,
      element: <ReleaseNotice />,
    },
    {
      path: SystemPaths.notice + "/:id",
      element: <NoticeDetail />,
    },
    {
      path: SystemPaths.legalDocuments,
      element: <LegalDocumentManagement />,
    },
    {
      path: SystemPaths.legalDocumentHandle + "/:type",
      element: <LegalDocumentHandle />,
    },
    {
      path: SystemPaths.legalDocumentHistory + "/:type",
      element: <LegalDocumentHistory />,
    },
    {
      path: SystemPaths.legalDocumentRevision + "/:type/:revisionId",
      element: <LegalDocumentDetail />,
    },
  ],
};

export const SystemMenu: Menu = {
  name: "系统",
  path: SystemPaths.index,
  icon: <RiSettings3Line size={16} />,
  children: [
    {
      name: "角色",
      path: SystemPaths.role,
      auth: routeAuth("GET", "/system/role"),
      hideChildrenInMenu: true,
      children: [
        {
          name: "新增",
          path: SystemPaths.roleHandle,
        },
        {
          name: "编辑",
          path: SystemPaths.roleHandle + "/:id",
        },
        {
          name: "详情",
          path: SystemPaths.role + "/:id",
        },
      ],
    },
    {
      name: "权限",
      path: SystemPaths.permission,
      auth: routeAuth("GET", "/system/permission/tree"),
    },
    {
      name: "版本",
      path: SystemPaths.version,
      auth: routeAuth("GET", "/system/version"),
      hideChildrenInMenu: true,
      children: [
        {
          name: "新增",
          path: SystemPaths.versionHandle,
        },
        {
          name: "编辑",
          path: SystemPaths.versionHandle + "/:id",
        },
        {
          name: "详情",
          path: SystemPaths.version + "/:id",
        },
      ],
    },
    {
      name: "通知",
      path: SystemPaths.notice,
      auth: routeAuth("GET", "/system/notice"),
      hideChildrenInMenu: true,
      children: [
        {
          name: "版本公告",
          path: SystemPaths.noticeRelease,
          auth: routeAuth("GET", "/system/version/release-candidates"),
        },
        {
          name: "新增",
          path: SystemPaths.noticeHandle,
        },
        {
          name: "编辑",
          path: SystemPaths.noticeHandle + "/:id",
        },
        {
          name: "详情",
          path: SystemPaths.notice + "/:id",
        },
      ],
    },
    {
      name: "协议与隐私",
      path: SystemPaths.legalDocuments,
      auth: routeAuth("GET", "/system/legal-documents/:type/draft"),
      hideChildrenInMenu: true,
      children: [
        {
          name: "编辑",
          path: SystemPaths.legalDocumentHandle + "/:type",
        },
        {
          name: "发布历史",
          path: SystemPaths.legalDocumentHistory + "/:type",
        },
        {
          name: "版本详情",
          path:
            SystemPaths.legalDocumentRevision + "/:type/:revisionId",
        },
      ],
    },
    {
      name: "设置",
      path: SystemPaths.setting,
      auth: routeAuth("GET", "/system/project"),
    },
  ],
};

export default SystemRouter;
