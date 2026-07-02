import { FC } from "react";
import { RiSearchLine } from "@remixicon/react";
import { css } from "@emotion/css";
import { AppRoutedOverlay } from "@/components";
import { createSidebarMenuItems } from "../route-config";
import {
  settingsRootRouteDefinition,
  settingsRouteDefinitions,
} from "./route-definitions";
import { useI18n } from "@/i18n";

const SettingsModalRoute: FC = () => {
  const { routeTextResolver, t } = useI18n();
  const menuItems = createSidebarMenuItems(settingsRouteDefinitions, {
    textResolver: routeTextResolver,
  });

  return (
    <AppRoutedOverlay
      closeTo="/"
      title={routeTextResolver(settingsRootRouteDefinition.meta.title, {
        route: settingsRootRouteDefinition,
        field: "title",
      })}
      wrapContent
      overlayProps={{
        modalProps: { width: 940 },
      }}
      sidebarProps={{
        search: {
          placeholder: t("ui.search"),
          prefix: <RiSearchLine size={16} className="text-gray-400" />,
          emptyText: t("ui.noMatchingSettings"),
        },
        className: settingsSidebarClassName,
        menuItems,
        menuStyles: {
          item: {
            paddingLeft: 14,
          },
        },
        footer: t("ui.searchNextSettings"),
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
