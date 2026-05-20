import type {
  CreateHostSDKOptions,
  WidgetApiProxy,
  WidgetSDK,
  WidgetStorage,
  WidgetThemeInfo,
  WidgetToast,
} from './types';

/**
 * 创建宿主侧 SDK：将主题、用户、配置、通知、API、导航与事件能力统一注入给小组件。
 */
export function createHostSDK(options: CreateHostSDKOptions): WidgetSDK {
  /** 基于 widgetId 的命名空间存储，避免不同小组件键冲突。 */
  const storage: WidgetStorage = {
    getItem: (key) => localStorage.getItem(`widget:${options.widgetId}:${key}`),
    setItem: (key, value) => localStorage.setItem(`widget:${options.widgetId}:${key}`, value),
    removeItem: (key) => localStorage.removeItem(`widget:${options.widgetId}:${key}`),
    get: (key) => Promise.resolve(localStorage.getItem(`widget:${options.widgetId}:${key}`)),
    set: (key, value) => {
      localStorage.setItem(`widget:${options.widgetId}:${key}`, value);
      options.eventBus.emit('storage:changed', { widgetId: options.widgetId, key, value });
      return Promise.resolve();
    },
    remove: (key) => {
      localStorage.removeItem(`widget:${options.widgetId}:${key}`);
      options.eventBus.emit('storage:changed', { widgetId: options.widgetId, key, value: null });
      return Promise.resolve();
    },
  };

  /** 通知封装：优先调用 antd notification；不可用时回退到 console.warn。 */
  const toast: WidgetToast = {
    success: (message, description) => {
      if (!options.notification?.success) {
        console.warn('[WidgetSDK] notification.success is unavailable', { message, description });
        return;
      }
      options.notification.success({ message, description });
    },
    error: (message, description) => {
      if (!options.notification?.error) {
        console.warn('[WidgetSDK] notification.error is unavailable', { message, description });
        return;
      }
      options.notification.error({ message, description });
    },
    info: (message, description) => {
      if (!options.notification?.info) {
        console.warn('[WidgetSDK] notification.info is unavailable', { message, description });
        return;
      }
      options.notification.info({ message, description });
    },
    warning: (message, description) => {
      if (!options.notification?.warning) {
        console.warn('[WidgetSDK] notification.warning is unavailable', { message, description });
        return;
      }
      options.notification.warning({ message, description });
    },
  };

  /** API 代理：直接透传到宿主 axios 实例（拦截器已处理 response.data）。 */
  const api: WidgetApiProxy = {
    get: (url, params) => options.axiosInstance.get(url, { params }),
    post: (url, data) => options.axiosInstance.post(url, { data }),
  };

  const sdk: WidgetSDK = {
    widgetId: options.widgetId,
    sizeId: options.sizeId,
    mode: options.mode,
    theme: options.theme,
    onThemeChange: (callback) => {
      const handler = (newTheme: WidgetThemeInfo) => callback(newTheme);
      options.eventBus.on('theme:change', handler);
      return () => options.eventBus.off('theme:change', handler);
    },
    user: options.user,
    isAuthenticated: options.isAuthenticated,
    config: options.config,
    storage,
    toast,
    api,
    navigate: (path) => {
      options.navigateFn(path);
    },
    events: options.eventBus,
  };

  /** 冻结 SDK 对象，防止小组件侧篡改宿主注入能力。 */
  return Object.freeze(sdk);
}
