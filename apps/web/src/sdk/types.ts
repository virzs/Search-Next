/** 应用 SDK 事件总线接口 */
export type AppMode = 'icon' | 'full' | 'settings' | 'appIcon';

export interface AppEventBus {
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

/** 应用 SDK 主题信息 */
export interface AppThemeInfo {
  /** 当前生效色彩模式（兼容既有应用：'light' 或 'dark'） */
  activeThemeId: string;
  /** 桌面主题 ID */
  desktopThemeId?: string;
  /** 用户选择的外观模式 */
  appearanceMode?: 'system' | 'light' | 'dark';
  /** 当前生效色彩模式 */
  resolvedColorScheme?: 'light' | 'dark';
}

/** 应用 SDK 语言环境信息 */
export interface AppLocaleInfo {
  language: 'zh-CN' | 'en-US';
  direction: 'ltr';
}

/** 应用 SDK 用户信息（只读） */
export interface AppUserInfo {
  _id: string;
  username: string;
  email: string;
}

/** 应用 SDK 通知接口 */
export interface AppToast {
  success(message: string, description?: string): void;
  error(message: string, description?: string): void;
  info(message: string, description?: string): void;
  warning(message: string, description?: string): void;
}

/** 应用 SDK 命名空间存储接口 */
export interface AppStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** 异步读取（兼容应用中使用 Promise 风格调用） */
  get(key: string): Promise<string | null>;
  /** 异步写入并广播 storage:changed 事件 */
  set(key: string, value: string): Promise<void>;
  /** 异步移除并广播 storage:changed 事件 */
  remove(key: string): Promise<void>;
}

/** 应用 SDK API 代理接口 */
export interface AppApiProxy {
  get<T = any>(url: string, params?: Record<string, any>): Promise<T>;
  post<T = any>(url: string, data?: Record<string, any>): Promise<T>;
}

/** 应用 SDK 完整接口 — 这是应用通过 props.sdk 获得的对象 */
export interface AppSDK {
  /** 应用 ID */
  appId: string;
  /** 当前尺寸 ID */
  sizeId: string;
  /** 显示模式 */
  mode: AppMode;
  /** 主题信息 */
  theme: AppThemeInfo;
  /** 监听主题变化 */
  onThemeChange(callback: (theme: AppThemeInfo) => void): () => void;
  /** 宿主语言环境 */
  locale: AppLocaleInfo;
  /** 读取最新宿主语言环境 */
  getLocale(): AppLocaleInfo;
  /** 监听宿主语言变化 */
  onLocaleChange(callback: (locale: AppLocaleInfo) => void): () => void;
  /** 用户信息（未登录为 null） */
  user: AppUserInfo | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 项目配置（只读） */
  config: { userLimit: any; projectInfo: any };
  /** 命名空间存储 */
  storage: AppStorage;
  /** 通知 */
  toast: AppToast;
  /** API 代理（带认证） */
  api: AppApiProxy;
  /** 路由导航 */
  navigate(path: string): void;
  /** 事件总线（跨应用通信） */
  events: AppEventBus;
}

/** 创建宿主端 SDK 的配置 */
export interface CreateHostSDKOptions {
  appId: string;
  sizeId: string;
  mode: AppMode;
  /** 当前主题 */
  theme: AppThemeInfo;
  /** 当前语言环境 */
  locale: AppLocaleInfo;
  /** 读取最新语言环境 */
  getLocale?: () => AppLocaleInfo;
  /** 用户信息 */
  user: AppUserInfo | null;
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
  eventBus: AppEventBus;
}
