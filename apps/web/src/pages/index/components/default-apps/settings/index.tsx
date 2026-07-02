import { FC } from "react";
import { RiSearchLine } from "@remixicon/react";
import { css } from "@emotion/css";
import { AppRoutedOverlay } from "@/components";
import { createSidebarMenuItems } from "../route-config";
import {
  settingsRootRouteDefinition,
  settingsRouteDefinitions,
} from "./route-definitions";

const SettingsModalRoute: FC = () => {
  const menuItems = createSidebarMenuItems(settingsRouteDefinitions);

  return (
    <AppRoutedOverlay
      closeTo="/"
      title={settingsRootRouteDefinition.meta.title}
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
        menuItems,
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
