import type { WidgetEventBus } from './types';

/**
 * 小组件共享事件总线实现：用于跨小组件广播事件。
 */
export class WidgetEventBusImpl implements WidgetEventBus {
  /** 按事件名维护处理函数集合，便于去重与快速增删。 */
  private listeners = new Map<string, Set<(...args: any[]) => void>>();

  /** 订阅事件。 */
  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(handler);
  }

  /** 取消订阅事件。 */
  off(event: string, handler: (...args: any[]) => void): void {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }

    handlers.delete(handler);
    if (handlers.size === 0) {
      this.listeners.delete(event);
    }
  }

  /** 触发事件并向所有订阅者广播参数。 */
  emit(event: string, ...args: any[]): void {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) {
      return;
    }

    handlers.forEach((handler) => {
      handler(...args);
    });
  }
}

/** 共享单例：供宿主和全部小组件使用同一总线实现跨组件通信。 */
export const sharedEventBus: WidgetEventBus = new WidgetEventBusImpl();
