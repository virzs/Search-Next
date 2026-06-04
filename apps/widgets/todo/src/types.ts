export type WidgetMode = "icon" | "full";

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
  theme?: WidgetThemeInfo;
  storage?: WidgetStorage;
  events?: WidgetEvents;
  onThemeChange?: (handler: (theme: WidgetThemeInfo) => void) => (() => void) | void;
}

export interface TodoItem {
  id: string;
  title: string;
  done: boolean;
}

export interface TodoProps {
  mode?: WidgetMode;
  sdk?: WidgetSDK;
}
