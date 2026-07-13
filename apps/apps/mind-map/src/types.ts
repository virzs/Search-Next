export type AppMode = "icon" | "full" | "settings" | "appIcon";
export type AppLanguage = "zh-CN" | "en-US";

export interface AppLocaleInfo { language: AppLanguage; direction?: "ltr" | "rtl" }
export interface AppThemeInfo { activeThemeId: string }
export interface AppSDK {
  appId?: string;
  sizeId?: string;
  mode?: AppMode;
  theme?: AppThemeInfo;
  locale?: AppLocaleInfo;
  getLocale?: () => AppLocaleInfo;
  onLocaleChange?: (handler: (locale: AppLocaleInfo) => void) => (() => void) | void;
  storage?: { get: (key: string) => Promise<unknown>; set: (key: string, value: string) => Promise<void> };
  events?: { on: (event: string, handler: (payload: Record<string, unknown>) => void) => (() => void) | void; off?: (event: string, handler: (payload: Record<string, unknown>) => void) => void };
  toast?: { success: (message: string, description?: string) => void; error: (message: string, description?: string) => void };
  navigate?: (path: string) => void;
  onThemeChange?: (handler: (theme: AppThemeInfo) => void) => (() => void) | void;
}
export interface AppProps { mode?: AppMode; pagePath?: string; title?: string; sdk?: AppSDK }
