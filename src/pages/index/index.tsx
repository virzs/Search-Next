import {
  DesktopNext,
  desktopNextThemeDark,
  desktopNextThemeLight,
} from "zs_library";
import "zs_library/style.css";
import type {
  ContextMenuActionPayload,
  DataTypeMenuConfigMap,
  DndPageItem,
  DndSortItem,
  TypeConfigMap,
} from "zs_library";
import { css, cx } from "@emotion/css";
import { useBoolean, useRequest } from "ahooks";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import {
  RiStore2Line,
  RiSettingsLine,
  RiBrushLine,
  RemixiconComponentType,
  RiUserLine,
} from "@remixicon/react";
import type { DesktopItemData } from "../../types";
import type { WidgetSettingsField } from "../../types";
// import SearchWithAI from "../../components/ai-search";
import { App } from "antd";
import {
  getActiveThemeConfigs,
  getDefaultUserConfig,
  resolveDesktopThemeFromConfigs,
} from "@/services/desktop";
import {
  DESKTOP_LIST_MODIFIED_STORAGE_KEY,
  DESKTOP_LIST_STORAGE_KEY,
} from "@/utils/storage";
import { useAuth } from "@/hooks/useAuth";
import { useConfig } from "@/hooks/useConfig";
import { useWidget } from "@/hooks/useWidget";
import AccountModal from "./components/default-apps/account";
import PureWidget from "@/components/micro-frontend/pure-widget";
import PureWidgetWindow from "@/components/window/pure-widget-window";
import { createHostSDK, sharedEventBus } from "@/sdk";
import type { WidgetSDK, WidgetThemeInfo } from "@/sdk";
import { notification } from "@/utils/globalNotification";
import axiosInstance from "@/utils/axios";
import LoadingOverlay from "./components/loading-overlay";
import WidgetSettingsModal from "@/components/widget-settings-modal";
import { v4 as uuidv4 } from "uuid";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import { Outlet, useNavigate } from "react-router";
import { storeRoute } from "./components/default-apps/store/route-paths";
import { themeRoute } from "./components/default-apps/theme/route-paths";
import { settingsRoute } from "./components/default-apps/settings/route-paths";
import Notice from "./components/notice";
import Feedback from "./components/feedback";

type DesktopItem = DndSortItem<DesktopItemData>;
type DesktopPage = DndPageItem<DesktopItemData>;
type DesktopNextHandleRef = {
  pages: DesktopPage[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

type DesktopRootItem = {
  id: string | number;
  type?: string;
  children?: DesktopStorageItem[];
};

type DesktopStorageItem = Omit<DesktopItem, "children"> & {
  children?: DesktopStorageItem[];
};

const getWidgetDesktopType = (item: Pick<DesktopItem, "type" | "dataType">) => {
  if (typeof item.type === "string" && item.type.startsWith("widget:")) {
    return item.type;
  }
  if (
    typeof item.dataType === "string" &&
    item.dataType.startsWith("widget:")
  ) {
    return item.dataType;
  }
  return null;
};

const normalizeWidgetDesktopItem = (
  item: DesktopStorageItem,
): DesktopStorageItem => {
  const widgetType = getWidgetDesktopType(item);
  return {
    ...item,
    type: widgetType ?? item.type,
    dataType: widgetType ?? item.dataType,
    children: item.children?.map(normalizeWidgetDesktopItem),
  };
};

const normalizeWidgetDesktopList = (list: DesktopRootItem[]): DesktopPage[] =>
  list
    .filter((root) => root.id !== "dock")
    .map((root) => ({
      ...root,
      children: root.children?.map(normalizeWidgetDesktopItem) ?? [],
    }));

const createEmptyDesktopPages = (): DesktopPage[] => [
  { id: "page-1", children: [] },
];

const normalizeHttpUrl = (rawUrl: string | undefined) => {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch (error) {
    console.warn("Invalid desktop website url", error);
    return null;
  }
};

const grayRouteBase = "/desktop-next";
const withGrayRouteBase = (path: string) => `${grayRouteBase}${path}`;

const readStoredDesktopRoots = (): DesktopRootItem[] => {
  const raw = localStorage.getItem(DESKTOP_LIST_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DesktopRootItem[]) : [];
  } catch (error) {
    console.warn("Failed to read desktop-next roots", error);
    return [];
  }
};

const readStoredDockItems = (): DesktopItem[] => {
  const dockRoot = readStoredDesktopRoots().find((root) => root.id === "dock");
  return dockRoot?.children?.map(normalizeWidgetDesktopItem) ?? [];
};

const extractDockItems = (list: DesktopRootItem[]): DesktopItem[] => {
  const dockRoot = list.find((root) => root.id === "dock");
  return dockRoot?.children?.map(normalizeWidgetDesktopItem) ?? [];
};

const persistDesktopStorage = (
  pages: DesktopPage[],
  dockItems: DesktopItem[],
) => {
  const nextPages = pages.length ? pages : createEmptyDesktopPages();
  const roots: DesktopRootItem[] = [
    { id: "dock", children: dockItems },
    ...nextPages,
  ];
  localStorage.setItem(DESKTOP_LIST_STORAGE_KEY, JSON.stringify(roots));
};

const toDesktopNextPages = (list: DesktopRootItem[]): DesktopPage[] => {
  const pages = normalizeWidgetDesktopList(list).map((root, index) => ({
    id: root.id ?? `page-${index + 1}`,
    children: root.children ?? [],
  }));

  return pages.length ? pages : createEmptyDesktopPages();
};

const readStoredDesktopPages = (): DesktopPage[] => {
  return toDesktopNextPages(readStoredDesktopRoots());
};

const migrateStoredWidgetDesktopList = () => {
  const roots = readStoredDesktopRoots();
  if (!roots.length) return;
  persistDesktopStorage(toDesktopNextPages(roots), readStoredDockItems());
};

function Index() {
  useState(migrateStoredWidgetDesktopList);

  const desktopRef = useRef<DesktopNextHandleRef>(null);
  const desktopPagesRef = useRef<DesktopPage[]>(createEmptyDesktopPages());
  const dockItemsRef = useRef<DesktopItem[]>(readStoredDockItems());
  const [desktopPages, setDesktopPages] = useState<DesktopPage[]>(
    readStoredDesktopPages,
  );
  const [dockItems, setDockItems] = useState<DesktopItem[]>(
    () => dockItemsRef.current,
  );
  const [desktopMountKey, setDesktopMountKey] = useState(0);
  const ignoreDesktopChangeUntilRef = useRef(0);

  const { message } = App.useApp();
  const { avatarSrc, coverGradientCss, user, isAuthenticated } = useAuth();
  const { userLimit } = useConfig();
  const { activeThemeId, personalization } = useDesktopTheme();
  const navigate = useNavigate();
  const { widgets, devWidgets, registerDesktopRef } = useWidget();

  const { data: themeConfigs } = useRequest(getActiveThemeConfigs);
  const [preferDark, setPreferDark] = useState(() => {
    return window.document.documentElement.dataset.theme === "dark";
  });

  useEffect(() => {
    const el = window.document.documentElement;
    const update = () => setPreferDark(el.dataset.theme === "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const desktopTheme = useMemo(() => {
    return (
      resolveDesktopThemeFromConfigs(themeConfigs, activeThemeId, preferDark) ??
      (preferDark ? desktopNextThemeDark : desktopNextThemeLight)
    );
  }, [activeThemeId, preferDark, themeConfigs]);

  const persistDesktopPages = useCallback(
    (pages: DesktopPage[], remountDesktop: boolean) => {
      const nextPages = pages.length ? pages : createEmptyDesktopPages();
      desktopPagesRef.current = nextPages;
      persistDesktopStorage(nextPages, dockItemsRef.current);
      setDesktopPages(nextPages);
      if (remountDesktop) setDesktopMountKey((key) => key + 1);
    },
    [],
  );

  const desktopBackgroundCss = useMemo(() => {
    const wallpaper = personalization.wallpaper;

    if (wallpaper.type === "gradient") {
      return `background: ${wallpaper.css};`;
    }

    if (wallpaper.type === "image") {
      const safeUrl = (wallpaper.url || "").replace(/"/g, '\\"');
      return `background-color: #000; background-image: url("${safeUrl}"); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    }

    return "background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);";
  }, [personalization.wallpaper]);

  const [accountInfoOpen, { toggle: toggleAccountInfo }] = useBoolean(false);
  const [init, { toggle: toggleInit }] = useBoolean(true);
  const [fullWidget, setFullWidget] = useState<{
    entry: string;
    props?: any;
    title?: string;
    widgetId?: string;
  } | null>(null);

  // 小组件设置弹窗状态
  const [settingsTarget, setSettingsTarget] = useState<{
    widgetId: string;
    widgetName: string;
    settingsSchema: WidgetSettingsField[];
  } | null>(null);

  /** 为指定小组件创建 SDK 实例，注入宿主主题/用户/配置/通知等能力 */
  const sdkDepsRef = useRef({
    activeThemeId,
    user,
    isAuthenticated,
    userLimit,
    navigate,
  });
  sdkDepsRef.current = {
    activeThemeId,
    user,
    isAuthenticated,
    userLimit,
    navigate,
  };

  const buildSDK = useCallback(
    (widgetId: string, sizeId: string, mode: "icon" | "full"): WidgetSDK => {
      const deps = sdkDepsRef.current;
      return createHostSDK({
        widgetId,
        sizeId,
        mode,
        theme: { activeThemeId: deps.activeThemeId },
        user: deps.user
          ? {
              _id: deps.user._id,
              username: deps.user.username,
              email: deps.user.email,
            }
          : null,
        isAuthenticated: deps.isAuthenticated,
        config: { userLimit: deps.userLimit ?? null, projectInfo: null },
        notification,
        axiosInstance,
        navigateFn: deps.navigate,
        eventBus: sharedEventBus,
      });
    },
    [],
  );

  /** 当主题变化时通过事件总线广播，让所有小组件收到通知 */
  useEffect(() => {
    sharedEventBus.emit("theme:change", { activeThemeId } as WidgetThemeInfo);
  }, [activeThemeId]);

  /** 根据后端小组件数据动态构建 Desktop 的 typeConfigMap */
  const typeConfigMap = useMemo((): TypeConfigMap => {
    const map: TypeConfigMap = {};
    const applyConfig = (key: string, config: TypeConfigMap[string]) => {
      map[key] = config;
    };

    for (const w of widgets) {
      const config = {
        sizeConfigs: w.sizeConfigs?.length
          ? w.sizeConfigs
          : [{ row: 2, col: 2, name: "2x2", id: "2x2" }],
        defaultSizeId: w.defaultSizeId || w.sizeConfigs?.[0]?.id || "2x2",
        allowShare: false,
        allowInfo: false,
        allowDelete: true,
        allowResize: (w.sizeConfigs?.length ?? 0) > 1,
      };
      applyConfig(`widget:${w._id}`, config);
    }
    for (const dw of devWidgets) {
      const config = {
        sizeConfigs: dw.sizeConfigs?.length
          ? dw.sizeConfigs
          : [{ row: 2, col: 2, name: "2x2", id: "2x2" }],
        defaultSizeId: dw.defaultSizeId || dw.sizeConfigs?.[0]?.id || "2x2",
        allowShare: false,
        allowInfo: false,
        allowDelete: true,
        allowResize: (dw.sizeConfigs?.length ?? 0) > 1,
      };
      applyConfig(`widget:${dw.id}`, config);
    }
    return map;
  }, [widgets, devWidgets]);

  const dataTypeMenuConfigMap = useMemo((): DataTypeMenuConfigMap => {
    const map: DataTypeMenuConfigMap = {};
    const addSettingsItem = (widgetType: string) => {
      map[widgetType] = [
        {
          text: "设置",
          icon: <RiSettingsLine size={18} />,
        },
      ];
    };

    for (const widget of widgets) {
      const schema =
        widget.configSnapshot?.settingsSchema || widget.settingsSchema;
      if (Array.isArray(schema) && schema.length > 0) {
        addSettingsItem(`widget:${widget._id}`);
      }
    }

    return map;
  }, [widgets]);

  // userLimit 由 ConfigContext 提供

  const { run: runDefaultDesktop } = useRequest(getDefaultUserConfig, {
    manual: true,
    onSuccess: (res) => {
      const {
        config: { list = [] },
      } = res;

      const isModified =
        localStorage.getItem(DESKTOP_LIST_MODIFIED_STORAGE_KEY) === "true";
      if (!isModified) {
        ignoreDesktopChangeUntilRef.current = Math.max(
          ignoreDesktopChangeUntilRef.current,
          Date.now() + 500,
        );
        const roots = list as DesktopRootItem[];
        const nextPages = toDesktopNextPages(roots);
        const storedDockItems = dockItemsRef.current;
        const nextDockItems = storedDockItems.length
          ? storedDockItems
          : extractDockItems(roots);
        dockItemsRef.current = nextDockItems;
        setDockItems(nextDockItems);
        persistDesktopPages(nextPages, true);
      }
      if (init) toggleInit();
    },
  });

  // 封装固定项构建器
  const createFixedItemBuilder = (i: DesktopItem) => {
    // 封装通用的固定项组件
    const createFixedItem = ({
      key,
      name,
      IconComponent,
      tintStyle,
      iconSize,
      iconColor,
      onClick,
    }: {
      key: string;
      name: string;
      IconComponent: RemixiconComponentType | (() => ReactNode);
      tintStyle?: string;
      iconSize?: number;
      iconColor?: string;
      onClick?: () => void;
    }) => (
      <button
        key={key}
        onClick={onClick}
        title={name}
        type="button"
        className={cx(
          "flex h-14 w-14 items-center justify-center overflow-hidden rounded-[16px] border-0 p-0",
          css`
            position: relative;
            color: ${iconColor ?? "#fff"};
            background: rgba(255, 255, 255, 0.16);
            background-image: ${tintStyle ?? "none"};
            background-size: cover;
            background-position: center;
            -webkit-backdrop-filter: blur(22px) saturate(1.25);
            backdrop-filter: blur(22px) saturate(1.25);
            border: 1px solid rgba(255, 255, 255, 0.28);
            box-shadow:
              0 8px 18px rgba(0, 0, 0, 0.18),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
            cursor: pointer;

            &::before {
              content: "";
              position: absolute;
              inset: 0;
              background: radial-gradient(
                120% 90% at 30% 18%,
                rgba(255, 255, 255, 0.38) 0%,
                rgba(255, 255, 255, 0) 62%
              );
              pointer-events: none;
            }

            &::after {
              content: "";
              position: absolute;
              inset: 0;
              background: radial-gradient(
                120% 120% at 60% 86%,
                rgba(0, 0, 0, 0.14) 0%,
                rgba(0, 0, 0, 0) 56%
              );
              pointer-events: none;
            }
          `,
        )}
      >
        <span
          className="flex h-full w-full items-center justify-center"
          style={{
            zIndex: 1,
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
          }}
        >
          <IconComponent size={iconSize ?? 30} />
        </span>
      </button>
    );

    switch (i.id) {
      case "*:my":
        return createFixedItem({
          key: "my",
          name: "账号",
          IconComponent: avatarSrc
            ? () => (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-full h-full object-cover pointer-events-none"
                />
              )
            : RiUserLine,
          tintStyle:
            coverGradientCss ??
            "linear-gradient(135deg, rgba(255, 59, 48, 0.92) 0%, rgba(175, 82, 222, 0.9) 100%)",
          onClick: () => toggleAccountInfo(),
        });
      case "*:theme":
        return createFixedItem({
          key: "theme",
          name: "个性化",
          IconComponent: RiBrushLine,
          tintStyle:
            "linear-gradient(135deg, rgba(88, 86, 214, 0.92) 0%, rgba(10, 132, 255, 0.9) 55%, rgba(255, 45, 85, 0.86) 100%)",
          iconSize: 30,
          onClick: () => navigate(withGrayRouteBase(themeRoute.path.root)),
        });
      case "*:store":
        return createFixedItem({
          key: "store",
          name: "应用商店",
          IconComponent: RiStore2Line,
          tintStyle:
            "linear-gradient(135deg, rgba(10, 132, 255, 0.95) 0%, rgba(90, 200, 250, 0.9) 100%)",
          iconSize: 30,
          onClick: () => navigate(withGrayRouteBase(storeRoute.path.root)),
        });
      case "*:settings":
        return createFixedItem({
          key: "settings",
          name: "设置",
          IconComponent: RiSettingsLine,
          tintStyle:
            "linear-gradient(135deg, rgba(242, 242, 247, 0.95) 0%, rgba(199, 199, 204, 0.9) 100%)",
          iconSize: 30,
          iconColor: "#1c1c1e",
          onClick: () => navigate(withGrayRouteBase(settingsRoute.path.root)),
        });
      default:
        return null;
    }
  };

  const createDockHistoryItem = useCallback((item: DesktopItem) => {
    const icon = item.data?.icon;
    const name = item.data?.name || "应用";

    return (
      <button
        type="button"
        title={name}
        className={cx(
          "flex h-14 w-14 items-center justify-center overflow-hidden rounded-[16px] border-0 p-0",
          css`
            position: relative;
            background: rgba(255, 255, 255, 0.16);
            border: 1px solid rgba(255, 255, 255, 0.28);
            box-shadow:
              0 8px 18px rgba(0, 0, 0, 0.18),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
            -webkit-backdrop-filter: blur(22px) saturate(1.25);
            backdrop-filter: blur(22px) saturate(1.25);

            &::before {
              content: "";
              position: absolute;
              inset: 0;
              background: radial-gradient(
                120% 90% at 30% 18%,
                rgba(255, 255, 255, 0.38) 0%,
                rgba(255, 255, 255, 0) 62%
              );
              pointer-events: none;
            }
          `,
        )}
      >
        {typeof icon === "string" && icon ? (
          <img
            src={icon}
            alt={name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="relative z-1 text-lg font-semibold text-white">
            {name.charAt(0)}
          </span>
        )}
      </button>
    );
  }, []);

  useEffect(() => {
    runDefaultDesktop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDesktopPagesChange = useCallback(
    (pages: DesktopPage[]) => {
      const nextPages = pages.length ? pages : createEmptyDesktopPages();
      desktopPagesRef.current = nextPages;
      persistDesktopStorage(nextPages, dockItemsRef.current);
      setDesktopPages(nextPages);
      if (!pages.length) return;
      if (init) return;
      if (Date.now() < ignoreDesktopChangeUntilRef.current) return;
      localStorage.setItem(DESKTOP_LIST_MODIFIED_STORAGE_KEY, "true");
    },
    [init],
  );

  const addItemToCurrentPage = useCallback(
    (item: DesktopItem) => {
      const currentPageIndex = desktopRef.current?.currentPage ?? 0;
      const sourcePages = desktopPagesRef.current.length
        ? desktopPagesRef.current
        : createEmptyDesktopPages();
      const targetPageIndex = Math.min(
        currentPageIndex,
        sourcePages.length - 1,
      );
      const nextPages = sourcePages.map((page, index) =>
        index === targetPageIndex
          ? { ...page, children: [...page.children, item] }
          : page,
      );
      persistDesktopPages(nextPages, true);
      localStorage.setItem(DESKTOP_LIST_MODIFIED_STORAGE_KEY, "true");
    },
    [persistDesktopPages],
  );

  const persistDockItems = useCallback((items: DesktopItem[]) => {
    dockItemsRef.current = items;
    setDockItems(items);
    persistDesktopStorage(desktopPagesRef.current, items);
  }, []);

  const syncDockItemFromDesktopClick = useCallback(
    (item: DesktopItem) => {
      if (item.type !== "app") return;
      const sourceId = String(item.id);
      const existingIdx = dockItemsRef.current.findIndex(
        (dockItem) => String(dockItem.config?.sourceId) === sourceId,
      );
      const nextDockItem: DesktopItem =
        existingIdx >= 0
          ? {
              ...dockItemsRef.current[existingIdx],
              ...item,
              id: dockItemsRef.current[existingIdx].id,
              config: {
                ...(dockItemsRef.current[existingIdx].config ?? {}),
                ...(item.config ?? {}),
                sourceId,
              },
            }
          : {
              ...item,
              id: uuidv4(),
              config: { ...(item.config ?? {}), sourceId },
            };
      const nextDockItems = [
        nextDockItem,
        ...dockItemsRef.current.filter((_, index) => index !== existingIdx),
      ].slice(0, 3);
      persistDockItems(nextDockItems);
    },
    [persistDockItems],
  );

  const removeDesktopItemsByType = useCallback(
    (dataType: string) => {
      const sourcePages = desktopPagesRef.current.length
        ? desktopPagesRef.current
        : createEmptyDesktopPages();
      const nextPages = sourcePages.map((page) => ({
        ...page,
        children: page.children.filter(
          (item) => item.type !== dataType && item.dataType !== dataType,
        ),
      }));
      persistDesktopPages(nextPages, true);
    },
    [persistDesktopPages],
  );

  // 注册 desktopRef 到 WidgetContext，使 addToDesktop 可直接操控桌面
  useEffect(() => {
    registerDesktopRef(
      desktopRef,
      addItemToCurrentPage,
      removeDesktopItemsByType,
    );
  }, [addItemToCurrentPage, registerDesktopRef, removeDesktopItemsByType]);

  const handleAddWebsite = (site: {
    name?: string;
    url?: string;
    iconEdited?: { url?: string };
    icon?: { url?: string };
  }) => {
    const url = normalizeHttpUrl(site?.url);
    const icon = site?.iconEdited?.url ?? site?.icon?.url;
    if (!url) return;
    const name = site?.name || url;
    const appItem = {
      id: uuidv4(),
      type: "app",
      data: {
        name,
        icon,
        url,
      },
    };
    addItemToCurrentPage(appItem);
    message.success("添加成功");
  };

  const handleContextMenuItemClick = useCallback(
    (item: DesktopItem, payload: ContextMenuActionPayload) => {
      if (payload.actionType !== "custom") return;
      const widgetDesktopType = getWidgetDesktopType(item);
      if (!widgetDesktopType) return;

      const schema = item.data?.widgetConfig?.settingsSchema;
      if (!Array.isArray(schema) || schema.length === 0) return;

      setSettingsTarget({
        widgetId:
          item.data?.widgetConfig?.id ??
          widgetDesktopType.replace("widget:", ""),
        widgetName:
          item.data?.widgetConfig?.name ?? item.data?.name ?? "小组件",
        settingsSchema: schema,
      });
    },
    [],
  );

  return (
    <div
      className={cx(
        "w-screen h-screen flex flex-col",
        css`
          ${desktopBackgroundCss}
        `,
      )}
    >
      <div className="flex items-center justify-end py-2 px-6 max-w-7xl mx-auto w-full gap-2">
        <Notice />
        <Feedback />
      </div>
      {/* <div className="pt-30 pb-10">
        <SearchWithAI />
      </div> */}
      <div className="flex-1 min-h-0 pb-8 w-full max-w-7xl mx-auto">
        <DesktopNext<DesktopItemData>
          key={desktopMountKey}
          ref={desktopRef}
          pages={desktopPages}
          onChange={handleDesktopPagesChange}
          maxPages={userLimit?.maxPages || 5}
          theme={desktopTheme}
          typeConfigMap={typeConfigMap}
          contextMenuProps={{ showRemoveButton: true }}
          dataTypeMenuConfigMap={dataTypeMenuConfigMap}
          onContextMenuItemClick={handleContextMenuItemClick}
          itemIconBuilder={(item) => {
            const widgetDesktopType = getWidgetDesktopType(item);
            // 动态匹配所有 widget: 前缀的桌面项，渲染对应小组件（icon 模式）
            const widgetConfig = item.data?.widgetConfig;
            if (widgetDesktopType && widgetConfig?.entry) {
              const widgetId =
                widgetConfig.id || widgetDesktopType.replace("widget:", "");
              const sdk = buildSDK(widgetId, "icon", "icon");
              return (
                <PureWidget
                  config={{
                    entry: widgetConfig.entry,
                    props: widgetConfig.props,
                    mode: "icon",
                    sdk,
                  }}
                  className={css`
                    width: 100%;
                    height: 100%;
                  `}
                  onClick={() =>
                    setFullWidget({
                      entry: widgetConfig.entry,
                      props: widgetConfig.props,
                      title: item.data?.name || "小组件",
                      widgetId,
                    })
                  }
                />
              );
            }

            return null;
          }}
          dockProps={{
            items: dockItems,
            itemBuilder: createDockHistoryItem,
            fixedItems: [
              {
                id: "*:my",
                type: "app",
                data: {
                  name: "账号",
                },
              },
              {
                id: "*:theme",
                type: "app",
                data: {
                  name: "个性化",
                },
              },
              {
                id: "*:store",
                type: "app",
                data: {
                  name: "应用商店",
                },
              },
              {
                id: "*:settings",
                type: "app",
                data: {
                  name: "设置",
                },
              },
            ],
            fixedItemBuilder: createFixedItemBuilder,
          }}
          onItemClick={(item) => {
            syncDockItemFromDesktopClick(item);
            if (item.type === "app" && item.data?.url) {
              const url = normalizeHttpUrl(item.data.url);
              if (!url) return;
              window.open(url, "_blank", "noopener,noreferrer");
            }
          }}
        />
      </div>
      <Outlet context={{ onAddWebsite: handleAddWebsite }} />
      <AccountModal open={accountInfoOpen} onClose={toggleAccountInfo} />
      {fullWidget && (
        <PureWidgetWindow
          visible={true}
          onClose={() => setFullWidget(null)}
          config={{ entry: fullWidget.entry, props: fullWidget.props }}
          title={fullWidget.title}
          width={600}
          height={400}
          sdk={
            fullWidget.widgetId
              ? buildSDK(fullWidget.widgetId, "full", "full")
              : undefined
          }
        />
      )}
      {settingsTarget && (
        <WidgetSettingsModal
          visible={true}
          onClose={() => setSettingsTarget(null)}
          widgetId={settingsTarget.widgetId}
          widgetName={settingsTarget.widgetName}
          settingsSchema={settingsTarget.settingsSchema}
        />
      )}
      {init && <LoadingOverlay open text="正在加载配置…" />}
    </div>
  );
}

export default Index;
