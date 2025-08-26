import {
  Desktop,
  DesktopSortItem,
  desktopThemeLight,
  DockDesktop,
  DockDesktopItem,
  useDockDesktopMouseX,
  DesktopHandle,
  DesktopAppItem,
} from "zs_library";
import { css, cx } from "@emotion/css";
import { useBoolean } from "ahooks";
import { useRef, useState, useMemo, useCallback } from "react";
import HandleRootGroupModal from "./components/root-group/handle-modal";
import { ContextMenu } from "@radix-ui/themes";
import { message, Modal } from "antd";
import Header from "./components/header";
import { RiStore2Fill, RiApps2Line } from "@remixicon/react";
import StoreModal from "./components/store/modal";
import WidgetWindow from "../../components/window";
import WidgetIcon from "../../components/micro-frontend/widget-icon";
import InternalWidget from "../../components/micro-frontend/internal-widget";
import { WIDGET_CONFIGS, MicroAppConfig } from "../../services/micro-frontend";
import type { DesktopItemData } from "../../types";

function Index() {
  const [modal, contextHolder] = Modal.useModal();

  const desktopRef = useRef<DesktopHandle<DesktopItemData>>(null);

  const [modalOpen, { toggle: toggleModal }] = useBoolean(false);
  const [storeOpen, { toggle: toggleStore }] = useBoolean(false);
  const [currentEditItem, setCurrentEditItem] = useState<DesktopSortItem<DesktopItemData> | undefined>(undefined);
  // 小组件窗口管理
  const [openWidgets, setOpenWidgets] = useState<Set<string>>(new Set());

  const [desktopList, setDesktopList] = useState<DesktopSortItem<DesktopItemData>[]>([
    {
      id: "123",
      type: "group",
      children: [
        {
          id: 1,
          type: "group",
          data: {
            name: "one",
          },
          config: {
            col: 2,
          },
          children:
            // 生成20个子项
            Array(60)
              .fill(0)
              .map((_, index) => ({
                id: "sdanka" + 1 + index,
                type: "app",
                data: {
                  name: `one-${index}`,
                },
              })),
        },
        {
          id: 2,
          type: "app",
          data: {
            name: "two",
          },
        }, // 添加一个小组件示例
        {
          id: "widget-demo-clock",
          type: "app",
          data: {
            name: "时钟小组件",
            widgetConfig: {
              id: "clock",
              name: "时钟",
              entry: "//localhost:3002",
              props: {
                title: "时钟小组件",
              },
            },
          },
        },
        // 添加测试小组件示例
        {
          id: "widget-demo-test",
          type: "app",
          data: {
            name: "测试小组件",
            widgetConfig: {
              id: "test",
              name: "测试小组件",
              entry: "internal",
              props: {
                title: "测试小组件",
                supportIconMode: true,
              },
            },
          },
        },
        {
          id: 3,
          type: "app",
          data: {
            name: "three",
          },
        },
        {
          id: 4,
          type: "app",
          data: {
            name: "four",
          },
        },
        {
          id: 5,
          type: "app",
          data: {
            name: "five",
          },
        },
        {
          id: 6,
          type: "app",
          data: {
            name: "six",
          },
        },
        {
          id: 7,
          type: "app",
          data: {
            name: "x",
          },
        },
      ],
    },
    {
      id: "12313eqw",
      type: "group",
      children: [
        {
          id: 90,
          type: "app",
          data: {
            name: "x90",
          },
        },
      ],
    },
    {
      id: "12313eqw1",
      type: "group",
      children: [
        {
          id: 902,
          type: "app",
          data: {
            name: "x90",
          },
        },
      ],
    },
    {
      id: "12313eqws",
      type: "dock",
      children: [
        {
          id: 903,
          type: "app",
          data: {
            name: "x90",
            icon: "https://placehold.co/100x100/FC3D39/FFFFFF?text=Calendar",
          },
        },
      ],
    },
  ]);

  const handleCloseModal = () => {
    setCurrentEditItem(undefined);
    toggleModal();
  };

  const handleSubmitModal = (values: { name: string; icon: string }) => {
    if (currentEditItem) {
      desktopRef.current?.state.updateRootItem(currentEditItem.id, {
        ...currentEditItem,
        data: {
          ...currentEditItem.data,
          ...values,
        },
      });
    } else {
      desktopRef.current?.state.addRootItem({
        id: "new-item-" + Date.now(),
        type: "group",
        data: values,
        children: [],
      });
    }
    handleCloseModal();
  };

  // 小组件窗口管理函数
  const handleOpenWidget = (widgetId: string) => {
    setOpenWidgets((prev) => new Set([...prev, widgetId]));
  };

  const handleCloseWidget = (widgetId: string) => {
    setOpenWidgets((prev) => {
      const next = new Set(prev);
      next.delete(widgetId);
      return next;
    });
  };

  // 处理应用项双击事件
  const handleItemDoubleClick = (item: DesktopSortItem<DesktopItemData>) => {
    // 如果是小组件类型
    if (item.data?.widgetConfig) {
      handleOpenWidget(item.data.widgetConfig.id);
    }
    // 如果是普通应用且有URL
    else if (item.type === "app" && item.data?.url) {
      window.open(item.data.url, "_blank");
    }
  };

  // 添加小组件到桌面
  const handleAddWidgetToDesktop = (widgetId: string) => {
    const widgetConfig = WIDGET_CONFIGS[widgetId];
    if (!widgetConfig) return;

    // 找到第一个分组添加小组件
    const firstGroup = desktopList[0];
    if (firstGroup?.type === "group") {
      const newWidget = {
        id: `widget-${widgetId}-${Date.now()}`,
        type: "app" as const, // 由于类型限制，我们使用 app 类型，但通过 data.widgetConfig 来标识为小组件
        data: {
          name: (widgetConfig.props?.title as string) || widgetConfig.name,
          widgetConfig: {
            id: widgetId,
            name: widgetConfig.name,
            entry: widgetConfig.entry,
            props: widgetConfig.props,
          },
        },
      };

      desktopRef.current?.state.updateRootItem(firstGroup.id, {
        ...firstGroup,
        children: [...(firstGroup.children || []), newWidget],
      });

      message.success(`${widgetConfig.name} 已添加到桌面`);
    }
  };

  // 预计算所有小组件配置，避免在渲染过程中修改缓存
  const precomputedConfigs = useMemo(() => {
    const configs = new Map<string, MicroAppConfig>();

    const computeConfigs = (items: DesktopSortItem<DesktopItemData>[]) => {
      items.forEach((item) => {
        if (item.type === "group" && item.children) {
          computeConfigs(item.children);
        } else if (item.data?.widgetConfig) {
          const cacheKey = `${item.id}-${item.data.widgetConfig.id}`;
          const widgetConfig = WIDGET_CONFIGS[item.data.widgetConfig.id];
          if (widgetConfig) {
            const fullConfig = {
              ...widgetConfig,
              container: `#widget-icon-${item.id}`,
            };
            configs.set(cacheKey, fullConfig);
          }
        }
      });
    };

    computeConfigs(desktopList);
    return configs;
  }, [desktopList]);

  // 获取缓存的小组件配置
  const getCachedWidgetConfig = useCallback(
    (item: DesktopSortItem<DesktopItemData>) => {
      const cacheKey = `${item.id}-${item.data?.widgetConfig?.id}`;
      return precomputedConfigs.get(cacheKey) || null;
    },
    [precomputedConfigs]
  );

  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="h-full">
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
          list={desktopList}
          onChange={setDesktopList}
          theme={desktopThemeLight}
          dock={{
            enabled: true,
            fixedItems: [
              {
                id: "*:store",
                data: {
                  name: "应用商店",
                },
              },
            ],
            fixedItemBuilder: (i) => {
              switch (i.id) {
                case "*:store":
                  return (
                    <DesktopAppItem
                      key="store"
                      disabledDrag
                      data={{
                        id: "*:store",
                        type: "app",
                        data: {
                          name: "应用商店",
                        },
                        config: {
                          allowResize: false,
                        },
                      }}
                      onClick={() => {
                        toggleStore();
                      }}
                      itemIndex={-1}
                      noLetters
                    ></DesktopAppItem>
                  );
                default:
                  return null;
              }
            },
          }}
          itemIconBuilder={(item) => {
            if (item.id === "*:store") {
              return (
                <div
                  className={cx(
                    "flex items-center justify-center w-full h-full rounded-lg",
                    css`
                      background: linear-gradient(135deg, #0066ff 0%, #3399ff 50%, #66b3ff 100%);
                      color: #fff;
                    `
                  )}
                >
                  <RiStore2Fill className="text-xl" />
                </div>
              );
            } // 处理小组件类型 - 通过 data.widgetConfig 来判断
            if (item.data?.widgetConfig) {
              const widgetConfig = WIDGET_CONFIGS[item.data.widgetConfig.id];
              if (widgetConfig) {
                // 如果是内部组件
                if (widgetConfig.entry === "internal") {
                  return (
                    <div className="w-full h-full cursor-pointer" onDoubleClick={() => handleItemDoubleClick(item)}>
                      <InternalWidget widgetId={item.data.widgetConfig.id} mode="icon" className="w-full h-full" />
                    </div>
                  );
                }
                // 如果支持图标模式，使用 WidgetIcon 和缓存的配置
                if (widgetConfig.props?.supportIconMode) {
                  const cachedConfig = getCachedWidgetConfig(item);

                  if (cachedConfig) {
                    return (
                      <WidgetIcon
                        config={cachedConfig}
                        className="w-full h-full cursor-pointer"
                        onDoubleClick={() => handleItemDoubleClick(item)}
                        fallbackIcon={<RiApps2Line className="text-xl" />}
                      />
                    );
                  }
                }

                // 默认显示固定图标
                return (
                  <div
                    className={cx(
                      "flex items-center justify-center w-full h-full rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm cursor-pointer"
                    )}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    <RiApps2Line className="text-xl" />
                  </div>
                );
              }
            }

            return null;
          }}
          enableCaching={false}
        />
      </div>
      <HandleRootGroupModal
        open={modalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmitModal}
        editItem={currentEditItem}
      />
      <StoreModal
        open={storeOpen}
        onClose={() => {
          toggleStore();
        }}
        onAddWidget={handleAddWidgetToDesktop}
      />
      {contextHolder}
      {/* 渲染小组件窗口 */}
      {[...openWidgets].map((widgetId) => {
        const widgetConfig = WIDGET_CONFIGS[widgetId];
        if (!widgetConfig) return null;

        const fullConfig = {
          ...widgetConfig,
          container: `#widget-${widgetId}`, // 添加默认容器
        };
        return (
          <WidgetWindow
            key={widgetId}
            visible={true}
            config={fullConfig}
            widgetId={widgetId}
            onClose={() => handleCloseWidget(widgetId)}
          />
        );
      })}
    </div>
  );
}

export default Index;
