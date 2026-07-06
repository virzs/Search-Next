export type AppMode = "icon" | "full" | "settings" | "appIcon";

import type { AppLocaleInfo } from "./i18n";

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
    emit?: (event: string, payload: Record<string, unknown>) => void;
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
  sdk?: AppSDK;
}

export interface StorageChangedPayload {
  appId?: string;
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
