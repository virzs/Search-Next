export type WidgetMode = "icon" | "full" | "settings" | "appIcon";

import type { WidgetLocaleInfo } from "./i18n";

export interface WidgetThemeInfo {
  activeThemeId: string;
}

export interface StorageChangedPayload {
  key?: string;
  value?: unknown;
  widgetId?: string;
}

export interface WidgetEvents {
  on: (event: string, handler: (payload: StorageChangedPayload) => void) => void;
  off: (event: string, handler: (payload: StorageChangedPayload) => void) => void;
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
  onThemeChange?: (handler: (theme: WidgetThemeInfo) => void) => (() => void) | void;
}

export type TodoPriority = "high" | "normal" | "low";
export type TodoSortMode = "priority" | "created" | "completed";

export interface TodoItem {
  id: string;
  title: string;
  done: boolean;
  createdAt?: number;
  note?: string;
  priority?: TodoPriority;
}

export interface TodoSettings {
  accentColor: string;
  showCompleted: boolean;
  compact: boolean;
  sortMode: TodoSortMode;
}

export interface TodoProps {
  mode?: WidgetMode;
  pagePath?: string;
  title?: string;
  sdk?: WidgetSDK;
}
