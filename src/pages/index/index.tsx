import {
  Desktop,
  DesktopSortItem,
  DesktopHandle,
  DesktopAppItem,
  desktopThemeDark,
  desktopThemeLight,
} from "zs_library";
import type { DesktopTypeConfigMap } from "zs_library";
import { css, cx } from "@emotion/css";
import { useBoolean, useRequest } from "ahooks";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
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

type DesktopItem = DesktopSortItem<DesktopItemData>;

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
  if (typeof item.dataType === "string" && item.dataType.startsWith("widget:")) {
    return item.dataType;
  }
  return null;
};

const normalizeWidgetDesktopItem = (item: DesktopStorageItem): DesktopStorageItem => {
  const widgetType = getWidgetDesktopType(item);
  return {
    ...item,
    type: widgetType ?? item.type,
    children: item.children?.map(normalizeWidgetDesktopItem),
  };
};

const normalizeWidgetDesktopList = (list: DesktopRootItem[]) =>
  list.map((root) => ({
    ...root,
    children: root.children?.map(normalizeWidgetDesktopItem),
  }));

const migrateStoredWidgetDesktopList = () => {
  const raw = localStorage.getItem(DESKTOP_LIST_STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const normalized = normalizeWidgetDesktopList(parsed as DesktopRootItem[]);
    const nextRaw = JSON.stringify(normalized);
    if (nextRaw !== raw) localStorage.setItem(DESKTOP_LIST_STORAGE_KEY, nextRaw);
  } catch (error) {
    console.warn("Failed to migrate desktop widget list", error);
  }
};

function Index() {
  useState(migrateStoredWidgetDesktopList);

  const desktopRef = useRef<DesktopHandle<DesktopItemData>>(null);
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
      (preferDark ? desktopThemeDark : desktopThemeLight)
    );
  }, [activeThemeId, preferDark, themeConfigs]);

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
  const typeConfigMap = useMemo((): DesktopTypeConfigMap => {
    const map: DesktopTypeConfigMap = {};
    const applyConfig = (key: string, config: DesktopTypeConfigMap[string]) => {
      map[key] = config;
    };

    for (const w of widgets) {
      const hasSettings = (w.settingsSchema?.length ?? 0) > 0;
      const config = {
        sizeConfigs: w.sizeConfigs?.length
          ? w.sizeConfigs
          : [{ row: 2, col: 2, name: "2x2", id: "2x2" }],
        defaultSizeId: w.defaultSizeId || w.sizeConfigs?.[0]?.id || "2x2",
        allowShare: false,
        allowInfo: hasSettings,
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
        desktopRef.current?.state.setList(
          normalizeWidgetDesktopList(list as DesktopRootItem[]),
        );
      }
      if (init) toggleInit();
    },
  });

  // 封装固定项构建器
  const createFixedItemBuilder = (i: DesktopSortItem) => {
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
      IconComponent: RemixiconComponentType;
      tintStyle?: string;
      iconSize?: number;
      iconColor?: string;
      onClick?: () => void;
    }) => (
      <DesktopAppItem
        key={key}
        onClick={onClick}
        disabledDrag
        iconSize={56}
        data={{
          id: i.id,
          type: "app",
          data: { name },
        }}
        itemIndex={-1}
        noLetters
        contextMenuProps={false}
        icon={
          <div
            className={cx(
              "flex items-center justify-center w-full h-full rounded-[16px] overflow-hidden",
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
            <div
              className="w-full h-full flex items-center justify-center relative"
              style={{ zIndex: 1 }}
            >
              <div
                style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))" }}
              >
                <IconComponent size={iconSize ?? 30} />
              </div>
            </div>
          </div>
        }
      />
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
          onClick: () => navigate(themeRoute.path.root),
        });
      case "*:store":
        return createFixedItem({
          key: "store",
          name: "应用商店",
          IconComponent: RiStore2Line,
          tintStyle:
            "linear-gradient(135deg, rgba(10, 132, 255, 0.95) 0%, rgba(90, 200, 250, 0.9) 100%)",
          iconSize: 30,
          onClick: () => navigate(storeRoute.path.root),
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
          onClick: () => navigate(settingsRoute.path.root),
        });
      default:
        return null;
    }
  };

  useEffect(() => {
    runDefaultDesktop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 注册 desktopRef 到 WidgetContext，使 addToDesktop 可直接操控桌面
  useEffect(() => {
    registerDesktopRef(desktopRef);
  }, [registerDesktopRef]);

  const addItemToCurrentPage = useCallback((item: DesktopItem) => {
    const currentPage = desktopRef.current?.state.currentSliderPage;
    desktopRef.current?.state.addItem(
      item,
      currentPage ? [currentPage.id] : [],
    );
  }, []);

  const handleAddWebsite = (site: any) => {
    const name = site?.name;
    const url = site?.url;
    const icon = site?.iconEdited?.url ?? site?.icon?.url;
    if (!url) return;
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
      <div className="h-full pb-8 w-full max-w-7xl mx-auto">
        <Desktop<DesktopItemData>
          ref={desktopRef}
          maxSlides={userLimit?.maxPages || 5}
          theme={desktopTheme}
          typeConfigMap={typeConfigMap}
          contextMenu={(item) => {
            const widgetDesktopType = getWidgetDesktopType(item);
            if (!widgetDesktopType) return false;

            const schema = item.data?.widgetConfig?.settingsSchema;
            const hasSettings = Array.isArray(schema) && schema.length > 0;

            return {
              showInfoButton: hasSettings,
              showRemoveButton: true,
              onInfoClick: () => {
                if (!hasSettings) return;
                const widgetId =
                  item.data?.widgetConfig?.id ||
                  widgetDesktopType.replace("widget:", "");
                setSettingsTarget({
                  widgetId,
                  widgetName:
                    item.data?.widgetConfig?.name ||
                    item.data?.name ||
                    "小组件",
                  settingsSchema: schema,
                });
              },
            };
          }}
          itemIconBuilderAllowNull={(item) => {
            const widgetDesktopType = getWidgetDesktopType(item);
            // 动态匹配所有 widget: 前缀的桌面项，渲染对应小组件（icon 模式）
            if (
              widgetDesktopType &&
              item.data?.widgetConfig?.entry
            ) {
              const widgetId =
                item.data.widgetConfig.id || widgetDesktopType.replace("widget:", "");
              const sdk = buildSDK(widgetId, "icon", "icon");
              return (
                <PureWidget
                  config={{
                    entry: item.data.widgetConfig.entry,
                    props: item.data.widgetConfig.props,
                    mode: "icon",
                    sdk,
                  }}
                  className={css`
                    width: 100%;
                    height: 100%;
                  `}
                  onClick={() =>
                    setFullWidget({
                      entry: item.data!.widgetConfig!.entry,
                      props: item.data!.widgetConfig!.props,
                      title: item.data?.name || "小组件",
                      widgetId,
                    })
                  }
                />
              );
            }

            return null;
          }}
          dock={{
            enabled: true,
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
          storageKey={DESKTOP_LIST_STORAGE_KEY}
          onChange={(list) => {
            if (!list.length) return;
            if (init) return;
            if (Date.now() < ignoreDesktopChangeUntilRef.current) return;
            localStorage.setItem(DESKTOP_LIST_MODIFIED_STORAGE_KEY, "true");
          }}
          onItemClick={(item) => {
            if (item.type === "app" && item.data?.url) {
              // 点击应用时，打开应用链接
              window.open(item.data.url, "_blank");
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
