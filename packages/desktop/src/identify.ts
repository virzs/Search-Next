import type { DesktopItemData, DesktopSortItem } from "./types";

export const getAppDesktopType = (
  item: Pick<DesktopSortItem, "type" | "dataType">,
) => {
  if (
    typeof item.type === "string" &&
    typeof item.dataType === "string" &&
    item.type === item.dataType &&
    item.type.startsWith("app:") &&
    !item.type.startsWith("app-launcher:")
  ) {
    return item.type;
  }
  return null;
};

export const getAppLauncherDesktopType = (
  item: Pick<DesktopSortItem, "type" | "dataType">,
) => {
  if (
    item.type === "app" &&
    typeof item.dataType === "string" &&
    item.dataType.startsWith("app-launcher:")
  ) {
    return item.dataType;
  }
  return null;
};

export const getDesktopItemAppId = (
  item: Pick<DesktopSortItem<DesktopItemData>, "type" | "dataType" | "data">,
) => {
  const appLauncherDesktopType = getAppLauncherDesktopType(item);
  if (appLauncherDesktopType) {
    return appLauncherDesktopType.replace("app-launcher:", "");
  }

  const appDesktopType = getAppDesktopType(item);
  if (appDesktopType) return appDesktopType.replace("app:", "");

  return null;
};
