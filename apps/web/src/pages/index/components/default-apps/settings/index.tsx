import { FC } from "react";
import {
  RiBrushFill,
  RiBrushLine,
  RiCodeSSlashFill,
  RiCodeSSlashLine,
  RiGlobalFill,
  RiInbox2Fill,
  RiInbox2Line,
  RiInformationLine,
  RiSearchLine,
  RiSearchFill,
  RiUserFill,
  RiUserLine,
  RiGlobalLine,
  RiInformationFill,
} from "@remixicon/react";
import { css } from "@emotion/css";
import { AppRoutedOverlay } from "@/components";
import { settingsRoute } from "./route-paths";

const SettingsModalRoute: FC = () => {
  return (
    <AppRoutedOverlay
      closeTo="/"
      title="设置"
      wrapContent
      overlayProps={{
        modalProps: { width: 940 },
      }}
      sidebarProps={{
        search: {
          placeholder: "搜索",
          prefix: <RiSearchLine size={16} className="text-gray-400" />,
          emptyText: "没有匹配设置",
        },
        className: settingsSidebarClassName,
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
            key: "search",
            label: "搜索",
            path: settingsRoute.path.search,
            icon: <RiSearchLine size={16} />,
            activeIcon: <RiSearchFill size={16} />,
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
          {
            key: "developer",
            label: "开发者",
            path: settingsRoute.path.developer,
            icon: <RiCodeSSlashLine size={16} />,
            activeIcon: <RiCodeSSlashFill size={16} />,
          },
        ],
        menuStyles: {
          item: {
            paddingLeft: 14,
          },
        },
        footer: "Search Next Settings",
      }}
      keepAlive={{ enabled: true }}
    />
  );
};

export default SettingsModalRoute;

const settingsSidebarClassName = css`
  .ant-menu:focus,
  .ant-menu:focus-visible {
    outline: none !important;
  }
`;
