// 桌面项目类型定义
export type ItemType = "group" | "app" | "widget";

// 小组件配置接口
export interface WidgetConfig {
  id: string;
  name: string;
  entry: string;
  container?: string;
  props?: Record<string, unknown>;
  size?: "small" | "medium" | "large";
  category?: string;
  settingsSchema?: WidgetSettingsField[];
}

// 桌面项目数据接口
export interface DesktopItemData {
  name: string;
  icon?: string | { iconName: string; iconType: string };
  widgetConfig?: WidgetConfig; // 小组件特有配置
  url?: string; // 网站链接 (for app type)
}

export interface Resource {
  name: string;
  key: string;
  mimetype: string;
  size: number;
  url?: string;
}

// 小组件尺寸配置（对应后端 sizeConfigs 字段）
export interface WidgetSizeConfig {
  row: number;
  col: number;
  name: string;
  id: string;
}

// 小组件分类信息（populated 后的结构）
export interface WidgetClassifyInfo {
  _id: string;
  name: string;
}

// 小组件设置表单 schema 单项定义（以 antd 表单组件为基准）
export interface WidgetSettingsField {
  key: string;               // 字段唯一标识
  label: string;             // 表单标签
  type: 'input' | 'select' | 'switch' | 'textarea' | 'number'; // antd 表单组件类型
  default?: any;             // 默认值
  description?: string;      // 字段说明
  options?: Array<{ label: string; value: any }>; // select 类型的选项列表
  placeholder?: string;      // 占位文本
  rules?: Array<Record<string, any>>; // antd 表单验证规则
}

// 后端小组件完整数据结构（公开API返回）
export interface WidgetApiItem {
  _id: string;
  name: string;
  description?: string;
  previewImages?: Resource[];
  files?: Resource[];
  entryFileName: string;
  dir?: string;
  icon?: Resource | { url?: string };
  classify?: WidgetClassifyInfo;
  enable: boolean;
  version?: string;
  author?: string;
  sizeConfigs: WidgetSizeConfig[];
  defaultSizeId: string;
  supportIconMode: boolean;
  tags: string[];
  sortOrder: number;
  settingsSchema?: WidgetSettingsField[]; // 设置表单Schema
  sourceType?: 'legacy' | 'snwidget';
  packageName?: string;
  entryUrl?: string;
  iconUrl?: string;
  configSnapshot?: {
    sizeConfigs?: WidgetSizeConfig[];
    defaultSizeId?: string;
    supportIconMode?: boolean;
    settingsSchema?: WidgetSettingsField[];
    tags?: string[];
    version?: string;
    author?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
}
