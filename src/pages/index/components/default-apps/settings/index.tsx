import { FC } from "react";
import AccountView from "./views/account";
import BackupView from "./views/backup";
import { RiInbox2Fill, RiUserFill } from "@remixicon/react";
import { RiGlobalLine, RiInformationFill, RiKeyFill } from "@remixicon/react";
import { AppRoutedOverlay } from "@/components";
import AboutView from "./views/about";
import LanguageView from "./views/language";
import ThirdPartyView from "./views/third-party";
import { Navigate, Outlet, useLocation } from "react-router";

const UnderConstructionOverlay = () => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="w-[420px] max-w-[calc(100%-48px)] rounded-2xl border bg-white/70 p-6 shadow-xl">
        <div className="text-xs font-medium tracking-wide text-gray-600">
          示例
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight">开发中</div>
        <div className="mt-1 text-sm text-gray-600">
          该功能正在开发，敬请期待。
        </div>
        <div className="mt-5 grid gap-3">
          <div className="h-10 rounded-xl bg-gray-100" />
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-10 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
};

const SettingsOutletFrame = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const showUnderConstruction =
    pathname.startsWith("/settings/third-party") ||
    pathname.startsWith("/settings/language") ||
    pathname.startsWith("/settings/backup") ||
    pathname.startsWith("/settings/about");

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="h-full w-full overflow-y-auto">
        <Outlet />
      </div>
      {showUnderConstruction ? <UnderConstructionOverlay /> : null}
    </div>
  );
};

const SettingsModalRoute: FC = () => {
  return (
    <AppRoutedOverlay
      closeTo="/"
      title="设置"
      wrapContent
      outletWrapperClassName="h-full w-full overflow-hidden p-6"
      sidebarProps={{
        header: <div className="text-2xl font-bold tracking-tight">设置</div>,
        menuItems: [
          {
            key: "account",
            label: "账号",
            path: "/settings/account",
            icon: <RiUserFill size={16} />,
          },
          {
            key: "third-party",
            label: "第三方服务",
            path: "/settings/third-party",
            icon: <RiKeyFill size={16} />,
          },
          {
            key: "language",
            label: "语言",
            path: "/settings/language",
            icon: <RiGlobalLine size={16} />,
          },
          {
            key: "backup",
            label: "备份与恢复",
            path: "/settings/backup",
            icon: <RiInbox2Fill size={16} />,
          },
          {
            key: "about",
            label: "关于",
            path: "/settings/about",
            icon: <RiInformationFill size={16} />,
          },
        ],
      }}
    />
  );
};

export const settingsRoutes = {
  path: "settings",
  element: <SettingsModalRoute />,
  children: [
    {
      element: <SettingsOutletFrame />,
      children: [
        { index: true, element: <Navigate to="account" replace /> },
        { path: "account", element: <AccountView /> },
        { path: "third-party", element: <ThirdPartyView /> },
        { path: "language", element: <LanguageView /> },
        { path: "backup", element: <BackupView /> },
        { path: "about", element: <AboutView /> },
        { path: "*", element: <Navigate to="account" replace /> },
      ],
    },
  ],
};

export default SettingsModalRoute;
