import enUS from "./locales/en-US";
import zhCN from "./locales/zh-CN";
import type { WidgetLanguage } from "./helper";

export type WidgetResources = Record<WidgetLanguage, Record<string, string>>;

export const resources: WidgetResources = {
  "zh-CN": zhCN,
  "en-US": enUS,
};
