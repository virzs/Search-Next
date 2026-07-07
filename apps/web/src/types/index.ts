// 桌面项目类型定义
export type ItemType = "group" | "app";

// 应用配置接口
export type AppMode = "icon" | "full" | "settings" | "appIcon";

export type AppIcon =
  | { type: "image"; src?: string }
  | { type: "custom" };

export type SupportedLocale = "zh-CN" | "en-US";
export type LocalizedText = Partial<Record<SupportedLocale, string>>;
export type LocalizedStringList = Partial<Record<SupportedLocale, string[]>>;

export interface AppConfigSizeConfig {
  row: number;
  col: number;
  name: string;
  id?: string;
}

export interface AppConfig {
  id: string;
  name: string;
  displayName?: string;
  displayNameI18n?: LocalizedText;
  entry: string;
  container?: string;
  props?: Record<string, unknown>;
  size?: "small" | "medium" | "large";
  category?: string;
  settingsSchema?: AppSettingsField[];
  sizeConfigs?: AppConfigSizeConfig[];
  defaultSizeId?: string;
  pagePaths?: AppPagePaths;
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

// 桌面项目数据接口
export interface DesktopItemData {
  name: string;
  icon?: string | { iconName: string; iconType: string };
  appConfig?: AppConfig; // 应用特有配置
  url?: string; // 网站链接 (for app type)
}

export interface Resource {
  name: string;
  key: string;
  mimetype: string;
  size: number;
  url?: string;
}

export interface AppScreenshot {
  mode?: string;
  themeId: string;
  sizeId: string;
  width?: number;
  height?: number;
  file: string;
  url: string;
}

// 应用尺寸配置（对应后端 sizeConfigs 字段）
export interface AppSizeConfig {
  row: number;
  col: number;
  name: string;
  id: string;
}

export interface AppPagePaths {
  /** 配置后，宿主用应用 settings mode 渲染自带设置页 */
  settings?: string;
}

// 应用分类信息（populated 后的结构）
export interface AppClassifyInfo {
  _id: string;
  name: string;
}

// 应用设置表单 schema 单项定义（以 antd 表单组件为基准）
export interface AppSettingsField {
  key: string;               // 字段唯一标识
  label: string;             // 表单标签
  type: 'input' | 'select' | 'switch' | 'textarea' | 'number'; // antd 表单组件类型
  default?: any;             // 默认值
  description?: string;      // 字段说明
  options?: Array<{ label: string; value: any }>; // select 类型的选项列表
  placeholder?: string;      // 占位文本
  rules?: Array<Record<string, any>>; // antd 表单验证规则
}

// 后端应用完整数据结构（公开API返回）
export interface AppApiItem {
  _id: string;
  name: string;
  displayName?: string;
  displayNameI18n?: LocalizedText;
  description?: string;
  descriptionI18n?: LocalizedText;
  previewImages?: Resource[];
  files?: Resource[];
  entryFileName: string;
  dir?: string;
  icon?: Resource | { url?: string };
  classify?: AppClassifyInfo;
  enable: boolean;
  version?: string;
  author?: string;
  sizeConfigs: AppSizeConfig[];
  defaultSizeId: string;
  supportIconMode: boolean;
  supportAppMode?: boolean;
  appIcon?: AppIcon;
  appIconUrl?: string | null;
  tags: string[];
  tagsI18n?: LocalizedStringList;
  sortOrder: number;
  settingsSchema?: AppSettingsField[]; // 设置表单Schema
  pagePaths?: AppPagePaths;
  sourceType?: 'legacy' | 'snapp';
  packageName?: string;
  entryUrl?: string;
  iconUrl?: string;
  screenshots?: AppScreenshot[];
  configSnapshot?: {
    name?: string;
    displayName?: string;
    displayNameI18n?: LocalizedText;
    description?: string;
    descriptionI18n?: LocalizedText;
    sizeConfigs?: AppSizeConfig[];
    defaultSizeId?: string;
    supportIconMode?: boolean;
    supportAppMode?: boolean;
    appIcon?: AppIcon;
    appIconUrl?: string | null;
    settingsSchema?: AppSettingsField[];
    pagePaths?: AppPagePaths;
    tags?: string[];
    version?: string;
    author?: string;
    screenshots?: AppScreenshot[];
    tagsI18n?: LocalizedStringList;
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
}
