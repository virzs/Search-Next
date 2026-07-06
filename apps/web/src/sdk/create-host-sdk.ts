import type {
  CreateHostSDKOptions,
  AppApiProxy,
  AppLocaleInfo,
  AppSDK,
  AppStorage,
  AppThemeInfo,
  AppToast,
} from './types';
import {
  getAppStorageItem,
  removeAppStorageItem,
  setAppStorageItem,
} from '@/utils/app-storage';

/**
 * 创建宿主侧 SDK：将主题、用户、配置、通知、API、导航与事件能力统一注入给应用。
 */
export function createHostSDK(options: CreateHostSDKOptions): AppSDK {
  /** 基于 appId 的命名空间存储，避免不同应用键冲突。 */
  const storage: AppStorage = {
    getItem: (key) => getAppStorageItem(options.appId, key),
    setItem: (key, value) => setAppStorageItem(options.appId, key, value),
    removeItem: (key) => removeAppStorageItem(options.appId, key),
    get: (key) => Promise.resolve(getAppStorageItem(options.appId, key)),
    set: (key, value) => {
      setAppStorageItem(options.appId, key, value);
      options.eventBus.emit('storage:changed', { appId: options.appId, key, value });
      return Promise.resolve();
    },
    remove: (key) => {
      removeAppStorageItem(options.appId, key);
      options.eventBus.emit('storage:changed', { appId: options.appId, key, value: null });
      return Promise.resolve();
    },
  };

  /** 通知封装：优先调用 antd notification；不可用时回退到 console.warn。 */
  const toast: AppToast = {
    success: (message, description) => {
      if (!options.notification?.success) {
        console.warn('[AppSDK] notification.success is unavailable', { message, description });
        return;
      }
      options.notification.success({ message, description });
    },
    error: (message, description) => {
      if (!options.notification?.error) {
        console.warn('[AppSDK] notification.error is unavailable', { message, description });
        return;
      }
      options.notification.error({ message, description });
    },
    info: (message, description) => {
      if (!options.notification?.info) {
        console.warn('[AppSDK] notification.info is unavailable', { message, description });
        return;
      }
      options.notification.info({ message, description });
    },
    warning: (message, description) => {
      if (!options.notification?.warning) {
        console.warn('[AppSDK] notification.warning is unavailable', { message, description });
        return;
      }
      options.notification.warning({ message, description });
    },
  };

  /** API 代理：直接透传到宿主 axios 实例（拦截器已处理 response.data）。 */
  const api: AppApiProxy = {
    get: (url, params) => options.axiosInstance.get(url, { params }),
    post: (url, data) => options.axiosInstance.post(url, { data }),
  };

  const sdk: AppSDK = {
    appId: options.appId,
    sizeId: options.sizeId,
    mode: options.mode,
    theme: options.theme,
    onThemeChange: (callback) => {
      const handler = (newTheme: AppThemeInfo) => callback(newTheme);
      options.eventBus.on('theme:change', handler);
      return () => options.eventBus.off('theme:change', handler);
    },
    get locale() {
      return options.getLocale?.() ?? options.locale;
    },
    getLocale: () => options.getLocale?.() ?? options.locale,
    onLocaleChange: (callback) => {
      const handler = (newLocale: AppLocaleInfo) => callback(newLocale);
      options.eventBus.on('locale:change', handler);
      return () => options.eventBus.off('locale:change', handler);
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

  /** 冻结 SDK 对象，防止应用侧篡改宿主注入能力。 */
  return Object.freeze(sdk);
}
