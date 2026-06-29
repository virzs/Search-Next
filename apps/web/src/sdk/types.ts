/** 小组件 SDK 事件总线接口 */
export type WidgetMode = 'icon' | 'full' | 'settings' | 'appIcon';

export interface WidgetEventBus {
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

/** 小组件 SDK 主题信息 */
export interface WidgetThemeInfo {
  /** 当前生效色彩模式（兼容既有小组件：'light' 或 'dark'） */
  activeThemeId: string;
  /** 桌面主题 ID */
  desktopThemeId?: string;
  /** 用户选择的外观模式 */
  appearanceMode?: 'system' | 'light' | 'dark';
  /** 当前生效色彩模式 */
  resolvedColorScheme?: 'light' | 'dark';
}

/** 小组件 SDK 用户信息（只读） */
export interface WidgetUserInfo {
  _id: string;
  username: string;
  email: string;
}

/** 小组件 SDK 通知接口 */
export interface WidgetToast {
  success(message: string, description?: string): void;
  error(message: string, description?: string): void;
  info(message: string, description?: string): void;
  warning(message: string, description?: string): void;
}

/** 小组件 SDK 命名空间存储接口 */
export interface WidgetStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** 异步读取（兼容小组件中使用 Promise 风格调用） */
  get(key: string): Promise<string | null>;
  /** 异步写入并广播 storage:changed 事件 */
  set(key: string, value: string): Promise<void>;
  /** 异步移除并广播 storage:changed 事件 */
  remove(key: string): Promise<void>;
}

/** 小组件 SDK API 代理接口 */
export interface WidgetApiProxy {
  get<T = any>(url: string, params?: Record<string, any>): Promise<T>;
  post<T = any>(url: string, data?: Record<string, any>): Promise<T>;
}

/** 小组件 SDK 完整接口 — 这是小组件通过 props.sdk 获得的对象 */
export interface WidgetSDK {
  /** 小组件 ID */
  widgetId: string;
  /** 当前尺寸 ID */
  sizeId: string;
  /** 显示模式 */
  mode: WidgetMode;
  /** 主题信息 */
  theme: WidgetThemeInfo;
  /** 监听主题变化 */
  onThemeChange(callback: (theme: WidgetThemeInfo) => void): () => void;
  /** 用户信息（未登录为 null） */
  user: WidgetUserInfo | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 项目配置（只读） */
  config: { userLimit: any; projectInfo: any };
  /** 命名空间存储 */
  storage: WidgetStorage;
  /** 通知 */
  toast: WidgetToast;
  /** API 代理（带认证） */
  api: WidgetApiProxy;
  /** 路由导航 */
  navigate(path: string): void;
  /** 事件总线（跨小组件通信） */
  events: WidgetEventBus;
}

/** 创建宿主端 SDK 的配置 */
export interface CreateHostSDKOptions {
  widgetId: string;
  sizeId: string;
  mode: WidgetMode;
  /** 当前主题 */
  theme: WidgetThemeInfo;
  /** 用户信息 */
  user: WidgetUserInfo | null;
  isAuthenticated: boolean;
  /** 项目配置 */
  config: { userLimit: any; projectInfo: any };
  /** antd notification 实例 */
  notification: any;
  /** axios 实例 */
  axiosInstance: any;
  /** react-router navigate 函数 */
  navigateFn: (path: string) => void;
  /** 共享事件总线 */
  eventBus: WidgetEventBus;
}
