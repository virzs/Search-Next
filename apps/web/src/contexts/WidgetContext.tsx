import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRequest } from "ahooks";
import {
  getPublicWidgets,
  buildWidgetEntryUrl,
  getWidgetIconUrl,
  getWidgetAppIconUrl,
} from "@/services/widget";
import type { WidgetApiItem, WidgetAppIcon, WidgetPagePaths, WidgetSettingsField, WidgetSizeConfig } from "@/types";
import {
  DEV_MODE_STORAGE_KEY,
  DEV_WIDGETS_STORAGE_KEY,
} from "@/utils/storage";

/** 开发者自定义小组件（不经过后端，直接提供 ESM 入口地址） */
export interface DevWidget {
  id: string;
  name: string;
  entry: string;
  sizeConfigs: WidgetSizeConfig[];
  defaultSizeId: string;
  createdAt: string;
}

type DesktopItemForWidget = {
  id: string | number;
  type: string;
  dataType?: string;
  config?: {
    sizeId?: string;
  };
  data: {
    name: string;
    icon?: string;
    widgetConfig?: {
      id: string;
      name: string;
      entry: string;
      props: { title: string };
      settingsSchema?: WidgetSettingsField[];
      defaultSizeId?: string;
      pagePaths?: WidgetPagePaths;
      pages?: WidgetPagePaths;
      settingsPagePath?: string;
      settingsPath?: string;
      settingsPage?: string;
      customSettings?: boolean;
      supportAppMode?: boolean;
      appIcon?: WidgetAppIcon;
      appIconUrl?: string | null;
      sourceType?: "legacy" | "snwidget";
      version?: string;
      author?: string;
      description?: string;
    };
  };
};

interface LegacyDesktopRefLike {
  state: {
    list: Array<{ children?: Array<{ type?: string; dataType?: string }> }>;
    addItem: (data: DesktopItemForWidget, parentIds: (string | number)[]) => void;
    setList: (list: unknown[]) => void;
  };
}

interface DesktopNextRefLike {
  pages: Array<{ children: unknown[] }>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

type DesktopRefLike = LegacyDesktopRefLike | DesktopNextRefLike;

type AddDesktopItem = (item: DesktopItemForWidget) => void;
type RemoveDesktopItemsByType = (dataType: string) => void;
type AddWidgetToDesktopOptions = {
  sizeId?: string;
};

interface WidgetContextValue {
  widgets: WidgetApiItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  /** 添加小组件到桌面（允许重复添加） */
  addToDesktop: (widgetId: string, options?: AddWidgetToDesktopOptions) => void;
  /** 以应用图标形式添加到桌面（固定1x1，点击打开full模式） */
  addAppToDesktop: (widgetId: string) => void;
  getWidgetById: (widgetId: string) => WidgetApiItem | undefined;
  getEntryUrl: (widget: WidgetApiItem) => string | null;
  getIconUrl: (widget: WidgetApiItem) => string | null;
  getAppIconUrl: (widget: WidgetApiItem) => string | null;
  /** 注册 Desktop ref，使 addToDesktop 可直接操控桌面 */
  registerDesktopRef: (
    ref: React.RefObject<DesktopRefLike | null>,
    addItem?: AddDesktopItem,
    removeItemsByType?: RemoveDesktopItemsByType,
  ) => void;

  // —— 开发者模式 ——
  devModeEnabled: boolean;
  toggleDevMode: () => void;
  devWidgets: DevWidget[];
  addDevWidget: (widget: Omit<DevWidget, "id" | "createdAt">) => DevWidget | null;
  updateDevWidget: (id: string, updates: Partial<Omit<DevWidget, "id" | "createdAt">>) => void;
  removeDevWidget: (id: string) => void;
  getDevWidgetById: (devWidgetId: string) => DevWidget | undefined;
}

const WidgetContext = createContext<WidgetContextValue | undefined>(undefined);

interface WidgetProviderProps {
  children: ReactNode;
}

const loadDevMode = (): boolean => {
  try {
    return localStorage.getItem(DEV_MODE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const loadDevWidgets = (): DevWidget[] => {
  try {
    const raw = localStorage.getItem(DEV_WIDGETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveDevWidgets = (list: DevWidget[]) => {
  localStorage.setItem(DEV_WIDGETS_STORAGE_KEY, JSON.stringify(list));
};

let devIdCounter = 0;
const generateDevId = () => `dev_${Date.now()}_${++devIdCounter}`;
let desktopWidgetInstanceCounter = 0;
const generateDesktopWidgetInstanceId = (widgetId: string) =>
  `widget-instance:${widgetId}:${Date.now()}:${++desktopWidgetInstanceCounter}`;

/** 小组件上下文 Provider，管理小组件列表与桌面添加 */
export const WidgetProvider: React.FC<WidgetProviderProps> = ({ children }) => {
  const [devModeEnabled, setDevModeEnabled] = useState(loadDevMode);
  const [devWidgets, setDevWidgets] = useState<DevWidget[]>(loadDevWidgets);
  const desktopRefInternal = useRef<React.RefObject<DesktopRefLike | null> | null>(null);
  const addDesktopItemRef = useRef<AddDesktopItem | null>(null);
  const removeDesktopItemsByTypeRef = useRef<RemoveDesktopItemsByType | null>(null);

  const {
    data: widgets,
    loading,
    runAsync: runWidgets,
  } = useRequest(getPublicWidgets, { manual: true });

  useEffect(() => {
    void runWidgets();
  }, [runWidgets]);

  const refresh = useCallback(async () => {
    await runWidgets();
  }, [runWidgets]);

  // 使用 ref 保持回调引用稳定，避免 context value 频繁重建
  const widgetsRef = useRef(widgets);
  widgetsRef.current = widgets;
  const devWidgetsRef = useRef(devWidgets);
  devWidgetsRef.current = devWidgets;

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

  /** 根据 widgetId 构建桌面项数据 */
  const buildDesktopItem = useCallback((widgetId: string, options?: AddWidgetToDesktopOptions) => {
    const devMatch = devWidgetsRef.current.find((d) => d.id === widgetId);
    let entryUrl: string | null = null;
    let widgetName: string;
    let description: string | undefined;
    let version: string | undefined;
    let author: string | undefined;
    let sourceType: "legacy" | "snwidget" | undefined;
    let settingsSchema: WidgetSettingsField[] | undefined;
    let defaultSizeId = "2x2";
    let pagePaths: WidgetPagePaths | undefined;
    let pages: WidgetPagePaths | undefined;
    let settingsPagePath: string | undefined;
    let settingsPath: string | undefined;
    let settingsPage: string | undefined;
    let customSettings = false;
    let supportAppMode = false;
    let appIcon: WidgetAppIcon | undefined;
    let appIconUrl: string | null = null;

    if (devMatch) {
      entryUrl = devMatch.entry;
      widgetName = devMatch.name;
      defaultSizeId = options?.sizeId || devMatch.defaultSizeId;
    } else {
      const widget = (widgetsRef.current ?? []).find((w) => w._id === widgetId);
      if (!widget) return null;
      entryUrl = buildWidgetEntryUrl(widget);
      widgetName = widget.name;
      description = widget.description;
      version = (widget.configSnapshot?.version as string | undefined) ?? widget.version;
      author = (widget.configSnapshot?.author as string | undefined) ?? widget.author;
      sourceType = widget.sourceType;
      settingsSchema = widget.configSnapshot?.settingsSchema || widget.settingsSchema;
      defaultSizeId = options?.sizeId || widget.configSnapshot?.defaultSizeId || widget.defaultSizeId || "2x2";
      pagePaths = widget.configSnapshot?.pagePaths ?? widget.pagePaths;
      pages = widget.configSnapshot?.pages ?? widget.pages;
      settingsPagePath =
        widget.configSnapshot?.settingsPagePath ??
        widget.configSnapshot?.settingsPath ??
        widget.configSnapshot?.settingsPage ??
        widget.settingsPagePath ??
        widget.settingsPath ??
        widget.settingsPage;
      settingsPath = widget.configSnapshot?.settingsPath ?? widget.settingsPath;
      settingsPage = widget.configSnapshot?.settingsPage ?? widget.settingsPage;
      customSettings = Boolean(widget.configSnapshot?.customSettings ?? widget.customSettings);
      supportAppMode = Boolean(widget.configSnapshot?.supportAppMode ?? widget.supportAppMode);
      appIcon = widget.configSnapshot?.appIcon ?? widget.appIcon;
      appIconUrl = getWidgetAppIconUrl(widget);
    }

    if (!entryUrl) return null;

    const widgetType = `widget:${widgetId}`;
    return {
      id: generateDesktopWidgetInstanceId(widgetId),
      type: widgetType,
      dataType: widgetType,
      config: options?.sizeId ? { sizeId: options.sizeId } : undefined,
      data: {
        name: widgetName,
        widgetConfig: {
          id: widgetId,
          name: widgetName,
          entry: entryUrl,
          props: { title: widgetName },
          settingsSchema,
          defaultSizeId,
          pagePaths,
          pages,
          settingsPagePath,
          settingsPath,
          settingsPage,
          customSettings,
          supportAppMode,
          appIcon,
          appIconUrl,
          sourceType,
          version,
          author,
          description,
        },
      },
    };
  }, []);

  const buildDesktopAppItem = useCallback((widgetId: string) => {
    const widget = (widgetsRef.current ?? []).find((w) => w._id === widgetId);
    if (!widget) return null;
    const entryUrl = buildWidgetEntryUrl(widget);
    if (!entryUrl) return null;

    const widgetName = widget.name;
    const appIcon = widget.configSnapshot?.appIcon ?? widget.appIcon;
    const appIconUrl = getWidgetAppIconUrl(widget);
    const widgetType = `widget-app:${widgetId}`;
    return {
      id: generateDesktopWidgetInstanceId(`app:${widgetId}`),
      type: "app",
      dataType: widgetType,
      data: {
        name: widgetName,
        ...(appIconUrl ? { icon: appIconUrl } : {}),
        widgetConfig: {
          id: widgetId,
          name: widgetName,
          entry: entryUrl,
          props: { title: widgetName },
          settingsSchema: widget.configSnapshot?.settingsSchema || widget.settingsSchema,
          defaultSizeId: widget.configSnapshot?.defaultSizeId || widget.defaultSizeId || "2x2",
          pagePaths: widget.configSnapshot?.pagePaths ?? widget.pagePaths,
          pages: widget.configSnapshot?.pages ?? widget.pages,
          settingsPagePath:
            widget.configSnapshot?.settingsPagePath ??
            widget.configSnapshot?.settingsPath ??
            widget.configSnapshot?.settingsPage ??
            widget.settingsPagePath ??
            widget.settingsPath ??
            widget.settingsPage,
          settingsPath: widget.configSnapshot?.settingsPath ?? widget.settingsPath,
          settingsPage: widget.configSnapshot?.settingsPage ?? widget.settingsPage,
          customSettings: Boolean(widget.configSnapshot?.customSettings ?? widget.customSettings),
          supportAppMode: Boolean(widget.configSnapshot?.supportAppMode ?? widget.supportAppMode),
          appIcon,
          appIconUrl,
          sourceType: widget.sourceType,
          version: (widget.configSnapshot?.version as string | undefined) ?? widget.version,
          author: (widget.configSnapshot?.author as string | undefined) ?? widget.author,
          description: widget.description,
        },
      },
    };
  }, []);

  /** 直接添加小组件到桌面，允许重复添加 */
  const addToDesktop = useCallback((widgetId: string, options?: AddWidgetToDesktopOptions) => {
    const desktop = desktopRefInternal.current?.current;
    if (!desktop) return;
    const desktopItem = buildDesktopItem(widgetId, options);
    if (!desktopItem) return;

    if (addDesktopItemRef.current) {
      addDesktopItemRef.current?.(desktopItem);
      return;
    }

    if ("state" in desktop) {
      desktop.state.addItem(desktopItem, []);
    }
  }, [buildDesktopItem]);

  const addAppToDesktop = useCallback((widgetId: string) => {
    const desktop = desktopRefInternal.current?.current;
    if (!desktop) return;
    const desktopItem = buildDesktopAppItem(widgetId);
    if (!desktopItem) return;

    if (addDesktopItemRef.current) {
      addDesktopItemRef.current?.(desktopItem);
      return;
    }

    if ("state" in desktop) {
      desktop.state.addItem(desktopItem, []);
    }
  }, [buildDesktopAppItem]);

  const getWidgetById = useCallback(
    (widgetId: string): WidgetApiItem | undefined => {
      const backendMatch = (widgetsRef.current ?? []).find((w) => w._id === widgetId);
      if (backendMatch) return backendMatch;

      const devMatch = devWidgetsRef.current.find((d) => d.id === widgetId);
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
        } as WidgetApiItem;
      }

      return undefined;
    },
    [],
  );

  const getDevWidgetById = useCallback(
    (devWidgetId: string) => devWidgetsRef.current.find((d) => d.id === devWidgetId),
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

  const addDevWidget = useCallback(
    (input: Omit<DevWidget, "id" | "createdAt">): DevWidget | null => {
      const normalizedEntry = input.entry.replace(/\/+$/, "");
      const existRef = { current: null as DevWidget | null };

      setDevWidgets((prev) => {
        const duplicate = prev.find((d) => d.entry.replace(/\/+$/, "") === normalizedEntry);
        if (duplicate) {
          existRef.current = duplicate;
          return prev;
        }
        const newWidget: DevWidget = {
          ...input,
          id: generateDevId(),
          createdAt: new Date().toISOString(),
        };
        existRef.current = newWidget;
        const next = [...prev, newWidget];
        saveDevWidgets(next);
        return next;
      });

      return existRef.current;
    },
    [],
  );

  const updateDevWidget = useCallback(
    (id: string, updates: Partial<Omit<DevWidget, "id" | "createdAt">>) => {
      setDevWidgets((prev) => {
        const next = prev.map((d) => (d.id === id ? { ...d, ...updates } : d));
        saveDevWidgets(next);
        return next;
      });
    },
    [],
  );

  const removeDevWidget = useCallback((id: string) => {
    setDevWidgets((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDevWidgets(next);
      return next;
    });

    // 从桌面移除该组件的所有实例
    removeDesktopItemsByTypeRef.current?.(`widget:${id}`);
  }, []);

  const widgetList = useMemo(() => widgets ?? [], [widgets]);

  const value = useMemo<WidgetContextValue>(
    () => ({
      widgets: widgetList,
      loading,
      refresh,
      addToDesktop,
      addAppToDesktop,
      getWidgetById,
      getEntryUrl: buildWidgetEntryUrl,
      getIconUrl: getWidgetIconUrl,
      getAppIconUrl: getWidgetAppIconUrl,
      registerDesktopRef,

      devModeEnabled,
      toggleDevMode,
      devWidgets,
      addDevWidget,
      updateDevWidget,
      removeDevWidget,
      getDevWidgetById,
    }),
    [
      widgetList, loading, refresh, addToDesktop, addAppToDesktop, getWidgetById,
      registerDesktopRef,
      devModeEnabled, toggleDevMode, devWidgets,
      addDevWidget, updateDevWidget, removeDevWidget, getDevWidgetById,
    ],
  );

  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
};

export default WidgetContext;
