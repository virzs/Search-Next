export type AppMode = "icon" | "full" | "settings" | "appIcon";
export type WeekStart = "sun" | "mon";
export type EventDensity = "compact" | "normal" | "detailed";

import type { AppLocaleInfo } from "./i18n";

export interface CalendarEvent {
  id?: string;
  title: string;
  startsAt: string | number | Date;
  endsAt?: string | number | Date;
  location?: string;
  color?: string;
  allDay?: boolean;
}

export interface CalendarSettings {
  weekStart: WeekStart;
  accentColor: string;
  eventDensity: EventDensity;
}

export interface StorageChangedPayload extends Record<string, unknown> {
  appId?: string;
  key?: string;
  value?: unknown;
}

export interface AppThemeInfo {
  activeThemeId: string;
}

export interface AppSDK {
  appId?: string;
  sizeId?: string;
  mode?: AppMode;
  theme?: AppThemeInfo;
  locale?: AppLocaleInfo;
  getLocale?: () => AppLocaleInfo;
  onLocaleChange?: (handler: (locale: AppLocaleInfo) => void) => (() => void) | void;
  storage?: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: string) => Promise<void>;
  };
  events?: {
    on: (event: string, handler: (payload: Record<string, unknown>) => void) => (() => void) | void;
    off?: (event: string, handler: (payload: Record<string, unknown>) => void) => void;
  };
  toast?: {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
  };
  onThemeChange?: (handler: (theme: AppThemeInfo) => void) => (() => void) | void;
}

export interface AppProps {
  mode?: AppMode;
  pagePath?: string;
  title?: string;
  initialDate?: string | number | Date;
  events?: CalendarEvent[];
  sdk?: AppSDK;
}
