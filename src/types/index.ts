// 桌面项目类型定义
export type ItemType = 'group' | 'app' | 'widget';

// 小组件配置接口
export interface WidgetConfig {
  id: string;
  name: string;
  entry: string;
  container?: string;
  props?: Record<string, unknown>;
  size?: 'small' | 'medium' | 'large';
  category?: string;
}

// 桌面项目数据接口
export interface DesktopItemData {
  name: string;
  icon?: string | { iconName: string; iconType: string };
  widgetConfig?: WidgetConfig; // 小组件特有配置
  url?: string; // 网站链接 (for app type)
}
