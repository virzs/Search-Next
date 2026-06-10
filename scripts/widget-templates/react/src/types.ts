export type WidgetMode = "icon" | "full" | "settings";

export interface WidgetThemeInfo {
  activeThemeId: string;
}

export interface WidgetSDK {
  sizeId?: string;
  mode?: WidgetMode;
  theme?: WidgetThemeInfo;
  onThemeChange?: (handler: (theme: WidgetThemeInfo) => void) => (() => void) | void;
}

export interface WidgetProps {
  mode?: WidgetMode;
  pagePath?: string;
  sdk?: WidgetSDK;
}
