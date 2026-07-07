import type { AppMode } from "./types";

export interface DesktopPreviewEventBus {
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
}

export interface DesktopPreviewAppSdk {
  appId: string;
  sizeId: string;
  mode: AppMode;
  theme: {
    activeThemeId: string;
    desktopThemeId?: string;
    appearanceMode?: "system" | "light" | "dark";
    resolvedColorScheme?: "light" | "dark";
  };
  onThemeChange(
    callback: (theme: DesktopPreviewAppSdk["theme"]) => void,
  ): () => void;
  locale: {
    language: "zh-CN" | "en-US";
    direction: "ltr";
  };
  getLocale(): DesktopPreviewAppSdk["locale"];
  onLocaleChange(
    callback: (locale: DesktopPreviewAppSdk["locale"]) => void,
  ): () => void;
  user: null;
  isAuthenticated: false;
  config: {
    userLimit: unknown;
    projectInfo: unknown;
  };
  storage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
  };
  toast: {
    success(message: string, description?: string): void;
    error(message: string, description?: string): void;
    info(message: string, description?: string): void;
    warning(message: string, description?: string): void;
  };
  api: {
    get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T>;
    post<T = unknown>(url: string, data?: Record<string, unknown>): Promise<T>;
  };
  navigate(path: string): void;
  events: DesktopPreviewEventBus;
}

export interface CreateDesktopPreviewAppSdkOptions {
  appId: string;
  sizeId: string;
  mode: AppMode;
  theme?: DesktopPreviewAppSdk["theme"];
  locale?: DesktopPreviewAppSdk["locale"];
  config?: Partial<DesktopPreviewAppSdk["config"]>;
  storagePrefix?: string;
  notification?: {
    success?: (options: { message: string; description?: string }) => void;
    error?: (options: { message: string; description?: string }) => void;
    info?: (options: { message: string; description?: string }) => void;
    warning?: (options: { message: string; description?: string }) => void;
  };
  axiosInstance?: {
    get<T = unknown>(url: string, options?: unknown): Promise<T>;
    post<T = unknown>(url: string, data?: unknown): Promise<T>;
  };
  navigate?: (path: string) => void;
  eventBus?: DesktopPreviewEventBus;
}

export class DesktopPreviewEventBusImpl implements DesktopPreviewEventBus {
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    handlers.delete(handler);
    if (!handlers.size) this.listeners.delete(event);
  }

  emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((handler) => handler(...args));
  }
}

export const sharedDesktopPreviewEventBus: DesktopPreviewEventBus =
  new DesktopPreviewEventBusImpl();

const getStorage = () =>
  typeof window === "undefined" ? undefined : window.localStorage;

const createStorageKey = (prefix: string, appId: string, key: string) =>
  `${prefix}:${appId}:${key}`;

const createToast = (
  type: keyof NonNullable<CreateDesktopPreviewAppSdkOptions["notification"]>,
  notification: CreateDesktopPreviewAppSdkOptions["notification"],
) => {
  return (message: string, description?: string) => {
    const api = notification?.[type];
    if (api) {
      api({ message, description });
      return;
    }
    console.warn(`[DesktopPreviewSDK] ${type}`, { message, description });
  };
};

export const createDesktopPreviewAppSdk = (
  options: CreateDesktopPreviewAppSdkOptions,
): DesktopPreviewAppSdk => {
  const storagePrefix = options.storagePrefix || "search-next-desktop-preview";
  const eventBus = options.eventBus || sharedDesktopPreviewEventBus;
  const locale = options.locale || { language: "zh-CN", direction: "ltr" };
  const theme = options.theme || {
    activeThemeId: "light",
    appearanceMode: "light",
    resolvedColorScheme: "light",
  };

  const storage = {
    getItem: (key: string) => {
      try {
        return (
          getStorage()?.getItem(createStorageKey(storagePrefix, options.appId, key)) ??
          null
        );
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      getStorage()?.setItem(createStorageKey(storagePrefix, options.appId, key), value);
    },
    removeItem: (key: string) => {
      getStorage()?.removeItem(createStorageKey(storagePrefix, options.appId, key));
    },
    get: (key: string) => Promise.resolve(storage.getItem(key)),
    set: (key: string, value: string) => {
      storage.setItem(key, value);
      eventBus.emit("storage:changed", { appId: options.appId, key, value });
      return Promise.resolve();
    },
    remove: (key: string) => {
      storage.removeItem(key);
      eventBus.emit("storage:changed", {
        appId: options.appId,
        key,
        value: null,
      });
      return Promise.resolve();
    },
  };

  return Object.freeze({
    appId: options.appId,
    sizeId: options.sizeId,
    mode: options.mode,
    theme,
    onThemeChange: (callback) => {
      const handler = (nextTheme: unknown) =>
        callback(nextTheme as DesktopPreviewAppSdk["theme"]);
      eventBus.on("theme:change", handler);
      return () => eventBus.off("theme:change", handler);
    },
    locale,
    getLocale: () => locale,
    onLocaleChange: (callback) => {
      const handler = (nextLocale: unknown) =>
        callback(nextLocale as DesktopPreviewAppSdk["locale"]);
      eventBus.on("locale:change", handler);
      return () => eventBus.off("locale:change", handler);
    },
    user: null,
    isAuthenticated: false,
    config: {
      userLimit: options.config?.userLimit ?? null,
      projectInfo: options.config?.projectInfo ?? null,
    },
    storage,
    toast: {
      success: createToast("success", options.notification),
      error: createToast("error", options.notification),
      info: createToast("info", options.notification),
      warning: createToast("warning", options.notification),
    },
    api: {
      get: (url, params) =>
        options.axiosInstance?.get(url, { params }) ??
        Promise.reject(new Error("Preview SDK API is unavailable")),
      post: (url, data) =>
        options.axiosInstance?.post(url, data) ??
        Promise.reject(new Error("Preview SDK API is unavailable")),
    },
    navigate: (path: string) => options.navigate?.(path),
    events: eventBus,
  } satisfies DesktopPreviewAppSdk);
};
