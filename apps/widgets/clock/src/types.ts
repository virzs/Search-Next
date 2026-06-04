export type WidgetMode = "icon" | "full";

export interface WidgetThemeInfo {
  activeThemeId: string;
}

export interface WidgetEvents {
  on: (event: string, handler: (payload: Record<string, unknown>) => void) => (() => void) | void;
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

export interface ClockProps {
  mode?: WidgetMode;
  title?: string;
  sdk?: WidgetSDK;
}
