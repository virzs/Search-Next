import type { DesktopSizeConfig, DesktopSortItem } from "./types";

export const DESKTOP_FIXED_APP_IDS = {
  account: "*:my",
  personalization: "*:personalization",
  store: "*:store",
  settings: "*:settings",
} as const;

export const DEFAULT_DESKTOP_FIXED_DOCK_ITEMS: DesktopSortItem[] = [
  {
    id: DESKTOP_FIXED_APP_IDS.account,
    type: "app",
    data: { name: "账号" },
  },
  {
    id: DESKTOP_FIXED_APP_IDS.personalization,
    type: "app",
    data: { name: "个性化" },
  },
  {
    id: DESKTOP_FIXED_APP_IDS.store,
    type: "app",
    data: { name: "应用商店" },
  },
  {
    id: DESKTOP_FIXED_APP_IDS.settings,
    type: "app",
    data: { name: "设置" },
  },
];

export const DEFAULT_DESKTOP_APP_SIZE: DesktopSizeConfig = {
  row: 2,
  col: 2,
  name: "2x2",
  id: "2x2",
};

export const createDefaultDesktopAppSizeConfigs = (): DesktopSizeConfig[] => [
  { ...DEFAULT_DESKTOP_APP_SIZE },
];
