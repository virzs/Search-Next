import enUS from "./locales/en-US";
import zhCN from "./locales/zh-CN";
import type { AppLanguage } from "./helper";

export type AppResources = Record<AppLanguage, Record<string, string>>;

export const resources: AppResources = {
  "zh-CN": zhCN,
  "en-US": enUS,
};
