import { createDefaultDesktopAppSizeConfigs } from "./constants";
import { getAppDesktopType } from "./identify";
import type {
  DesktopAppSource,
  DesktopAppSourceConfigSnapshot,
  DesktopItemData,
  DesktopPage,
  DesktopSortItem,
  DesktopTypeConfigMap,
} from "./types";

const getAppId = (app: DesktopAppSource) => app._id || app.id || "";

const collectAppItems = (
  items: DesktopSortItem<DesktopItemData>[] | undefined,
  map: DesktopTypeConfigMap,
) => {
  if (!items?.length) return;
  for (const item of items) {
    const appType = getAppDesktopType(item);
    const appConfig = item.data?.appConfig;
    if (appType && appConfig) {
      const sizeConfigs = appConfig.sizeConfigs?.length
        ? appConfig.sizeConfigs
        : createDefaultDesktopAppSizeConfigs();
      map[appType] = {
        sizeConfigs,
        defaultSizeId: appConfig.defaultSizeId || "2x2",
        allowShare: false,
        allowInfo: false,
        allowDelete: true,
        allowResize: sizeConfigs.length > 1,
      };
    }
    collectAppItems(item.children, map);
  }
};

export const buildDesktopTypeConfigMap = (
  apps: DesktopAppSource[] = [],
  pages: DesktopPage[] = [],
): DesktopTypeConfigMap => {
  const map: DesktopTypeConfigMap = {};
  for (const app of apps) {
    const appId = getAppId(app);
    if (!appId) continue;
    const snapshot = app.configSnapshot as
      | DesktopAppSourceConfigSnapshot
      | undefined;
    const sizeConfigs = snapshot?.sizeConfigs?.length
      ? snapshot.sizeConfigs
      : app.sizeConfigs;
    const defaultSizeId =
      snapshot?.defaultSizeId ||
      app.defaultSizeId ||
      sizeConfigs?.[0]?.id ||
      "2x2";
    map[`app:${appId}`] = {
      sizeConfigs: sizeConfigs?.length
        ? sizeConfigs
        : createDefaultDesktopAppSizeConfigs(),
      defaultSizeId,
      allowShare: false,
      allowInfo: false,
      allowDelete: true,
      allowResize: (sizeConfigs?.length ?? 0) > 1,
    };
  }
  for (const page of pages) collectAppItems(page.children, map);
  return map;
};
