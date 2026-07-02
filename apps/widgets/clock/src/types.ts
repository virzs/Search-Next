export type WidgetMode = "icon" | "full" | "settings" | "appIcon";
export type TimeFormat = "24h" | "12h";
export type ClockView = "world" | "stopwatch" | "timer";

import type { WidgetLocaleInfo } from "./i18n";

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

export interface WidgetThemeInfo {
  activeThemeId: string;
}

export interface WidgetEvents {
  on: (event: string, handler: (payload: Record<string, unknown>) => void) => (() => void) | void;
  off?: (event: string, handler: (payload: Record<string, unknown>) => void) => void;
}

export interface WidgetStorage {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: string) => Promise<void>;
}

export interface WidgetSDK {
  widgetId?: string;
  sizeId?: string;
  mode?: WidgetMode;
  theme?: WidgetThemeInfo;
  locale?: WidgetLocaleInfo;
  getLocale?: () => WidgetLocaleInfo;
  onLocaleChange?: (handler: (locale: WidgetLocaleInfo) => void) => (() => void) | void;
  storage?: WidgetStorage;
  events?: WidgetEvents;
  toast?: {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
  };
  onThemeChange?: (handler: (theme: WidgetThemeInfo) => void) => (() => void) | void;
}

export interface ClockProps {
  mode?: WidgetMode;
  pagePath?: string;
  title?: string;
  sdk?: WidgetSDK;
}
