export type AppMode = "icon" | "full" | "settings" | "appIcon";
export type TimeFormat = "24h" | "12h";
export type ClockView = "world" | "stopwatch" | "timer";

import type { AppLocaleInfo } from "./i18n";

export interface ClockSettings {
  timezone: string;
  timeFormat: TimeFormat;
  showSeconds: boolean;
  showProgress: boolean;
  worldTimezones: string[];
  defaultView: ClockView;
  timerPresetMinutes: number;
}

export interface TimezoneOption {
  city: string;
  value: string;
}

export interface AppThemeInfo {
  activeThemeId: string;
}

export interface AppEvents {
  on: (event: string, handler: (payload: Record<string, unknown>) => void) => (() => void) | void;
  off?: (event: string, handler: (payload: Record<string, unknown>) => void) => void;
}

export interface AppStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: string) => Promise<void>;
}

export interface AppSDK {
  appId?: string;
  sizeId?: string;
  mode?: AppMode;
  theme?: AppThemeInfo;
  locale?: AppLocaleInfo;
  getLocale?: () => AppLocaleInfo;
  onLocaleChange?: (handler: (locale: AppLocaleInfo) => void) => (() => void) | void;
  storage?: AppStorage;
  events?: AppEvents;
  toast?: {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
  };
  onThemeChange?: (handler: (theme: AppThemeInfo) => void) => (() => void) | void;
}

export interface ClockProps {
  mode?: AppMode;
  pagePath?: string;
  title?: string;
  sdk?: AppSDK;
}
