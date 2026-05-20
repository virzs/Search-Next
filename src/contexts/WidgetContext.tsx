import React, { createContext, ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { useRequest } from "ahooks";
import {
  getPublicWidgets,
  buildWidgetEntryUrl,
  getWidgetIconUrl,
} from "@/services/widget";
import type { WidgetApiItem, WidgetSizeConfig } from "@/types";
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

/** Desktop handle 最小类型，避免直接依赖 zs_library */
interface DesktopRefLike {
  state: {
    list: Array<{ children?: Array<{ type?: string; dataType?: string }> }>;
    addItem: (data: any, parentIds: (string | number)[]) => void;
    setList: (list: any[]) => void;
  };
}

interface WidgetContextValue {
  widgets: WidgetApiItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  /** 添加小组件到桌面（允许重复添加） */
  addToDesktop: (widgetId: string) => void;
  getWidgetById: (widgetId: string) => WidgetApiItem | undefined;
  getEntryUrl: (widget: WidgetApiItem) => string | null;
  getIconUrl: (widget: WidgetApiItem) => string | null;
  /** 注册 Desktop ref，使 addToDesktop 可直接操控桌面 */
  registerDesktopRef: (ref: React.RefObject<DesktopRefLike | null>) => void;

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

/** 小组件上下文 Provider，管理小组件列表与桌面添加 */
export const WidgetProvider: React.FC<WidgetProviderProps> = ({ children }) => {
  const [devModeEnabled, setDevModeEnabled] = useState(loadDevMode);
  const [devWidgets, setDevWidgets] = useState<DevWidget[]>(loadDevWidgets);
  const desktopRefInternal = useRef<React.RefObject<DesktopRefLike | null> | null>(null);

  const {
    data: widgets,
    loading,
    runAsync: runWidgets,
  } = useRequest(getPublicWidgets, { manual: false });

  const refresh = useCallback(async () => {
    await runWidgets();
  }, [runWidgets]);

  // 使用 ref 保持回调引用稳定，避免 context value 频繁重建
  const widgetsRef = useRef(widgets);
  widgetsRef.current = widgets;
  const devWidgetsRef = useRef(devWidgets);
  devWidgetsRef.current = devWidgets;

  const registerDesktopRef = useCallback((ref: React.RefObject<DesktopRefLike | null>) => {
    desktopRefInternal.current = ref;
  }, []);

  /** 根据 widgetId 构建桌面项数据 */
  const buildDesktopItem = useCallback((widgetId: string) => {
    const devMatch = devWidgetsRef.current.find((d) => d.id === widgetId);
    let entryUrl: string | null = null;
    let widgetName: string;
    let settingsSchema: any[] | undefined;

    if (devMatch) {
      entryUrl = devMatch.entry;
      widgetName = devMatch.name;
    } else {
      const widget = (widgetsRef.current ?? []).find((w) => w._id === widgetId);
      if (!widget) return null;
      entryUrl = buildWidgetEntryUrl(widget);
      widgetName = widget.name;
      settingsSchema = widget.configSnapshot?.settingsSchema || widget.settingsSchema;
    }

    if (!entryUrl) return null;

    const itemId = `widget:${widgetId}`;
    return {
      id: itemId,
      type: itemId,
      data: {
        name: widgetName,
        widgetConfig: {
          id: widgetId,
          name: widgetName,
          entry: entryUrl,
          props: { title: widgetName },
          settingsSchema,
        },
      },
    };
  }, []);

  /** 直接添加小组件到桌面，允许重复添加 */
  const addToDesktop = useCallback((widgetId: string) => {
    const desktop = desktopRefInternal.current?.current;
    if (!desktop) return;
    const desktopItem = buildDesktopItem(widgetId);
    if (desktopItem) {
      desktop.state.addItem(desktopItem, []);
    }
  }, [buildDesktopItem]);

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
    const desktop = desktopRefInternal.current?.current;
    if (desktop) {
      const dataType = `widget:${id}`;
      desktop.state.setList(
        desktop.state.list.map((page) => ({
          ...page,
          children: (page.children ?? []).filter(
            (item) => item.type !== dataType && item.dataType !== dataType,
          ),
        })),
      );
    }
  }, []);

  const widgetList = useMemo(() => widgets ?? [], [widgets]);

  const value = useMemo<WidgetContextValue>(
    () => ({
      widgets: widgetList,
      loading,
      refresh,
      addToDesktop,
      getWidgetById,
      getEntryUrl: buildWidgetEntryUrl,
      getIconUrl: getWidgetIconUrl,
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
      widgetList, loading, refresh, addToDesktop, getWidgetById,
      registerDesktopRef,
      devModeEnabled, toggleDevMode, devWidgets,
      addDevWidget, updateDevWidget, removeDevWidget, getDevWidgetById,
    ],
  );

  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
};

export default WidgetContext;
