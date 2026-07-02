import { AppRoutedOverlay } from "@/components";
import { FC } from "react";
import { createSidebarMenuItems } from "../route-config";
import {
  personalizationRootRouteDefinition,
  personalizationRouteDefinitions,
} from "./route-definitions";

const PersonalizationModalRoute: FC = () => {
  const menuItems = createSidebarMenuItems(personalizationRouteDefinitions);

  return (
    <AppRoutedOverlay
      closeTo="/"
      title={personalizationRootRouteDefinition.meta.title}
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
