import enUS from "./locales/en-US";
import zhCN from "./locales/zh-CN";

type AppResources = Record<"zh-CN" | "en-US", Record<string, string>>;

export const resources = {
  "zh-CN": zhCN,
  "en-US": enUS,
} satisfies AppResources;
