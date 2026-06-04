export type WidgetMode = "icon" | "full";

export interface WidgetThemeInfo {
  activeThemeId: string;
}

export interface WidgetSDK {
  theme?: WidgetThemeInfo;
  onThemeChange?: (handler: (theme: WidgetThemeInfo) => void) => (() => void) | void;
}

export interface WidgetProps {
  mode?: WidgetMode;
  sdk?: WidgetSDK;
}
