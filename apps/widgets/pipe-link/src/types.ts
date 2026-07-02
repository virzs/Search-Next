export type WidgetMode = "icon" | "full" | "settings" | "appIcon";

import type { WidgetLocaleInfo } from "./i18n";

export interface WidgetThemeInfo {
  activeThemeId: string;
}

export interface WidgetSDK {
  widgetId?: string;
  sizeId?: string;
  mode?: WidgetMode;
  theme?: WidgetThemeInfo;
  locale?: WidgetLocaleInfo;
  getLocale?: () => WidgetLocaleInfo;
  onLocaleChange?: (handler: (locale: WidgetLocaleInfo) => void) => (() => void) | void;
  storage?: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: string) => Promise<void>;
  };
  events?: {
    on: (event: string, handler: (payload: Record<string, unknown>) => void) => (() => void) | void;
    off?: (event: string, handler: (payload: Record<string, unknown>) => void) => void;
    emit?: (event: string, payload: Record<string, unknown>) => void;
  };
  toast?: {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
  };
  onThemeChange?: (handler: (theme: WidgetThemeInfo) => void) => (() => void) | void;
}

export interface WidgetProps {
  mode?: WidgetMode;
  pagePath?: string;
  title?: string;
  sdk?: WidgetSDK;
}

export interface StorageChangedPayload {
  widgetId?: string;
  key?: string;
  value?: unknown;
}

export type AnimationLevel = "low" | "normal" | "high";

export interface PipeLinkSettings {
  animation: AnimationLevel;
  showHints: boolean;
}

export interface ProgressState {
  completedLevelIds: string[];
  bestSteps: Record<string, number>;
  activeLevelId: string;
}
