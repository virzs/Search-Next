import {
  DesktopNext,
  DesktopNextBaseModal,
  desktopNextThemeDark,
  desktopNextThemeLight,
} from "zs_library";
import type {
  ContextMenuActionPayload,
  DataTypeMenuConfigMap,
  TypeConfigMap,
} from "zs_library";
import { css, cx } from "@emotion/css";
import { useBoolean, useRequest } from "ahooks";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import type { ReactNode } from "react";
import {
  RiApps2Line,
  RiStore2Line,
  RiSettingsLine,
  RiInformationLine,
  RiBrushLine,
  RemixiconComponentType,
} from "@remixicon/react";
import {
  createDesktopItemIconBuilder,
  createEmptyDesktopPages,
  buildDesktopTypeConfigMap,
  extractDockItems,
  getAppDesktopType,
  getAppLauncherDesktopType,
  getDesktopItemAppId,
  hasDesktopPagesContent,
  hasDesktopRootsContent,
  preserveDesktopPageMetadata,
  toDesktopPages,
  toDesktopRoots,
  type DesktopItemData,
  type DesktopPage,
  type DesktopRootItem,
  type DesktopSortItem,
} from "@search-next/desktop";
// import SearchWithAI from "../../components/ai-search";
import { App, Tooltip } from "antd";
import { AppButton, AppCheckbox, AppIconButton } from "@/components/ui";
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
import { useApp } from "@/hooks/useApp";
import PureAppWindow from "@/components/window/pure-app-window";
import { createHostSDK, sharedEventBus } from "@/sdk";
import type { AppMode, AppSDK, AppThemeInfo } from "@/sdk";
import { notification } from "@/utils/globalNotification";
import axiosInstance from "@/utils/axios";
import LoadingOverlay from "./components/loading-overlay";
import AppInfoModal from "@/components/app-info-modal";
import { v4 as uuidv4 } from "uuid";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import type { PersonalizationWallpaper } from "@/contexts/DesktopThemeContext";
import { Outlet, useNavigate } from "react-router";
import { storeRoute } from "./components/default-apps/store/route-paths";
import type { StoreAddPayload } from "./components/default-apps/store";
import { personalizationRoute } from "./components/default-apps/personalization/route-paths";
import {
  getMyThemeConfigs,
  MY_THEMES_CHANGED_EVENT,
} from "./components/default-apps/personalization/my-assets";
import { settingsRoute } from "./components/default-apps/settings/route-paths";
import Notice from "./components/notice";
import WebReleaseUpdatePrompt from "./components/release-update";
import LegalDocumentGate from "./components/legal/LegalDocumentGate";
import Feedback from "./components/feedback";
import { DEFAULT_THEME_COLOR } from "@/theme/color";
import DesktopImageIcon, {
  getStringIcon,
} from "./components/desktop-image-icon";
import { accountRoute } from "./components/default-apps/account/route-paths";
import BoringAccountAvatar from "@/components/auth/BoringAccountAvatar";
import { LOCAL_ACCOUNT_AVATAR_SEED } from "@/components/auth/local-account";
import { getPublicAppDetail } from "@/services/app";
import type { AppApiItem } from "@/types";
import {
  matchesUnifiedSearchShortcut,
  SearchSpotlight,
  useUnifiedSearchPreferences,
} from "@/components/unified-search";
import {
  getCurrentAppLocale,
  resolveAppDescription,
  resolveAppDisplayName,
  resolveAppTags,
  useI18n,
} from "@/i18n";
import {
  clearAppStorage,
  formatAppStorageSize,
  getAppStorageStats,
} from "@/utils/app-storage";
import ApplicationWallpaperBackground, {
  type WallpaperBridgeKeyEvent,
} from "./components/application-wallpaper-background";
import WallpaperPageEdge from "./components/wallpaper-page-edge";
import ScreenSaverOverlay from "./components/screen-saver";
import { useScreenSaverController } from "./components/screen-saver-controller";
import {
  StandardDesktopLayout,
  ZenDesktopLayout,
} from "./components/desktop-layouts";

type DesktopItem = DesktopSortItem<DesktopItemData>;
type DesktopNextHandleRef = {
  pages: DesktopPage[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

type DesktopAppAvailability =
  | { status: "available"; app?: AppApiItem; isDev?: boolean }
  | { status: "checking" }
  | {
      status: "unavailable";
      reason: "disabledOrDeleted" | "verificationFailed";
    };

interface RemoveAppTarget {
  item: DesktopItem;
  appId: string;
  appName: string;
  icon?: string | null;
  otherInstanceCount: number;
  storageBytes: number;
  storageItemCount: number;
}

const applicationWallpaperShellClassName = css`
  pointer-events: none;

  [data-wallpaper-interactive],
  [data-wallpaper-interactive] *,
  [data-base-modal-panel],
  [data-base-modal-panel] *,
  .desktop-next-context-menu,
  .desktop-next-context-menu *,
  .desktop-next-context-submenu,
  .desktop-next-context-submenu * {
    pointer-events: auto;
  }
`;

const applicationWallpaperDesktopClassName = css`
  pointer-events: none;

  * {
    pointer-events: none !important;
  }

  [data-grid-item-id],
  [data-grid-item-id] *,
  .application-wallpaper-dock,
  .application-wallpaper-dock *,
  .application-wallpaper-pagination,
  .application-wallpaper-pagination * {
    pointer-events: auto !important;
  }
`;

interface PendingRemovalDecision {
  appId: string;
  deleteData: boolean;
}

const countAppInstances = (items: DesktopItem[], appId: string): number =>
  items.reduce((count, item) => {
    const ownCount = getDesktopItemAppId(item) === appId ? 1 : 0;
    const nestedCount = item.children?.length
      ? countAppInstances(item.children as DesktopItem[], appId)
      : 0;
    return count + ownCount + nestedCount;
  }, 0);

const firstDefined = <T,>(...values: Array<T | null | undefined>) =>
  values.find((value): value is T => value !== undefined && value !== null);

const definedProps = <T extends Record<string, unknown>>(props: T) =>
  Object.fromEntries(
    Object.entries(props).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as Partial<T>;

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

const isAppUnavailableResponse = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 403 || status === 404 || status === 410;
};

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
  return extractDockItems(readStoredDesktopRoots()) as DesktopItem[];
};

const persistDesktopStorage = (
  pages: DesktopPage[],
  dockItems: DesktopItem[],
) => {
  const nextPages = pages.length ? pages : createEmptyDesktopPages();
  const existingRoots = readStoredDesktopRoots();
  const nextHasContent =
    hasDesktopPagesContent(nextPages) || Boolean(dockItems.length);
  const existingHasContent = hasDesktopRootsContent(existingRoots);

  if (!nextHasContent && existingHasContent) {
    console.warn(
      "Skip persisting empty desktop config over existing local desktop",
    );
    return;
  }

  const roots = toDesktopRoots(nextPages, dockItems);
  localStorage.setItem(DESKTOP_LIST_STORAGE_KEY, JSON.stringify(roots));
};

const readStoredDesktopPages = (): DesktopPage[] => {
  return toDesktopPages(readStoredDesktopRoots()) as DesktopPage[];
};

function Index() {
  const desktopRef = useRef<DesktopNextHandleRef>(null);
  const initialDesktopPagesRef = useRef<DesktopPage[] | null>(null);
  if (!initialDesktopPagesRef.current) {
    initialDesktopPagesRef.current = readStoredDesktopPages();
  }
  const desktopPagesRef = useRef<DesktopPage[]>(initialDesktopPagesRef.current);
  const dockItemsRef = useRef<DesktopItem[]>(readStoredDockItems());
  const [desktopPages, setDesktopPages] = useState<DesktopPage[]>(
    () => initialDesktopPagesRef.current ?? createEmptyDesktopPages(),
  );
  const [dockItems, setDockItems] = useState<DesktopItem[]>(
    () => dockItemsRef.current,
  );
  const [desktopMountKey, setDesktopMountKey] = useState(0);
  const ignoreDesktopChangeUntilRef = useRef(0);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const { message } = App.useApp();
  const { t, locale, language } = useI18n();
  const { coverGradientCss, user, isAuthenticated } = useAuth();
  const { userLimit, projectInfo } = useConfig();
  const systemThemeColor =
    projectInfo?.site?.themeColor || DEFAULT_THEME_COLOR;
  const {
    activeThemeId,
    appearanceMode,
    personalization,
    resolvedColorScheme,
    setWallpaper,
  } = useDesktopTheme();
  const {
    active: screenSaverActive,
    covering: screenSaverCovering,
    recordActivity: recordScreenSaverActivity,
    finishExit: finishScreenSaverExit,
  } = useScreenSaverController(personalization.screenSaver);
  const navigate = useNavigate();
  const {
    apps,
    devApps,
    loading: appsLoading,
    loaded: appsLoaded,
    getEntryUrl,
    getAppIconUrl,
    addToDesktop,
    addAppToDesktop,
    registerDesktopRef,
  } = useApp();

  const { data: themeConfigs } = useRequest(getActiveThemeConfigs);
  const [myThemeConfigs, setMyThemeConfigs] = useState(() =>
    getMyThemeConfigs(systemThemeColor),
  );
  const preferDark = resolvedColorScheme === "dark";
  const { preferences: searchPreferences } = useUnifiedSearchPreferences();
  const appMap = useMemo(
    () => new Map(apps.map((app) => [app._id, app])),
    [apps],
  );
  const devAppMap = useMemo(
    () => new Map(devApps.map((app) => [app.id, app])),
    [devApps],
  );
  const resolveDesktopAppAvailability = useCallback(
    (appId: string): DesktopAppAvailability => {
      if (devAppMap.has(appId)) return { status: "available", isDev: true };
      if (!appsLoaded || appsLoading) return { status: "checking" };
      const app = appMap.get(appId);
      return app
        ? { status: "available", app }
        : { status: "unavailable", reason: "disabledOrDeleted" };
    },
    [appMap, appsLoaded, appsLoading, devAppMap],
  );
  const [availabilityModal, setAvailabilityModal] = useState<{
    status: "checking" | "unavailable";
    name?: string;
    icon?: string | null;
  } | null>(null);
  const openAvailabilityModal = useCallback(
    (
      status: "checking" | "unavailable",
      options?: { name?: string; icon?: string | null },
    ) => {
      setAvailabilityModal({
        status,
        name: options?.name,
        icon: options?.icon ?? null,
      });
    },
    [],
  );
  const closeAvailabilityModal = useCallback(() => {
    flushSync(() => setAvailabilityModal(null));
  }, []);
  const renderAppAvailabilityPlaceholder = useCallback(
    ({
      status,
      name,
      icon,
    }: {
      status: "checking" | "unavailable";
      name: string;
      icon?: string | null;
    }) => {
      const unavailable = status === "unavailable";
      const title = t(
        unavailable ? "ui.appUnavailableMessage" : "ui.appCheckingMessage",
      );

      return (
        <button
          type="button"
          title={`${name} - ${title}`}
          aria-label={`${name} - ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            openAvailabilityModal(status, { name, icon });
          }}
          className={cx(
            "relative flex h-full w-full items-center justify-center overflow-visible border-0 bg-transparent p-0 text-center",
            css`
              border-radius: inherit;
              cursor: ${unavailable ? "not-allowed" : "wait"};
            `,
          )}
        >
          <span
            className={cx(
              "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]",
              css`
                background: ${unavailable
                  ? "rgba(142, 142, 147, 0.16)"
                  : "rgba(10, 132, 255, 0.12)"};
                box-shadow:
                  inset 0 0 0 1px rgba(255, 255, 255, 0.28),
                  0 6px 16px rgba(0, 0, 0, 0.12);

                &::after {
                  content: "";
                  position: absolute;
                  inset: 0;
                  background: ${unavailable
                    ? "rgba(242, 242, 247, 0.34)"
                    : "rgba(10, 132, 255, 0.1)"};
                  pointer-events: none;
                }

                .dark & {
                  background: ${unavailable
                    ? "rgba(99, 99, 102, 0.22)"
                    : "rgba(10, 132, 255, 0.18)"};
                  box-shadow:
                    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                    0 8px 18px rgba(0, 0, 0, 0.28);

                  &::after {
                    background: ${unavailable
                      ? "rgba(0, 0, 0, 0.18)"
                      : "rgba(10, 132, 255, 0.08)"};
                  }
                }
              `,
            )}
          >
            {icon ? (
              <DesktopImageIcon
                src={icon}
                name={name}
                objectFit="contain"
                className={cx(
                  unavailable
                    ? "grayscale opacity-60 contrast-[0.9]"
                    : "opacity-75",
                )}
              />
            ) : (
              <span
                className={cx(
                  "flex h-full w-full items-center justify-center rounded-[inherit]",
                  unavailable
                    ? "bg-white/20 text-[#8e8e93] dark:bg-white/10 dark:text-[#aeaeb2]"
                    : "bg-white/28 text-[#0a84ff] dark:bg-white/10",
                )}
              >
                <RiApps2Line size={22} className="opacity-75" />
              </span>
            )}
          </span>
        </button>
      );
    },
    [openAvailabilityModal, t],
  );

  useEffect(() => {
    sharedEventBus.emit("locale:change", locale);
  }, [locale]);

  useEffect(() => {
    const reloadMyThemes = () =>
      setMyThemeConfigs(getMyThemeConfigs(systemThemeColor));
    reloadMyThemes();
    window.addEventListener("storage", reloadMyThemes);
    window.addEventListener(MY_THEMES_CHANGED_EVENT, reloadMyThemes);
    return () => {
      window.removeEventListener("storage", reloadMyThemes);
      window.removeEventListener(MY_THEMES_CHANGED_EVENT, reloadMyThemes);
    };
  }, [systemThemeColor]);

  const desktopTheme = useMemo(() => {
    const mergedThemeConfigs = [...(themeConfigs ?? []), ...myThemeConfigs];
    const resolved =
      resolveDesktopThemeFromConfigs(
        mergedThemeConfigs,
        activeThemeId,
        preferDark,
      ) ?? (preferDark ? desktopNextThemeDark : desktopNextThemeLight);

    return {
      ...resolved,
      token: {
        ...resolved.token,
        contextMenu: {
          ...resolved.token.contextMenu,
          activeColor: systemThemeColor,
        },
      },
    };
  }, [
    activeThemeId,
    myThemeConfigs,
    preferDark,
    systemThemeColor,
    themeConfigs,
  ]);

  const persistDesktopPages = useCallback(
    (pages: DesktopPage[], remountDesktop: boolean) => {
      const nextPages = pages.length ? pages : createEmptyDesktopPages();
      desktopPagesRef.current = nextPages;
      persistDesktopStorage(nextPages, dockItemsRef.current);
      setDesktopPages(nextPages);
      if (remountDesktop) {
        ignoreDesktopChangeUntilRef.current = Math.max(
          ignoreDesktopChangeUntilRef.current,
          Date.now() + 2000,
        );
        setDesktopMountKey((key) => key + 1);
      }
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

    if (wallpaper.type === "application") {
      return "background: #000;";
    }

    return "background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);";
  }, [personalization.wallpaper]);

  const applicationWallpaper =
    personalization.wallpaper.type === "application"
      ? personalization.wallpaper
      : null;

  const handleApplicationWallpaperResolved = useCallback(
    (
      wallpaper: Extract<
        PersonalizationWallpaper,
        { type: "application" }
      >,
    ) => setWallpaper(wallpaper),
    [setWallpaper],
  );

  const handleApplicationWallpaperUnavailable = useCallback(() => {
    message.warning(t("ui.applicationWallpaperUnavailable"));
    setWallpaper({ type: "none", name: "None" });
  }, [message, setWallpaper, t]);

  const handleApplicationWallpaperKeyDown = useCallback(
    (payload: WallpaperBridgeKeyEvent) => {
      if (!searchPreferences.enableSpotlightShortcut) return;
      const event = new KeyboardEvent("keydown", payload);
      if (
        matchesUnifiedSearchShortcut(
          event,
          searchPreferences.spotlightShortcut,
        )
      ) {
        setSpotlightOpen(true);
      }
    },
    [
      searchPreferences.enableSpotlightShortcut,
      searchPreferences.spotlightShortcut,
    ],
  );

  const [init, { setFalse: finishInit }] = useBoolean(true);
  const [fullApp, setFullApp] = useState<{
    entry: string;
    props?: any;
    title?: string;
    appId?: string;
    appConfig?: DesktopItemData["appConfig"];
  } | null>(null);

  // 应用信息弹窗状态
  const [infoTarget, setInfoTarget] = useState<{
    appId: string;
    appName: string;
    appConfig?: DesktopItemData["appConfig"];
  } | null>(null);
  const [removeAppTarget, setRemoveAppTarget] =
    useState<RemoveAppTarget | null>(null);
  const [deleteAppData, setDeleteAppData] = useState(false);
  const removeDecisionResolverRef = useRef<
    ((allowed: boolean) => void) | null
  >(null);
  const pendingRemovalDecisionsRef = useRef(
    new Map<string, PendingRemovalDecision>(),
  );
  const closeFullApp = useCallback(() => {
    flushSync(() => setFullApp(null));
  }, []);
  const closeInfoModal = useCallback(() => {
    flushSync(() => setInfoTarget(null));
  }, []);
  const settleRemoveDecision = useCallback((allowed: boolean) => {
    const resolve = removeDecisionResolverRef.current;
    removeDecisionResolverRef.current = null;
    flushSync(() => {
      setRemoveAppTarget(null);
      setDeleteAppData(false);
    });
    resolve?.(allowed);
  }, []);
  const cancelRemoveApp = useCallback(() => {
    settleRemoveDecision(false);
  }, [settleRemoveDecision]);
  const confirmRemoveApp = useCallback(() => {
    if (!removeAppTarget) return;
    pendingRemovalDecisionsRef.current.set(String(removeAppTarget.item.id), {
      appId: removeAppTarget.appId,
      deleteData: deleteAppData,
    });
    settleRemoveDecision(true);
  }, [deleteAppData, removeAppTarget, settleRemoveDecision]);

  useEffect(
    () => () => {
      removeDecisionResolverRef.current?.(false);
      removeDecisionResolverRef.current = null;
    },
    [],
  );

  /** 为指定应用创建 SDK 实例，注入宿主主题/用户/配置/通知等能力 */
  const sdkDepsRef = useRef({
    activeThemeId,
    appearanceMode,
    resolvedColorScheme,
    user,
    isAuthenticated,
    userLimit,
    locale,
    navigate,
  });
  sdkDepsRef.current = {
    activeThemeId,
    appearanceMode,
    resolvedColorScheme,
    user,
    isAuthenticated,
    userLimit,
    locale,
    navigate,
  };

  const buildSDK = useCallback(
    (appId: string, sizeId: string, mode: AppMode): AppSDK => {
      const deps = sdkDepsRef.current;
      return createHostSDK({
        appId,
        sizeId,
        mode,
        theme: {
          activeThemeId: deps.resolvedColorScheme,
          desktopThemeId: deps.activeThemeId,
          appearanceMode: deps.appearanceMode,
          resolvedColorScheme: deps.resolvedColorScheme,
        },
        locale: deps.locale,
        getLocale: getCurrentAppLocale,
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

  const createAppConfigFromApi = useCallback(
    (
      app: AppApiItem,
      fallback?: DesktopItemData["appConfig"],
    ): DesktopItemData["appConfig"] | undefined => {
      const entry = getEntryUrl(app) || fallback?.entry;
      if (!entry) return fallback;
      const snapshot = app.configSnapshot;
      const name = resolveAppDisplayName(app, language, fallback);
      const description = resolveAppDescription(app, language, fallback);
      const tags = resolveAppTags(app, language, fallback);

      return {
        ...(fallback ?? {}),
        id: app._id,
        name,
        entry,
        props: {
          ...(fallback?.props ?? {}),
          title: name,
        },
        ...definedProps({
          displayName: firstDefined(
            snapshot?.displayName,
            app.displayName,
            fallback?.displayName,
          ),
          displayNameI18n: firstDefined(
            snapshot?.displayNameI18n,
            app.displayNameI18n,
            fallback?.displayNameI18n,
          ),
          settingsSchema: firstDefined(
            snapshot?.settingsSchema,
            app.settingsSchema,
            fallback?.settingsSchema,
          ),
          sizeConfigs: firstDefined(
            snapshot?.sizeConfigs,
            app.sizeConfigs,
            fallback?.sizeConfigs,
          ),
          defaultSizeId: firstDefined(
            snapshot?.defaultSizeId,
            app.defaultSizeId,
            fallback?.defaultSizeId,
          ),
          pagePaths: firstDefined(
            snapshot?.pagePaths,
            app.pagePaths,
            fallback?.pagePaths,
          ),
          supportAppMode: firstDefined(
            snapshot?.supportAppMode,
            app.supportAppMode,
            fallback?.supportAppMode,
          ),
          appIcon: firstDefined(
            snapshot?.appIcon,
            app.appIcon,
            fallback?.appIcon,
          ),
          appIconUrl: firstDefined(
            getAppIconUrl(app),
            snapshot?.appIconUrl,
            app.appIconUrl,
            fallback?.appIconUrl,
          ),
          sourceType: firstDefined(app.sourceType, fallback?.sourceType),
          version: firstDefined(
            snapshot?.version,
            app.version,
            fallback?.version,
          ),
          author: firstDefined(snapshot?.author, app.author, fallback?.author),
          description,
          descriptionI18n: firstDefined(
            snapshot?.descriptionI18n,
            app.descriptionI18n,
            fallback?.descriptionI18n,
          ),
          tags,
          tagsI18n: firstDefined(
            snapshot?.tagsI18n,
            app.tagsI18n,
            fallback?.tagsI18n,
          ),
        }),
        availability: "available",
        unavailableReason: undefined,
      };
    },
    [getAppIconUrl, getEntryUrl, language],
  );

  const resolveAppConfigFresh = useCallback(
    async (
      appId: string,
      fallback?: DesktopItemData["appConfig"],
    ): Promise<DesktopItemData["appConfig"] | null | undefined> => {
      try {
        const detail = await getPublicAppDetail(appId);
        const app = ((detail as any)?.data ?? detail) as AppApiItem;
        if (app?._id) return createAppConfigFromApi(app, fallback);
      } catch (error) {
        if (isAppUnavailableResponse(error)) {
          return null;
        }
        console.warn("Failed to refresh app detail before opening", error);
      }
      const knownAvailableApp = appMap.get(appId);
      return knownAvailableApp
        ? createAppConfigFromApi(knownAvailableApp, fallback)
        : undefined;
    },
    [appMap, createAppConfigFromApi],
  );

  const refreshStoredAppSnapshots = useCallback(() => {
    if (!appsLoaded) return;
    let changed = false;

    const refreshItem = (item: DesktopItem): DesktopItem => {
      const appLauncherDesktopType = getAppLauncherDesktopType(item);
      const appDesktopType = getAppDesktopType(item);
      const appId = getDesktopItemAppId(item);
      if (!appId) return item;

      if (devAppMap.has(appId)) return item;

      const currentConfig = item.data?.appConfig;
      const app = appMap.get(appId);
      if (!app) {
        if (!currentConfig) return item;
        const nextAppConfig: DesktopItemData["appConfig"] = {
          ...currentConfig,
          id: appId,
          entry: "",
          availability: "unavailable",
          unavailableReason: "disabledOrDeleted",
        };
        const nextItem: DesktopItem = {
          ...item,
          ...(appLauncherDesktopType
            ? { type: "app", dataType: appLauncherDesktopType }
            : {}),
          ...(appDesktopType
            ? { type: appDesktopType, dataType: appDesktopType }
            : {}),
          data: {
            ...(item.data ?? { name: currentConfig.name || t("ui.app") }),
            name: item.data?.name || currentConfig.name || t("ui.app"),
            appConfig: nextAppConfig,
          },
        };

        if (JSON.stringify(nextItem) !== JSON.stringify(item)) {
          changed = true;
        }
        return nextItem;
      }

      const nextConfig = createAppConfigFromApi(app, currentConfig);
      if (!nextConfig) return item;

      const appIconUrl =
        nextConfig.appIconUrl ?? getAppIconUrl(app) ?? undefined;
      const nextAppConfig = {
        ...nextConfig,
        ...(appIconUrl ? { appIconUrl } : {}),
      };
      const nextData: DesktopItem["data"] = {
        ...(item.data ?? { name: nextAppConfig.name }),
        name: nextAppConfig.name || item.data?.name || t("ui.app"),
        appConfig: nextAppConfig,
      };

      if (appLauncherDesktopType && appIconUrl) {
        nextData.icon = appIconUrl;
      }

      const nextItem: DesktopItem = {
        ...item,
        ...(appLauncherDesktopType
          ? { type: "app", dataType: appLauncherDesktopType }
          : {}),
        ...(appDesktopType
          ? { type: appDesktopType, dataType: appDesktopType }
          : {}),
        data: nextData,
      };

      if (JSON.stringify(nextItem) !== JSON.stringify(item)) {
        changed = true;
      }
      return nextItem;
    };

    const nextPages = desktopPagesRef.current.map((page) => ({
      ...page,
      children: page.children.map(refreshItem),
    }));
    const nextDockItems = dockItemsRef.current.map(refreshItem);

    if (!changed) return;

    desktopPagesRef.current = nextPages;
    dockItemsRef.current = nextDockItems;
    setDesktopPages(nextPages);
    setDockItems(nextDockItems);
    persistDesktopStorage(nextPages, nextDockItems);
  }, [appMap, appsLoaded, createAppConfigFromApi, devAppMap, getAppIconUrl, t]);

  const openAppWindow = useCallback(
    async ({
      appId,
      appConfig,
      fallbackTitle,
    }: {
      appId: string;
      appConfig: DesktopItemData["appConfig"];
      fallbackTitle: string;
    }) => {
      const availability = resolveDesktopAppAvailability(appId);
      if (availability.status === "checking") {
        openAvailabilityModal("checking", {
          name: appConfig?.name || fallbackTitle,
          icon: appConfig?.appIconUrl,
        });
        return;
      }
      if (availability.status === "unavailable") {
        openAvailabilityModal("unavailable", {
          name: appConfig?.name || fallbackTitle,
          icon: appConfig?.appIconUrl,
        });
        return;
      }
      const resolvedAppConfig = await resolveAppConfigFresh(appId, appConfig);
      if (resolvedAppConfig === null) {
        openAvailabilityModal("unavailable", {
          name: appConfig?.name || fallbackTitle,
          icon: appConfig?.appIconUrl,
        });
        return;
      }
      const nextConfig = resolvedAppConfig || appConfig;
      if (!nextConfig?.entry) {
        openAvailabilityModal("unavailable", {
          name: appConfig?.name || fallbackTitle,
          icon: appConfig?.appIconUrl,
        });
        return;
      }
      setFullApp({
        entry: nextConfig.entry,
        props: nextConfig.props,
        title: nextConfig.name || fallbackTitle,
        appId,
        appConfig: nextConfig,
      });
    },
    [
      openAvailabilityModal,
      resolveAppConfigFresh,
      resolveDesktopAppAvailability,
    ],
  );

  useEffect(() => {
    refreshStoredAppSnapshots();
  }, [refreshStoredAppSnapshots]);

  useEffect(() => {
    if (!searchPreferences.enableSpotlightShortcut) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !matchesUnifiedSearchShortcut(
          event,
          searchPreferences.spotlightShortcut,
        )
      )
        return;
      event.preventDefault();
      setSpotlightOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    searchPreferences.enableSpotlightShortcut,
    searchPreferences.spotlightShortcut,
  ]);

  /** 当主题变化时通过事件总线广播，让所有应用收到通知 */
  useEffect(() => {
    sharedEventBus.emit("theme:change", {
      activeThemeId: resolvedColorScheme,
      desktopThemeId: activeThemeId,
      appearanceMode,
      resolvedColorScheme,
    } as AppThemeInfo);
  }, [activeThemeId, appearanceMode, resolvedColorScheme]);

  /** 根据后端应用数据动态构建 Desktop 的 typeConfigMap */
  const typeConfigMap = useMemo((): TypeConfigMap => {
    return buildDesktopTypeConfigMap([...apps, ...devApps]) as TypeConfigMap;
  }, [apps, devApps]);

  const dataTypeMenuConfigMap = useMemo((): DataTypeMenuConfigMap => {
    const map: DataTypeMenuConfigMap = {};
    const addInfoItem = (appType: string) => {
      map[appType] = [
        {
          text: t("ui.appInfo"),
          icon: <RiInformationLine size={18} />,
        },
      ];
    };

    for (const app of apps) {
      if (app.configSnapshot?.supportAppMode ?? app.supportAppMode) {
        addInfoItem(`app-launcher:${app._id}`);
      }
    }

    return map;
  }, [t, apps]);

  // userLimit 由 ConfigContext 提供

  const { run: runDefaultDesktop } = useRequest(getDefaultUserConfig, {
    manual: true,
    onSuccess: (res) => {
      const list = Array.isArray(res?.config?.list) ? res.config.list : [];

      const isModified =
        localStorage.getItem(DESKTOP_LIST_MODIFIED_STORAGE_KEY) === "true";
      if (!isModified) {
        const storedRoots = readStoredDesktopRoots();
        const hasStoredContent = hasDesktopRootsContent(storedRoots);
        const roots = list as DesktopRootItem[];
        const hasRemoteContent = hasDesktopRootsContent(roots);

        if (!hasRemoteContent && hasStoredContent) {
          console.warn(
            "Skip empty remote desktop config to avoid clearing local desktop",
          );
          if (init) finishInit();
          return;
        }

        ignoreDesktopChangeUntilRef.current = Math.max(
          ignoreDesktopChangeUntilRef.current,
          Date.now() + 2000,
        );
        const nextPages = toDesktopPages(roots) as DesktopPage[];
        const storedDockItems = dockItemsRef.current;
        const nextDockItems = storedDockItems.length
          ? storedDockItems
          : (extractDockItems(roots) as DesktopItem[]);
        dockItemsRef.current = nextDockItems;
        setDockItems(nextDockItems);
        persistDesktopPages(nextPages, true);
      }
      if (init) finishInit();
    },
    onError: () => {
      if (init) finishInit();
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
          "flex h-14 w-14 items-center justify-center overflow-hidden rounded-[var(--sn-radius-panel)] border-0 p-0",
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
          name: isAuthenticated ? t("ui.account") : t("ui.account.localName"),
          IconComponent: isAuthenticated
            ? () => (
                <BoringAccountAvatar
                  seed={user?.email || user?.username}
                  className="h-full w-full pointer-events-none"
                  aria-hidden
                />
              )
            : () => (
                <BoringAccountAvatar
                  seed={LOCAL_ACCOUNT_AVATAR_SEED}
                  className="h-full w-full pointer-events-none"
                  aria-hidden
                />
              ),
          tintStyle: isAuthenticated
            ? coverGradientCss ??
              "linear-gradient(135deg, rgba(255, 59, 48, 0.92) 0%, rgba(175, 82, 222, 0.9) 100%)"
            : "linear-gradient(135deg, rgba(52, 199, 89, 0.92) 0%, rgba(10, 132, 255, 0.9) 52%, rgba(255, 159, 10, 0.9) 100%)",
          onClick: () => navigate(accountRoute.path.profile),
        });
      case "*:personalization":
        return createFixedItem({
          key: "personalization",
          name: t("ui.personalization"),
          IconComponent: RiBrushLine,
          tintStyle:
            "linear-gradient(135deg, rgba(88, 86, 214, 0.92) 0%, rgba(10, 132, 255, 0.9) 55%, rgba(255, 45, 85, 0.86) 100%)",
          iconSize: 30,
          onClick: () => navigate(personalizationRoute.path.root),
        });
      case "*:store":
        return createFixedItem({
          key: "store",
          name: t("ui.appStore"),
          IconComponent: RiStore2Line,
          tintStyle:
            "linear-gradient(135deg, rgba(10, 132, 255, 0.95) 0%, rgba(90, 200, 250, 0.9) 100%)",
          iconSize: 30,
          onClick: () => navigate(storeRoute.path.root),
        });
      case "*:settings":
        return createFixedItem({
          key: "settings",
          name: t("ui.settings"),
          IconComponent: RiSettingsLine,
          tintStyle:
            "linear-gradient(135deg, rgba(242, 242, 247, 0.95) 0%, rgba(199, 199, 204, 0.9) 100%)",
          iconSize: 30,
          iconColor: "#1c1c1e",
          onClick: () => navigate(settingsRoute.path.root),
        });
      default:
        return null;
    }
  };

  const createDockHistoryItem = useCallback(
    (item: DesktopItem) => {
      const icon = getStringIcon(item.data?.icon);
      const name = item.data?.name || t("ui.app");
      const appId = getDesktopItemAppId(item);
      const availability = appId
        ? resolveDesktopAppAvailability(appId)
        : ({ status: "available" } as DesktopAppAvailability);

      if (availability.status !== "available") {
        return (
          <div className="h-14 w-14 overflow-visible rounded-[var(--sn-radius-panel)]">
            {renderAppAvailabilityPlaceholder({
              status: availability.status,
              name,
              icon,
            })}
          </div>
        );
      }

      return (
        <button
          type="button"
          title={name}
          className={cx(
            "flex h-14 w-14 items-center justify-center overflow-hidden rounded-[var(--sn-radius-panel)] border-0 p-0",
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
          {icon ? (
            <DesktopImageIcon src={icon} name={name} />
          ) : (
            <span className="relative z-1 text-lg font-semibold text-white">
              {name.charAt(0)}
            </span>
          )}
        </button>
      );
    },
    [renderAppAvailabilityPlaceholder, resolveDesktopAppAvailability, t],
  );

  useEffect(() => {
    runDefaultDesktop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDesktopPagesChange = useCallback(
    (pages: DesktopPage[]) => {
      const previousPages = desktopPagesRef.current.length
        ? desktopPagesRef.current
        : createEmptyDesktopPages();
      const nextPages = pages.length
        ? preserveDesktopPageMetadata(pages, previousPages)
        : createEmptyDesktopPages();
      const nextHasContent = hasDesktopPagesContent(nextPages);
      const previousHasContent = hasDesktopPagesContent(previousPages);
      const shouldIgnoreSuspiciousEmptyChange =
        !nextHasContent &&
        previousHasContent &&
        (init || Date.now() < ignoreDesktopChangeUntilRef.current);

      if (shouldIgnoreSuspiciousEmptyChange) {
        console.warn(
          "Skip empty desktop pages change during initialization/remount",
        );
        return;
      }

      desktopPagesRef.current = nextPages;
      setDesktopPages(nextPages);
      if (init) return;
      if (Date.now() < ignoreDesktopChangeUntilRef.current) return;
      if (!pages.length) return;
      persistDesktopStorage(nextPages, dockItemsRef.current);
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
      persistDesktopPages(nextPages, false);
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

  // 注册 desktopRef 到 AppContext，使 addToDesktop 可直接操控桌面
  useEffect(() => {
    registerDesktopRef(
      desktopRef,
      addItemToCurrentPage,
      removeDesktopItemsByType,
    );
  }, [addItemToCurrentPage, registerDesktopRef, removeDesktopItemsByType]);

  const handleAddStoreItem = useCallback(
    (payload: StoreAddPayload) => {
      if (payload.kind === "website") {
        const url = normalizeHttpUrl(payload.site?.url);
        const icon = payload.site?.iconEdited?.url ?? payload.site?.icon?.url;
        if (!url) return;
        const name = payload.site?.name || url;
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
        message.success(t("ui.added"));
        return;
      }

      if (payload.kind === "app") {
        if (payload.sizeId) {
          addToDesktop(payload.appId, { sizeId: payload.sizeId });
        } else {
          addAppToDesktop(payload.appId);
        }
        return;
      }
    },
    [addAppToDesktop, addItemToCurrentPage, addToDesktop, message, t],
  );

  const handleContextMenuItemClick = useCallback(
    (item: DesktopItem, payload: ContextMenuActionPayload) => {
      if (payload.actionType === "remove") {
        const decision = pendingRemovalDecisionsRef.current.get(
          String(item.id),
        );
        pendingRemovalDecisionsRef.current.delete(String(item.id));

        const sourceId = String(item.id);
        const nextDockItems = dockItemsRef.current.filter(
          (dockItem) => String(dockItem.config?.sourceId) !== sourceId,
        );
        if (nextDockItems.length !== dockItemsRef.current.length) {
          persistDockItems(nextDockItems);
        }

        if (decision?.deleteData) {
          const keys = clearAppStorage(decision.appId);
          keys.forEach((key) => {
            sharedEventBus.emit("storage:changed", {
              appId: decision.appId,
              key,
              value: null,
            });
          });
          sharedEventBus.emit("storage:changed", {
            appId: decision.appId,
            key: "*",
            value: null,
          });
        }

        if (decision) {
          message.success(
            t(decision.deleteData ? "ui.removedWithData" : "ui.removed"),
          );
        }
        return;
      }

      if (payload.actionType !== "custom") return;
      const appLauncherDesktopType = getAppLauncherDesktopType(item);
      if (!appLauncherDesktopType) return;

      const appConfig = item.data?.appConfig;
      const appId =
        appConfig?.id ?? appLauncherDesktopType?.replace("app-launcher:", "");
      if (!appId) return;
      const latestApp = apps.find((app) => app._id === appId);
      const latestDevApp = devApps.find((app) => app.id === appId);
      const latestConfig = latestApp
        ? createAppConfigFromApi(latestApp, appConfig)
        : undefined;

      setInfoTarget({
        appId,
        appName: latestApp
          ? resolveAppDisplayName(latestApp, language, appConfig)
          : (latestDevApp?.name ??
            appConfig?.name ??
            item.data?.name ??
            t("ui.app")),
        appConfig: {
          ...(appConfig ?? {}),
          ...(latestConfig ?? {}),
          id: appId,
          name: latestApp
            ? resolveAppDisplayName(latestApp, language, appConfig)
            : (latestDevApp?.name ??
              appConfig?.name ??
              item.data?.name ??
              t("ui.app")),
          entry:
            latestConfig?.entry ??
            latestDevApp?.entry ??
            appConfig?.entry ??
            "",
        },
      });
    },
    [
      apps,
      createAppConfigFromApi,
      devApps,
      language,
      message,
      persistDockItems,
      t,
    ],
  );

  const handleBeforeRemove = useCallback(
    (item: DesktopItem): boolean | Promise<boolean> => {
      const appId = getDesktopItemAppId(item);
      if (!appId) return true;
      if (removeDecisionResolverRef.current) return false;

      const appConfig = item.data?.appConfig;
      const latestApp = appMap.get(appId);
      const latestDevApp = devAppMap.get(appId);
      const appName = latestApp
        ? resolveAppDisplayName(latestApp, language, appConfig)
        : (latestDevApp?.name ??
          appConfig?.name ??
          item.data?.name ??
          t("ui.app"));
      const stats = getAppStorageStats(appId);
      const totalInstances = desktopPagesRef.current.reduce(
        (count, page) =>
          count + countAppInstances(page.children as DesktopItem[], appId),
        0,
      );

      setDeleteAppData(false);
      setRemoveAppTarget({
        item,
        appId,
        appName,
        icon:
          appConfig?.appIconUrl ??
          (typeof item.data?.icon === "string" ? item.data.icon : null),
        otherInstanceCount: Math.max(0, totalInstances - 1),
        storageBytes: stats.byteSize,
        storageItemCount: stats.keyCount,
      });

      return new Promise<boolean>((resolve) => {
        removeDecisionResolverRef.current = resolve;
      });
    }, [appMap, devAppMap, language, t]);

  const handleOpenSearchApp = useCallback(
    (app: AppApiItem) => {
      const appConfig = createAppConfigFromApi(app);
      if (!appConfig?.entry) return;
      void openAppWindow({
        appId: app._id,
        appConfig,
        fallbackTitle: appConfig.name || t("ui.app"),
      });
    },
    [createAppConfigFromApi, openAppWindow, t],
  );

  const desktopItemIconBuilder = useMemo(
    () =>
      createDesktopItemIconBuilder<AppSDK, AppApiItem>({
        appNameFallback: t("ui.app"),
        remoteAppClassName: css`
          width: 100%;
          height: 100%;
        `,
        createSdk: ({ appId, sizeId, mode }) => buildSDK(appId, sizeId, mode),
        resolveAppAvailability: (appId) => resolveDesktopAppAvailability(appId),
        resolveAppConfig: ({ app, appConfig }) =>
          app
            ? (createAppConfigFromApi(app, appConfig) ?? appConfig)
            : appConfig,
        renderAvailabilityPlaceholder: ({ status, name, src }) =>
          renderAppAvailabilityPlaceholder({
            status,
            name: name || t("ui.app"),
            icon: src,
          }),
        renderImageIcon: ({ src, name, objectFit }) =>
          src ? (
            <DesktopImageIcon
              src={src}
              name={name || t("ui.app")}
              objectFit={objectFit}
            />
          ) : null,
        remoteLoadFailedFallback: () => (
          <div className="flex h-full w-full items-center justify-center text-xs text-red-500">
            {t("app.loadFailed")}
          </div>
        ),
        onAppComponentClick: ({ appId, appConfig, item }) => {
          void openAppWindow({
            appId,
            appConfig,
            fallbackTitle: appConfig.name || item.data?.name || t("ui.app"),
          });
        },
      }),
    [
      buildSDK,
      createAppConfigFromApi,
      openAppWindow,
      renderAppAvailabilityPlaceholder,
      resolveDesktopAppAvailability,
      t,
    ],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div
        data-desktop-wallpaper-layer
        className={cx(
          "absolute inset-0 overflow-hidden bg-black",
          !applicationWallpaper
            ? css`
                ${desktopBackgroundCss}
              `
            : null,
        )}
        style={{ zIndex: 0 }}
      >
        {applicationWallpaper ? (
          <ApplicationWallpaperBackground
            wallpaper={applicationWallpaper}
            theme={resolvedColorScheme}
            language={language as "zh-CN" | "en-US"}
            onResolved={handleApplicationWallpaperResolved}
            onUnavailable={handleApplicationWallpaperUnavailable}
            onBridgeKeyDown={handleApplicationWallpaperKeyDown}
            onBridgeActivity={recordScreenSaverActivity}
          />
        ) : null}
      </div>
      <div
        inert={screenSaverCovering ? true : undefined}
        aria-hidden={screenSaverCovering ? true : undefined}
        className={cx(
          "relative z-10 flex h-full w-full flex-col",
          applicationWallpaper ? applicationWallpaperShellClassName : null,
        )}
      >
        <div className="contents" data-wallpaper-interactive>
          <WebReleaseUpdatePrompt />
          <LegalDocumentGate />
        </div>
        {personalization.zenMode ? (
          <ZenDesktopLayout
            toolbar={
              <>
                <Notice />
                <Feedback />
                <Tooltip title={t("ui.settings")}>
                  <AppIconButton
                    aria-label={t("ui.settings")}
                    intent="quiet"
                    size="small"
                    onClick={() =>
                      navigate(settingsRoute.path.personalization)
                    }
                    icon={<RiSettingsLine color="#fff" size={20} />}
                  />
                </Tooltip>
              </>
            }
            searchProps={{
              onOpenApp: handleOpenSearchApp,
              showShortcutHint: searchPreferences.enableSpotlightShortcut,
              shortcut: searchPreferences.spotlightShortcut,
            }}
          />
        ) : (
          <StandardDesktopLayout
            toolbar={
              <>
                <Notice />
                <Feedback />
              </>
            }
            showSearch={searchPreferences.showDesktopSearchBar}
            searchProps={{
              onOpenApp: handleOpenSearchApp,
              showShortcutHint: searchPreferences.enableSpotlightShortcut,
              shortcut: searchPreferences.spotlightShortcut,
            }}
          >
            <DesktopNext<DesktopItemData>
          key={desktopMountKey}
          ref={desktopRef}
          pages={desktopPages}
          onChange={handleDesktopPagesChange}
          maxPages={userLimit?.maxPages || 5}
          className={
            applicationWallpaper
              ? applicationWallpaperDesktopClassName
              : undefined
          }
          pagingDotsBuilder={
            applicationWallpaper
              ? (dots) => (
                  <div className="application-wallpaper-pagination flex items-center justify-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 backdrop-blur-xl">
                    {dots}
                  </div>
                )
              : undefined
          }
          theme={desktopTheme}
          typeConfigMap={typeConfigMap}
          contextMenuProps={{ showRemoveButton: true }}
          dataTypeMenuConfigMap={dataTypeMenuConfigMap}
          onBeforeRemove={handleBeforeRemove}
          onContextMenuItemClick={handleContextMenuItemClick}
          itemIconBuilder={desktopItemIconBuilder}
          dockProps={{
            className: applicationWallpaper
              ? "application-wallpaper-dock"
              : undefined,
            items: dockItems,
            itemBuilder: createDockHistoryItem,
            fixedItems: [
              {
                id: "*:my",
                type: "app",
                data: {
                  name: isAuthenticated
                    ? t("ui.account")
                    : t("ui.account.localName"),
                },
              },
              {
                id: "*:personalization",
                type: "app",
                data: {
                  name: t("ui.personalization"),
                },
              },
              {
                id: "*:store",
                type: "app",
                data: {
                  name: t("ui.appStore"),
                },
              },
              {
                id: "*:settings",
                type: "app",
                data: {
                  name: t("ui.settings"),
                },
              },
            ],
            fixedItemBuilder: createFixedItemBuilder,
          }}
          onItemClick={(item) => {
            const appLauncherDesktopType = getAppLauncherDesktopType(item);
            const appDesktopType = getAppDesktopType(item);
            const appConfig = item.data?.appConfig;
            const managedAppId = getDesktopItemAppId(item);

            if (managedAppId) {
              const availability = resolveDesktopAppAvailability(managedAppId);
              if (availability.status === "checking") {
                openAvailabilityModal("checking", {
                  name: item.data?.name || appConfig?.name,
                  icon:
                    appConfig?.appIconUrl ??
                    (typeof item.data?.icon === "string"
                      ? item.data.icon
                      : null),
                });
                return;
              }
              if (availability.status === "unavailable") {
                openAvailabilityModal("unavailable", {
                  name: item.data?.name || appConfig?.name,
                  icon:
                    appConfig?.appIconUrl ??
                    (typeof item.data?.icon === "string"
                      ? item.data.icon
                      : null),
                });
                return;
              }
            }

            syncDockItemFromDesktopClick(item);
            if (appLauncherDesktopType && appConfig?.entry) {
              const appId =
                appConfig.id ||
                appLauncherDesktopType.replace("app-launcher:", "");
              void openAppWindow({
                appId,
                appConfig,
                fallbackTitle: item.data?.name || appConfig.name || t("ui.app"),
              });
              return;
            }
            if (appDesktopType) return;
            if (item.type === "app" && item.data?.url) {
              const url = normalizeHttpUrl(item.data.url);
              if (!url) return;
              window.open(url, "_blank", "noopener,noreferrer");
            }
          }}
            />
          </StandardDesktopLayout>
        )}
      <div className="contents" data-wallpaper-interactive>
      <Outlet context={{ onAddStoreItem: handleAddStoreItem }} />
      {availabilityModal && (
        <DesktopNextBaseModal
          visible
          onClose={closeAvailabilityModal}
          width={390}
          destroyOnClose
          theme={desktopTheme}
          styles={{
            panel: {
              background: preferDark ? "#1c1c1e" : "#ffffff",
              border: preferDark
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(60,60,67,0.10)",
              boxShadow: preferDark
                ? "0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "0 24px 60px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
            },
            body: {
              padding: "28px 24px 24px",
            },
          }}
        >
          <div className="flex flex-col items-center text-center text-[#1d1d1f] dark:text-[#f5f5f7]">
            <div className="relative flex h-[78px] w-[78px] items-center justify-center overflow-visible rounded-[var(--sn-radius-panel)] border border-black/5 bg-[#f2f2f7] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_14px_32px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#2c2c2e] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_36px_rgba(0,0,0,0.32)]">
              {availabilityModal.icon ? (
                <div className="relative h-[62px] w-[62px] overflow-hidden rounded-[var(--sn-radius-panel)]">
                  <DesktopImageIcon
                    src={availabilityModal.icon}
                    name={availabilityModal.name || t("ui.app")}
                    objectFit="contain"
                    className={cx(
                      availabilityModal.status === "unavailable"
                        ? "grayscale opacity-[0.65] contrast-[0.9]"
                        : "opacity-[0.85]",
                    )}
                  />
                  <span className="absolute inset-0 bg-white/20 dark:bg-black/20" />
                </div>
              ) : (
                <RiApps2Line
                  size={31}
                  className={
                    availabilityModal.status === "unavailable"
                      ? "text-[#8e8e93] dark:text-[#aeaeb2]"
                      : "text-[#007aff]"
                  }
                />
              )}
            </div>
            <div className="mt-5 max-w-full truncate text-[21px] font-semibold tracking-normal">
              {availabilityModal.name || t("ui.app")}
            </div>
            <div className="mt-2 max-w-[306px] text-sm font-medium leading-6 text-[#6e6e73] dark:text-[#c7c7cc]">
              {t(
                availabilityModal.status === "unavailable"
                  ? "ui.appUnavailableMessage"
                  : "ui.appCheckingMessage",
              )}
            </div>
            <AppButton
              intent="primary"
              size="default"
              onClick={closeAvailabilityModal}
              className="mt-6"
            >
              {t("ui.close")}
            </AppButton>
          </div>
        </DesktopNextBaseModal>
      )}
      {removeAppTarget && (
        <DesktopNextBaseModal
          visible
          onClose={cancelRemoveApp}
          title={t("ui.removeAppTitle", {
            name: removeAppTarget.appName,
          })}
          width={430}
          destroyOnClose
          theme={desktopTheme}
          styles={{
            header: {
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: 0,
            },
            panel: {
              background: preferDark
                ? "rgba(28,28,30,0.94)"
                : "rgba(255,255,255,0.94)",
              border: preferDark
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(255,255,255,0.78)",
              boxShadow: preferDark
                ? "0 28px 70px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "0 28px 70px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.92)",
              backdropFilter: "blur(30px) saturate(1.18)",
            },
            body: { padding: "24px" },
          }}
        >
          <div className="text-[#1d1d1f] dark:text-[#f5f5f7]">
            <div className="flex items-start gap-4">
              <div className="relative flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--sn-radius-panel)] border border-black/5 bg-[#f2f2f7] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_26px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#2c2c2e]">
                {removeAppTarget.icon ? (
                  <DesktopImageIcon
                    src={removeAppTarget.icon}
                    name={removeAppTarget.appName}
                    objectFit="contain"
                  />
                ) : (
                  <RiApps2Line size={28} className="text-[#8e8e93]" />
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="text-[21px] font-semibold leading-[26px] tracking-[-0.012em]">
                  {t("ui.removeAppTitle", {
                    name: removeAppTarget.appName,
                  })}
                </div>
                <div className="mt-1.5 text-[13px] font-medium leading-5 text-[#6e6e73] dark:text-[#c7c7cc]">
                  {t("ui.removeAppDescription")}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[var(--sn-radius-surface)] border border-black/[0.06] bg-black/[0.035] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.06]">
              <AppCheckbox
                checked={deleteAppData}
                disabled={removeAppTarget.storageItemCount === 0}
                onChange={(event) => setDeleteAppData(event.target.checked)}
              >
                <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {t("ui.deleteAppDataTogether")}
                </span>
              </AppCheckbox>
              <div className="mt-1 pl-6 text-xs leading-[18px] text-[#6e6e73] dark:text-[#aeaeb2]">
                {removeAppTarget.storageItemCount > 0
                  ? t("ui.appStorageSummary", {
                      size: formatAppStorageSize(
                        removeAppTarget.storageBytes,
                      ),
                      count: removeAppTarget.storageItemCount,
                    })
                  : t("ui.noAppDataToDelete")}
              </div>
            </div>

            {deleteAppData && removeAppTarget.otherInstanceCount > 0 ? (
              <div className="mt-3 rounded-[var(--sn-radius-surface)] bg-[#ff3b30]/10 px-3.5 py-2.5 text-xs font-medium leading-[18px] text-[#c81e1e] dark:text-[#ff6961]">
                {t("ui.sharedAppDataWarning", {
                  count: removeAppTarget.otherInstanceCount,
                })}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <AppButton
                autoFocus
                size="default"
                onClick={cancelRemoveApp}
              >
                {t("ui.cancel")}
              </AppButton>
              <AppButton
                intent="danger"
                size="default"
                onClick={confirmRemoveApp}
              >
                {t("ui.removeApp")}
              </AppButton>
            </div>
          </div>
        </DesktopNextBaseModal>
      )}
      {fullApp && (
        <PureAppWindow
          visible={true}
          onClose={closeFullApp}
          config={{ entry: fullApp.entry, props: fullApp.props }}
          title={fullApp.title}
          appConfig={fullApp.appConfig}
          width={600}
          height={400}
          createSdk={(mode, sizeId) =>
            fullApp.appId ? buildSDK(fullApp.appId, sizeId, mode) : undefined
          }
        />
      )}
      {infoTarget && (
        <AppInfoModal
          visible={true}
          onClose={closeInfoModal}
          appId={infoTarget.appId}
          appName={infoTarget.appName}
          appConfig={infoTarget.appConfig}
        />
      )}
      <SearchSpotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        onOpenApp={handleOpenSearchApp}
        shortcut={searchPreferences.spotlightShortcut}
      />
      {init && <LoadingOverlay open text={t("ui.loadingConfiguration")} />}
      </div>
      </div>
      {!personalization.zenMode &&
      applicationWallpaper &&
      desktopPages.length > 1 ? (
        <>
          <WallpaperPageEdge
            side="left"
            onCommit={() => {
              const current = desktopRef.current?.currentPage ?? 0;
              desktopRef.current?.setCurrentPage(Math.max(0, current - 1));
            }}
          />
          <WallpaperPageEdge
            side="right"
            onCommit={() => {
              const current = desktopRef.current?.currentPage ?? 0;
              desktopRef.current?.setCurrentPage(
                Math.min(desktopPages.length - 1, current + 1),
              );
            }}
          />
        </>
      ) : null}
      <ScreenSaverOverlay
        active={screenSaverActive}
        covering={screenSaverCovering}
        background={
          applicationWallpaper ? (
            <ApplicationWallpaperBackground
              wallpaper={applicationWallpaper}
              theme={resolvedColorScheme}
              language={language as "zh-CN" | "en-US"}
              onResolved={handleApplicationWallpaperResolved}
              onUnavailable={handleApplicationWallpaperUnavailable}
              onBridgeKeyDown={handleApplicationWallpaperKeyDown}
              onBridgeActivity={recordScreenSaverActivity}
            />
          ) : (
            <div
              className={cx(
                "absolute inset-0 bg-black",
                css`
                  ${desktopBackgroundCss}
                `,
              )}
            />
          )
        }
        language={language}
        wakeLabel={t("ui.screenSaver.wake")}
        onExitComplete={finishScreenSaverExit}
      />
    </div>
  );
}

export default Index;
