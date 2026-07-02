import { AppRoutedOverlay } from "@/components";
import { FC } from "react";
import { createSidebarMenuItems } from "../route-config";
import {
  personalizationRootRouteDefinition,
  personalizationRouteDefinitions,
} from "./route-definitions";
import { useI18n } from "@/i18n";

const PersonalizationModalRoute: FC = () => {
  const { routeTextResolver } = useI18n();
  const menuItems = createSidebarMenuItems(personalizationRouteDefinitions, {
    textResolver: routeTextResolver,
  });

  return (
    <AppRoutedOverlay
      closeTo="/"
      title={routeTextResolver(personalizationRootRouteDefinition.meta.title, {
        route: personalizationRootRouteDefinition,
        field: "title",
      })}
      wrapContent
      componentSize="small"
      keepAlive={{ enabled: true }}
      overlayProps={{
        modalProps: { width: 940 },
      }}
      sidebarProps={{
        menuItems,
        menuStyles: {
          item: {
            height: 32,
            lineHeight: "32px",
            paddingLeft: 14,
          },
        },
      }}
    />
  );
};

export default PersonalizationModalRoute;
