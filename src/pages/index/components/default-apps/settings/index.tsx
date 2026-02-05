import { FC } from "react";
import {
  RiBrushFill,
  RiBrushLine,
  RiGlobalFill,
  RiInbox2Fill,
  RiInbox2Line,
  RiInformationLine,
  RiUserFill,
  RiUserLine,
  RiGlobalLine,
  RiInformationFill,
} from "@remixicon/react";
import { AppRoutedOverlay } from "@/components";
import { settingsRoute } from "./route-paths";

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
