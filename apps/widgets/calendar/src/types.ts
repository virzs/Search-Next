export type WidgetMode = "icon" | "full" | "settings";
export type WeekStart = "sun" | "mon";
export type EventDensity = "compact" | "normal" | "detailed";

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
  widgetId?: string;
  key?: string;
  value?: unknown;
}

export interface WidgetThemeInfo {
  activeThemeId: string;
}

export interface WidgetSDK {
  widgetId?: string;
  sizeId?: string;
  mode?: WidgetMode;
  theme?: WidgetThemeInfo;
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
  onThemeChange?: (handler: (theme: WidgetThemeInfo) => void) => (() => void) | void;
}

export interface WidgetProps {
  mode?: WidgetMode;
  pagePath?: string;
  title?: string;
  initialDate?: string | number | Date;
  events?: CalendarEvent[];
  sdk?: WidgetSDK;
}
