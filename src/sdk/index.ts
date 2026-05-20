/** 小组件 SDK 统一出口：类型定义、工厂函数及共享事件总线 */
export type {
  WidgetSDK,
  WidgetEventBus,
  WidgetThemeInfo,
  WidgetUserInfo,
  WidgetToast,
  WidgetStorage,
  WidgetApiProxy,
  CreateHostSDKOptions,
} from './types';
export { createHostSDK } from './create-host-sdk';
export { WidgetEventBusImpl, sharedEventBus } from './event-bus';
