import { Desktop, DesktopSortItem, DesktopHandle, DesktopAppItem } from "zs_library";
import { css, cx } from "@emotion/css";
import { useBoolean, useRequest } from "ahooks";
import { useRef, useEffect, useMemo, useState } from "react";
import { RiStore2Line, RiSettingsLine, RiBrushLine, RemixiconComponentType, RiUserLine } from "@remixicon/react";
import type { DesktopItemData } from "../../types";
import Settings from "./components/default-apps/settings";
// import SearchWithAI from "../../components/ai-search";
import { App, Spin } from "antd";
import { getDefaultUserConfig } from "@/services/desktop";
import { DESKTOP_LIST_MODIFIED_STORAGE_KEY, DESKTOP_LIST_STORAGE_KEY } from "@/utils/storage";
import { useAuth } from "@/hooks/useAuth";
import { useConfig } from "@/hooks/useConfig";
import AccountModal from "./components/default-apps/account";
import PureWidget from "@/components/micro-frontend/pure-widget";
import PureWidgetWindow from "@/components/window/pure-widget-window";
import { v4 as uuidv4 } from "uuid";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import { Outlet, useNavigate } from "react-router";

function Index() {
  const desktopRef = useRef<DesktopHandle<DesktopItemData>>(null);

  const { message } = App.useApp();
  const { avatarSrc, coverGradientCss } = useAuth();
  const { userLimit } = useConfig();
  const { activeTheme, personalization } = useDesktopTheme();
  const navigate = useNavigate();

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

  const [settingsOpen, { toggle: toggleSettings }] = useBoolean(false);
  const [accountInfoOpen, { toggle: toggleAccountInfo }] = useBoolean(false);
  const [init, { toggle: toggleInit }] = useBoolean(true);
  const [fullWidget, setFullWidget] = useState<{ entry: string; props?: any; title?: string } | null>(null);

  // userLimit 由 ConfigContext 提供

  const { run: runDefaultDesktop } = useRequest(getDefaultUserConfig, {
    manual: true,
    onSuccess: (res) => {
      const {
        config: { list = [] },
      } = res;

      const isModified = localStorage.getItem(DESKTOP_LIST_MODIFIED_STORAGE_KEY) === "true";
      if (!isModified) {
        desktopRef.current?.state.setList(list);
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
        disabledDrag
        iconSize={56}
        data={{
          id: i.id,
          type: "app",
          data: { name },
        }}
        onClick={onClick}
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
                box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.3);

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
              `
            )}
          >
            <div className="w-full h-full flex items-center justify-center relative" style={{ zIndex: 1 }}>
              <div style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))" }}>
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
            ? () => <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover pointer-events-none" />
            : RiUserLine,
          tintStyle: coverGradientCss ?? "linear-gradient(135deg, rgba(255, 59, 48, 0.92) 0%, rgba(175, 82, 222, 0.9) 100%)",
          onClick: () => toggleAccountInfo(),
        });
      case "*:theme":
        return createFixedItem({
          key: "theme",
          name: "个性化",
          IconComponent: RiBrushLine,
          tintStyle: "linear-gradient(135deg, rgba(88, 86, 214, 0.92) 0%, rgba(10, 132, 255, 0.9) 55%, rgba(255, 45, 85, 0.86) 100%)",
          iconSize: 30,
          onClick: () => navigate("/theme"),
        });
      case "*:store":
        return createFixedItem({
          key: "store",
          name: "应用商店",
          IconComponent: RiStore2Line,
          tintStyle: "linear-gradient(135deg, rgba(10, 132, 255, 0.95) 0%, rgba(90, 200, 250, 0.9) 100%)",
          iconSize: 30,
          onClick: () => navigate("/store"),
        });
      case "*:settings":
        return createFixedItem({
          key: "settings",
          name: "设置",
          IconComponent: RiSettingsLine,
          tintStyle: "linear-gradient(135deg, rgba(242, 242, 247, 0.95) 0%, rgba(199, 199, 204, 0.9) 100%)",
          iconSize: 30,
          iconColor: "#1c1c1e",
          onClick: () => toggleSettings(),
        });
      default:
        return null;
    }
  };

  useEffect(() => {
    runDefaultDesktop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 本地默认：注入一个时钟小组件，便于验证方案
  useEffect(() => {
    const defaultClockItem = {
      id: "widget:clock",
      type: "widget:clock" as const,
      data: {
        name: "时钟",
        widgetConfig: {
          id: "clock",
          name: "时钟",
          // entry:  "/widgets/clock/index.js",
          entry: "http://localhost:3002/src/index.jsx",
          props: { title: "时钟小组件" },
        },
      },
    };

    try {
      const raw = localStorage.getItem(DESKTOP_LIST_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const hasClock =
        Array.isArray(list) &&
        list.length > 0 &&
        Array.isArray(list[0]?.children) &&
        list[0].children.some(
          (child: any) =>
            child?.id === defaultClockItem.id ||
            child?.type === "widget:clock" ||
            child?.data?.widgetConfig?.id === "clock"
        );

      if (!hasClock) {
        // 通过 desktopRef 的 addItem 注入，默认放入第一页根
        desktopRef.current?.state.addItem(defaultClockItem as any, []);
      }
    } catch {
      // 若解析失败，仍尝试通过 addItem 注入，默认放入第一页根
      desktopRef.current?.state.addItem(defaultClockItem as any, []);
    }
  }, []);

  const handleAddWebsite = (site: any) => {
    const name = site?.name;
    const url = site?.url;
    const icon = site?.icon?.url;
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
    const currentPage = desktopRef.current?.state?.currentSliderPage;
    desktopRef.current?.state.addItem(appItem as any, currentPage ? [currentPage?.id] : []);
    message.success("添加成功");
  };

  return (
    <div
      className={cx(
        "w-screen h-screen flex flex-col",
        css`
          ${desktopBackgroundCss}
        `
      )}
    >
      {/* <div className="pt-30 pb-10">
        <SearchWithAI />
      </div> */}
      <div className="h-full pb-8 w-full max-w-7xl mx-auto">
        <Desktop<DesktopItemData>
          ref={desktopRef}
          maxSlides={userLimit?.maxPages || 5}
          theme={activeTheme.theme}
          typeConfigMap={{
            "widget:clock": {
              sizeConfigs: [
                { row: 1, col: 2, name: "2x1", id: "2x1" },
                { row: 2, col: 2, name: "2x2", id: "2x2" },
              ],
              defaultSizeId: "2x1",
              allowShare: false,
              allowInfo: false,
              allowDelete: true,
              allowResize: true,
            },
          }}
          itemIconBuilderAllowNull={(item) => {
            // 纯JS外部小组件渲染（icon模式）
            if (item.type === "widget:clock" && item.data?.widgetConfig?.entry) {
              return (
                <PureWidget
                  config={{
                    entry: item.data.widgetConfig.entry,
                    props: item.data.widgetConfig.props,
                    mode: "icon",
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
      <Settings open={settingsOpen} onClose={toggleSettings} />
      <AccountModal open={accountInfoOpen} onClose={toggleAccountInfo} />
      {fullWidget && (
        <PureWidgetWindow
          visible={true}
          onClose={() => setFullWidget(null)}
          config={{ entry: fullWidget.entry, props: fullWidget.props }}
          title={fullWidget.title}
          width={600}
          height={400}
        />
      )}

      {init && (
        <div className={cx("fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center")}>
          <div className="flex flex-col items-center gap-3">
            <Spin size="large" />
            <div className="text-gray-700 text-sm">正在加载配置…</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
