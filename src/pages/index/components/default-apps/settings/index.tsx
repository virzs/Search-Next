import { FC } from "react";
import {
  RiBrushFill,
  RiBrushLine,
  RiGlobalFill,
  RiInbox2Fill,
  RiInbox2Line,
  RiInformationLine,
  RiKeyLine,
  RiUserFill,
  RiUserLine,
} from "@remixicon/react";
import { RiGlobalLine, RiInformationFill, RiKeyFill } from "@remixicon/react";
import { AppRoutedOverlay } from "@/components";
import { Outlet, useLocation } from "react-router";
import { settingsRoute } from "./route-paths";

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

export const SettingsOutletFrame = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const showUnderConstruction =
    pathname.startsWith(settingsRoute.path.thirdParty) ||
    pathname.startsWith(settingsRoute.path.language) ||
    pathname.startsWith(settingsRoute.path.backup) ||
    pathname.startsWith(settingsRoute.path.about);

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
      sidebarProps={{
        header: <div className="text-2xl font-bold tracking-tight">设置</div>,
        menuItems: [
          {
            key: "account",
            label: "账号",
            path: settingsRoute.path.account,
            icon: <RiUserLine size={16} />,
            activeIcon: <RiUserFill size={16} />,
          },
          {
            key: "personalization",
            label: "个性化",
            path: settingsRoute.path.personalization,
            icon: <RiBrushLine size={16} />,
            activeIcon: <RiBrushFill size={16} />,
          },
          {
            key: "third-party",
            label: "第三方服务",
            path: settingsRoute.path.thirdParty,
            icon: <RiKeyLine size={16} />,
            activeIcon: <RiKeyFill size={16} />,
          },
          {
            key: "language",
            label: "语言",
            path: settingsRoute.path.language,
            icon: <RiGlobalLine size={16} />,
            activeIcon: <RiGlobalFill size={16} />,
          },
          {
            key: "backup",
            label: "备份与恢复",
            path: settingsRoute.path.backup,
            icon: <RiInbox2Line size={16} />,
            activeIcon: <RiInbox2Fill size={16} />,
          },
          {
            key: "about",
            label: "关于",
            path: settingsRoute.path.about,
            icon: <RiInformationLine size={16} />,
            activeIcon: <RiInformationFill size={16} />,
          },
        ],
      }}
    />
  );
};

export default SettingsModalRoute;
