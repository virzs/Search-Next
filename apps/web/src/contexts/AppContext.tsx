import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRequest } from "ahooks";
import {
  getPublicApps,
  buildAppEntryUrl,
  getAppIconUrl,
  getAppLauncherIconUrl,
} from "@/services/app";
import {
  buildAppLauncherDesktopItem,
  buildSizedAppDesktopItem,
  type DesktopItemData,
  type DesktopSortItem,
} from "@search-next/desktop";
import type { AppApiItem, AppSizeConfig } from "@/types";
import {
  getCurrentAppLanguage,
  resolveAppDescription,
  resolveAppDisplayName,
  resolveAppTags,
} from "@/i18n";
import { DEV_MODE_STORAGE_KEY, DEV_APPS_STORAGE_KEY } from "@/utils/storage";
import { toBackendAssetUrl } from "@/utils/utils";

/** 开发者自定义应用（不经过后端，直接提供 ESM 入口地址） */
export interface DevApp {
  id: string;
  name: string;
  entry: string;
  sizeConfigs: AppSizeConfig[];
  defaultSizeId: string;
  createdAt: string;
}

type DesktopItemForApp = DesktopSortItem<DesktopItemData>;

interface LegacyDesktopRefLike {
  state: {
    list: Array<{ children?: Array<{ type?: string; dataType?: string }> }>;
    addItem: (data: DesktopItemForApp, parentIds: (string | number)[]) => void;
    setList: (list: unknown[]) => void;
  };
}

interface DesktopNextRefLike {
  pages: Array<{ children: unknown[] }>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

type DesktopRefLike = LegacyDesktopRefLike | DesktopNextRefLike;

type AddDesktopItem = (item: DesktopItemForApp) => void;
type RemoveDesktopItemsByType = (dataType: string) => void;
type AddAppToDesktopOptions = {
  sizeId?: string;
};
interface AppContextValue {
  apps: AppApiItem[];
  loading: boolean;
  loaded: boolean;
  refresh: () => Promise<void>;
  /** 添加应用到桌面（允许重复添加） */
  addToDesktop: (appId: string, options?: AddAppToDesktopOptions) => void;
  /** 以应用图标形式添加到桌面（固定1x1，点击打开full模式） */
  addAppToDesktop: (appId: string) => void;
  getAppById: (appId: string) => AppApiItem | undefined;
  getEntryUrl: (app: AppApiItem) => string | null;
  getIconUrl: (app: AppApiItem) => string | null;
  getAppIconUrl: (app: AppApiItem) => string | null;
  /** 注册 Desktop ref，使 addToDesktop 可直接操控桌面 */
  registerDesktopRef: (
    ref: React.RefObject<DesktopRefLike | null>,
    addItem?: AddDesktopItem,
    removeItemsByType?: RemoveDesktopItemsByType,
  ) => void;

  // —— 开发者模式 ——
  devModeEnabled: boolean;
  toggleDevMode: () => void;
  devApps: DevApp[];
  addDevApp: (app: Omit<DevApp, "id" | "createdAt">) => DevApp | null;
  updateDevApp: (id: string, updates: Partial<Omit<DevApp, "id" | "createdAt">>) => void;
  removeDevApp: (id: string) => void;
  getDevAppById: (devAppId: string) => DevApp | undefined;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

const loadDevMode = (): boolean => {
  try {
    return localStorage.getItem(DEV_MODE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const loadDevApps = (): DevApp[] => {
  try {
    const raw = localStorage.getItem(DEV_APPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveDevApps = (list: DevApp[]) => {
  localStorage.setItem(DEV_APPS_STORAGE_KEY, JSON.stringify(list));
};

let devIdCounter = 0;
const generateDevId = () => `dev_${Date.now()}_${++devIdCounter}`;
let desktopAppInstanceCounter = 0;
const generateDesktopAppInstanceId = (appId: string) =>
  `app-instance:${appId}:${Date.now()}:${++desktopAppInstanceCounter}`;

/** 应用上下文 Provider，管理应用列表与桌面添加 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [devModeEnabled, setDevModeEnabled] = useState(loadDevMode);
  const [devApps, setDevApps] = useState<DevApp[]>(loadDevApps);
  const [loaded, setLoaded] = useState(false);
  const desktopRefInternal = useRef<React.RefObject<DesktopRefLike | null> | null>(null);
  const addDesktopItemRef = useRef<AddDesktopItem | null>(null);
  const removeDesktopItemsByTypeRef = useRef<RemoveDesktopItemsByType | null>(null);

  const {
    data: apps,
    loading,
    runAsync: runApps,
  } = useRequest(getPublicApps, { manual: true });

  useEffect(() => {
    let cancelled = false;
    void runApps()
      .then(() => {
        if (!cancelled) setLoaded(true);
      })
      .catch((error) => {
        console.warn("Failed to load public apps", error);
      });
    return () => {
      cancelled = true;
    };
  }, [runApps]);

  const refresh = useCallback(async () => {
    await runApps();
    setLoaded(true);
  }, [runApps]);

  // 使用 ref 保持回调引用稳定，避免 context value 频繁重建
  const appsRef = useRef(apps);
  appsRef.current = apps;
  const devAppsRef = useRef(devApps);
  devAppsRef.current = devApps;

  const registerDesktopRef = useCallback(
    (
      ref: React.RefObject<DesktopRefLike | null>,
      addItem?: AddDesktopItem,
      removeItemsByType?: RemoveDesktopItemsByType,
    ) => {
      desktopRefInternal.current = ref;
      addDesktopItemRef.current = addItem ?? null;
      removeDesktopItemsByTypeRef.current = removeItemsByType ?? null;
    },
    [],
  );

  /** 根据 appId 构建桌面项数据 */
  const buildDesktopItem = useCallback((appId: string, options?: AddAppToDesktopOptions) => {
    const devMatch = devAppsRef.current.find((d) => d.id === appId);
    if (devMatch) {
      return buildSizedAppDesktopItem(
        {
          id: devMatch.id,
          name: devMatch.name,
          entryUrl: devMatch.entry,
          sizeConfigs: devMatch.sizeConfigs,
          defaultSizeId: devMatch.defaultSizeId,
        },
        {
          instanceId: generateDesktopAppInstanceId(appId),
          appId,
          name: devMatch.name,
          sizeId: options?.sizeId,
          resolveAssetUrl: toBackendAssetUrl,
        },
      );
    }

    const app = (appsRef.current ?? []).find((w) => w._id === appId);
    if (!app) return null;
    const language = getCurrentAppLanguage();
    const snapshot = app.configSnapshot;
    const appName = resolveAppDisplayName(app, language);

    return buildSizedAppDesktopItem(app, {
      instanceId: generateDesktopAppInstanceId(appId),
      appId,
      name: appName,
      description: resolveAppDescription(app, language),
      displayName: snapshot?.displayName ?? app.displayName,
      displayNameI18n: snapshot?.displayNameI18n ?? app.displayNameI18n,
      descriptionI18n: snapshot?.descriptionI18n ?? app.descriptionI18n,
      tags: resolveAppTags(app, language),
      tagsI18n: snapshot?.tagsI18n ?? app.tagsI18n,
      sizeId: options?.sizeId,
      resolveAssetUrl: toBackendAssetUrl,
    });
  }, []);

  const buildDesktopAppItem = useCallback((appId: string) => {
    const app = (appsRef.current ?? []).find((w) => w._id === appId);
    if (!app) return null;
    const language = getCurrentAppLanguage();
    const snapshot = app.configSnapshot;
    const appName = resolveAppDisplayName(app, language);

    return buildAppLauncherDesktopItem(app, {
      instanceId: generateDesktopAppInstanceId(`app:${appId}`),
      appId,
      name: appName,
      description: resolveAppDescription(app, language),
      displayName: snapshot?.displayName ?? app.displayName,
      displayNameI18n: snapshot?.displayNameI18n ?? app.displayNameI18n,
      descriptionI18n: snapshot?.descriptionI18n ?? app.descriptionI18n,
      tags: resolveAppTags(app, language),
      tagsI18n: snapshot?.tagsI18n ?? app.tagsI18n,
      resolveAssetUrl: toBackendAssetUrl,
    });
  }, []);

  /** 直接添加应用到桌面，允许重复添加 */
  const addToDesktop = useCallback((appId: string, options?: AddAppToDesktopOptions) => {
    const desktop = desktopRefInternal.current?.current;
    if (!desktop) return;
    const desktopItem = buildDesktopItem(appId, options);
    if (!desktopItem) return;

    if (addDesktopItemRef.current) {
      addDesktopItemRef.current?.(desktopItem);
      return;
    }

    if ("state" in desktop) {
      desktop.state.addItem(desktopItem, []);
    }
  }, [buildDesktopItem]);

  const addAppToDesktop = useCallback((appId: string) => {
    const desktop = desktopRefInternal.current?.current;
    if (!desktop) return;
    const desktopItem = buildDesktopAppItem(appId);
    if (!desktopItem) return;

    if (addDesktopItemRef.current) {
      addDesktopItemRef.current?.(desktopItem);
      return;
    }

    if ("state" in desktop) {
      desktop.state.addItem(desktopItem, []);
    }
  }, [buildDesktopAppItem]);

  const getAppById = useCallback(
    (appId: string): AppApiItem | undefined => {
      const backendMatch = (appsRef.current ?? []).find((w) => w._id === appId);
      if (backendMatch) return backendMatch;

      const devMatch = devAppsRef.current.find((d) => d.id === appId);
      if (devMatch) {
        return {
          _id: devMatch.id,
          name: devMatch.name,
          entryFileName: "",
          enable: true,
          sizeConfigs: devMatch.sizeConfigs,
          defaultSizeId: devMatch.defaultSizeId,
          supportIconMode: false,
          supportAppMode: false,
          tags: ["开发者"],
          sortOrder: 0,
        } as AppApiItem;
      }

      return undefined;
    },
    [],
  );

  const getDevAppById = useCallback(
    (devAppId: string) => devAppsRef.current.find((d) => d.id === devAppId),
    [],
  );

  // —— 开发者模式操作 ——

  const toggleDevMode = useCallback(() => {
    setDevModeEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(DEV_MODE_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const addDevApp = useCallback(
    (input: Omit<DevApp, "id" | "createdAt">): DevApp | null => {
      const normalizedEntry = input.entry.replace(/\/+$/, "");
      const existRef = { current: null as DevApp | null };

      setDevApps((prev) => {
        const duplicate = prev.find((d) => d.entry.replace(/\/+$/, "") === normalizedEntry);
        if (duplicate) {
          existRef.current = duplicate;
          return prev;
        }
        const newApp: DevApp = {
          ...input,
          id: generateDevId(),
          createdAt: new Date().toISOString(),
        };
        existRef.current = newApp;
        const next = [...prev, newApp];
        saveDevApps(next);
        return next;
      });

      return existRef.current;
    },
    [],
  );

  const updateDevApp = useCallback(
    (id: string, updates: Partial<Omit<DevApp, "id" | "createdAt">>) => {
      setDevApps((prev) => {
        const next = prev.map((d) => (d.id === id ? { ...d, ...updates } : d));
        saveDevApps(next);
        return next;
      });
    },
    [],
  );

  const removeDevApp = useCallback((id: string) => {
    setDevApps((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDevApps(next);
      return next;
    });

    // 从桌面移除该应用的所有实例
    removeDesktopItemsByTypeRef.current?.(`app:${id}`);
  }, []);

  const appList = useMemo(() => apps ?? [], [apps]);

  const value = useMemo<AppContextValue>(
    () => ({
      apps: appList,
      loading,
      loaded,
      refresh,
      addToDesktop,
      addAppToDesktop,
      getAppById,
      getEntryUrl: buildAppEntryUrl,
      getIconUrl: getAppIconUrl,
      getAppIconUrl: getAppLauncherIconUrl,
      registerDesktopRef,

      devModeEnabled,
      toggleDevMode,
      devApps,
      addDevApp,
      updateDevApp,
      removeDevApp,
      getDevAppById,
    }),
    [
      appList, loading, loaded, refresh, addToDesktop, addAppToDesktop, getAppById,
      registerDesktopRef,
      devModeEnabled, toggleDevMode, devApps,
      addDevApp, updateDevApp, removeDevApp, getDevAppById,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
