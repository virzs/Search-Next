/** 应用 SDK 统一出口：类型定义、工厂函数及共享事件总线 */
export type {
  AppMode,
  AppSDK,
  AppEventBus,
  AppThemeInfo,
  AppLocaleInfo,
  AppUserInfo,
  AppToast,
  AppStorage,
  AppApiProxy,
  CreateHostSDKOptions,
} from './types';
export { createHostSDK } from './create-host-sdk';
export { AppEventBusImpl, sharedEventBus } from './event-bus';
