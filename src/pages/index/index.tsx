import { Desktop, DesktopSortItem, desktopThemeLight, DesktopHandle, DesktopAppItem } from "zs_library";
import { css, cx } from "@emotion/css";
import { useBoolean, useRequest } from "ahooks";
import { useRef, useEffect } from "react";
import { RiStore2Fill, RiSettingsFill, RiBrush2Fill, RemixiconComponentType, RiUserFill } from "@remixicon/react";
import StoreModal from "./components/default-apps/store";
import type { DesktopItemData } from "../../types";
import Settings from "./components/default-apps/settings";
// import SearchWithAI from "../../components/ai-search";
import { Spin } from "antd";
import { getDefaultUserConfig } from "@/services/desktop";
import { DESKTOP_LIST_MODIFIED_STORAGE_KEY, DESKTOP_LIST_STORAGE_KEY } from "@/utils/storage";

function Index() {
  const desktopRef = useRef<DesktopHandle<DesktopItemData>>(null);

  const [storeOpen, { toggle: toggleStore }] = useBoolean(false);
  const [settingsOpen, { toggle: toggleSettings }] = useBoolean(false);
  const [init, { toggle: toggleInit }] = useBoolean(true);

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
      backgroundStyle,
      iconSize,
      onClick,
    }: {
      key: string;
      name: string;
      IconComponent: RemixiconComponentType;
      backgroundStyle: string;
      iconSize?: number;
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
              "flex items-center justify-center w-full h-full rounded-lg",
              css`
                ${backgroundStyle}
                color: #fff;
              `
            )}
          >
            <IconComponent size={iconSize} />
          </div>
        }
      />
    );

    switch (i.id) {
      case "*:my":
        return createFixedItem({
          key: "my",
          name: "账号",
          IconComponent: RiUserFill,
          backgroundStyle: "background: linear-gradient(135deg, #ff6b6b 0%, #f06595 100%);",
        });
      case "*:theme":
        return createFixedItem({
          key: "theme",
          name: "主题",
          IconComponent: RiBrush2Fill,
          backgroundStyle: `background: conic-gradient(from 0deg at center,
            #ff0000 0deg, #ff8000 60deg, #ffff00 120deg,
            #80ff00 180deg, #00ff80 240deg, #0080ff 300deg, #ff0000 360deg);`,
          iconSize: 28,
        });
      case "*:store":
        return createFixedItem({
          key: "store",
          name: "应用商店",
          IconComponent: RiStore2Fill,
          backgroundStyle: "background: linear-gradient(135deg, #0066ff 0%, #3399ff 50%, #66b3ff 100%);",
          onClick: () => toggleStore(),
        });
      case "*:settings":
        return createFixedItem({
          key: "settings",
          name: "设置",
          IconComponent: RiSettingsFill,
          backgroundStyle: "background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);",
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

  return (
    <div
      className={cx(
        "w-screen h-screen flex flex-col",
        css`
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        `
      )}
    >
      {/* <div className="pt-30 pb-10">
        <SearchWithAI />
      </div> */}
      <div className="h-full pb-8">
        <Desktop<DesktopItemData>
          ref={desktopRef}
          className={cx(
            "h-full max-w-5xl mx-auto",
            css`
              .slick-list,
              .slick-track {
                height: 100%;
              }
              .slick-dots {
                max-width: var(--container-5xl);
                display: flex;
                justify-content: center;
                align-items: flex-end;
                background-color: transparent;
                li {
                  width: auto;
                  height: auto;
                  display: block;
                }
                .slick-active > div {
                  transition: all 0.2s ease;
                  background-color: #294167;
                  color: white;
                }
              }
            `
          )}
          theme={desktopThemeLight}
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
                  name: "主题",
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
      <StoreModal
        open={storeOpen}
        onClose={() => {
          toggleStore();
        }}
      />
      <Settings open={settingsOpen} onClose={toggleSettings} />

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
