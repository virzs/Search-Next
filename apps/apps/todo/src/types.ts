export type AppMode = "icon" | "full" | "settings" | "appIcon";

import type { AppLocaleInfo } from "./i18n";

export interface AppThemeInfo {
  activeThemeId: string;
}

export interface StorageChangedPayload {
  key?: string;
  value?: unknown;
  appId?: string;
}

export interface AppEvents {
  on: (event: string, handler: (payload: StorageChangedPayload) => void) => void;
  off: (event: string, handler: (payload: StorageChangedPayload) => void) => void;
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
  onThemeChange?: (handler: (theme: AppThemeInfo) => void) => (() => void) | void;
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
  mode?: AppMode;
  pagePath?: string;
  title?: string;
  sdk?: AppSDK;
}
