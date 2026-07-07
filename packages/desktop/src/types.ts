export type AppMode = "icon" | "full" | "settings" | "appIcon";

export type AppIcon = { type: "image"; src?: string } | { type: "custom" };

export type SupportedLocale = "zh-CN" | "en-US";
export type LocalizedText = Partial<Record<SupportedLocale, string>>;
export type LocalizedStringList = Partial<Record<SupportedLocale, string[]>>;

export interface DesktopSizeConfig {
  row: number;
  col: number;
  name: string;
  id?: string;
}

export interface DesktopAppPagePaths {
  settings?: string;
}

export interface DesktopAppSettingsField {
  key: string;
  label: string;
  type: "input" | "select" | "switch" | "textarea" | "number";
  default?: unknown;
  description?: string;
  options?: Array<{ label: string; value: unknown }>;
  placeholder?: string;
  rules?: Array<Record<string, unknown>>;
}

export interface DesktopAppConfig {
  id: string;
  name: string;
  displayName?: string;
  displayNameI18n?: LocalizedText;
  entry: string;
  container?: string;
  props?: Record<string, unknown>;
  size?: "small" | "medium" | "large";
  category?: string;
  settingsSchema?: DesktopAppSettingsField[];
  sizeConfigs?: DesktopSizeConfig[];
  defaultSizeId?: string;
  pagePaths?: DesktopAppPagePaths;
  supportAppMode?: boolean;
  appIcon?: AppIcon;
  appIconUrl?: string | null;
  sourceType?: "legacy" | "snapp";
  version?: string;
  author?: string;
  description?: string;
  descriptionI18n?: LocalizedText;
  tags?: string[];
  tagsI18n?: LocalizedStringList;
  availability?: "available" | "checking" | "unavailable";
  unavailableReason?: "disabledOrDeleted" | "verificationFailed";
}

export interface DesktopItemData {
  name: string;
  icon?: string;
  iconColor?: string;
  appConfig?: DesktopAppConfig;
  url?: string;
}

export interface DesktopSortItem<D = DesktopItemData> {
  id: string | number;
  type: "app" | "group" | string;
  dataType?: string;
  config?: {
    sizeId?: string;
    sourceId?: string;
  };
  data?: D & { name: string; icon?: string };
  children?: DesktopSortItem<D>[];
}

export interface DesktopPage<D = DesktopItemData> {
  id: string | number;
  type?: "page" | string;
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
  children: DesktopSortItem<D>[];
}

export interface DesktopRootItem<D = DesktopItemData> {
  id: string | number;
  type: "page" | "dock" | string;
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
  children?: DesktopSortItem<D>[];
}

export interface DesktopTypeConfig {
  sizeConfigs?: DesktopSizeConfig[];
  defaultSizeId?: string;
  allowResize?: boolean;
  allowContextMenu?: boolean;
  allowShare?: boolean;
  allowDelete?: boolean;
  allowInfo?: boolean;
}

export type DesktopTypeConfigMap = Record<string, DesktopTypeConfig>;

export interface DesktopResourceLike {
  name?: string;
  url?: string;
}

export interface DesktopAppSourceConfigSnapshot {
  name?: string;
  displayName?: string;
  displayNameI18n?: LocalizedText;
  description?: string;
  descriptionI18n?: LocalizedText;
  sizeConfigs?: DesktopSizeConfig[];
  defaultSizeId?: string;
  supportIconMode?: boolean;
  supportAppMode?: boolean;
  appIcon?: AppIcon;
  appIconUrl?: string | null;
  settingsSchema?: DesktopAppSettingsField[];
  pagePaths?: DesktopAppPagePaths;
  tags?: string[];
  tagsI18n?: LocalizedStringList;
  version?: string;
  author?: string;
  entryUrl?: string;
  [key: string]: unknown;
}

export interface DesktopAppSource {
  _id?: string;
  id?: string;
  name?: string;
  displayName?: string;
  displayNameI18n?: LocalizedText;
  description?: string;
  descriptionI18n?: LocalizedText;
  files?: DesktopResourceLike[];
  entryFileName?: string;
  dir?: string;
  icon?: DesktopResourceLike | null;
  iconUrl?: string | null;
  appIcon?: AppIcon;
  appIconUrl?: string | null;
  sizeConfigs?: DesktopSizeConfig[];
  defaultSizeId?: string;
  supportAppMode?: boolean;
  settingsSchema?: DesktopAppSettingsField[];
  pagePaths?: DesktopAppPagePaths;
  sourceType?: "legacy" | "snapp";
  packageName?: string;
  entryUrl?: string;
  version?: string;
  author?: string;
  tags?: string[];
  tagsI18n?: LocalizedStringList;
  updatedAt?: string;
  configSnapshot?: DesktopAppSourceConfigSnapshot | Record<string, unknown>;
}

export type ResolveDesktopAssetUrl = (entry: string) => string;
