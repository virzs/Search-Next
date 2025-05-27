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
import { useRef, useState } from "react";
import HandleRootGroupModal from "./components/root-group/handle-modal";
import { ContextMenu } from "@radix-ui/themes";
import { message, Modal } from "antd";
import Header from "./components/header";
import { RiStore2Fill } from "@remixicon/react";
import StoreModal from "./components/store/modal";

interface DesktopItemData {
  name: string;
  icon?: string | { iconName: string; iconType: string };
}

function Index() {
  const [modal, contextHolder] = Modal.useModal();

  const desktopRef = useRef<DesktopHandle<DesktopItemData>>(null);

  const [modalOpen, { toggle: toggleModal }] = useBoolean(false);
  const [storeOpen, { toggle: toggleStore }] = useBoolean(false);
  const [currentEditItem, setCurrentEditItem] = useState<
    DesktopSortItem<DesktopItemData> | undefined
  >(undefined);

  const [desktopList, setDesktopList] = useState<
    DesktopSortItem<DesktopItemData>[]
  >([
    {
      id: "123",
      type: "group",
      data: {
        name: "常用",
        icon: "ri-star-line",
      },
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
      data: {
        name: "开发",
        icon: "ri-terminal-line",
      },
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
      data: {
        name: "社交",
        icon: "ri-chat-1-line",
      },
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
      type: "group",
      data: {
        name: "AI",
        icon: "ri-ai-generate-2",
      },
      children: [
        {
          id: 903,
          type: "app",
          data: {
            name: "x90",
          },
        },
      ],
    },
  ]);

  const mouseX = useDockDesktopMouseX(Infinity);

  const handleOpenModal = (editItem?: DesktopSortItem<DesktopItemData>) => {
    setCurrentEditItem(editItem);
    toggleModal();
  };

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

  const handleDeleteGroup = (id: string | number) => {
    modal.confirm({
      title: "删除分类",
      content: "确定要删除该分类吗？此操作不可撤销。",
      onOk: () => {
        desktopRef.current?.state.removeRootItem(id);
        message.success("删除成功");
      },
    });
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="py-24 h-full">
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
          extraItems={() => {
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
              ></DesktopAppItem>
            );
          }}
          itemIconBuilder={(item) => {
            if (item.id === "*:store") {
              return (
                <div
                  className={cx(
                    "flex items-center justify-center w-full h-full rounded-lg",
                    css`
                      background: linear-gradient(
                        135deg,
                        #0066ff 0%,
                        #3399ff 50%,
                        #66b3ff 100%
                      );
                      color: #fff;
                    `
                  )}
                >
                  <RiStore2Fill className="text-xl" />
                </div>
              );
            }
            return null;
          }}
          pagingDotBuilder={(dot, _, isActive) => {
            if (!dot) return <></>;
            return (
              <DockDesktopItem
                mouseX={mouseX}
                title={dot.data?.name}
                onDoubleClick={() => {
                  if (dot.type === "group") {
                    handleOpenModal(dot);
                  }
                }}
              >
                <ContextMenu.Root>
                  <ContextMenu.Trigger>
                    <div>
                      {dot.data?.icon ? (
                        dot.data?.icon instanceof Object ? (
                          <i
                            className={`ri-${dot.data?.icon?.iconName}-${
                              isActive ? "fill" : "line"
                            }`}
                          />
                        ) : (
                          <i className={dot.data?.icon} />
                        )
                      ) : (
                        dot.data?.name
                      )}
                    </div>
                  </ContextMenu.Trigger>
                  <ContextMenu.Content>
                    <ContextMenu.Item
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(dot);
                      }}
                    >
                      <i className="ri-edit-line"></i> 编辑
                    </ContextMenu.Item>
                    {desktopList.length > 1 && (
                      <ContextMenu.Item
                        color="red"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(dot.id);
                        }}
                      >
                        <i className="ri-delete-bin-line"></i> 删除
                      </ContextMenu.Item>
                    )}
                  </ContextMenu.Content>
                </ContextMenu.Root>
              </DockDesktopItem>
            );
          }}
          pagingDotsBuilder={(dots) => {
            return (
              <DockDesktop mouseX={mouseX} as="ul">
                {dots}
                <DockDesktopItem
                  mouseX={mouseX}
                  title="新建分类"
                  componentClassName="cursor-pointer bg-gray-200 rounded-full"
                  onClick={() => handleOpenModal()}
                >
                  <i className="ri-add-line" />
                </DockDesktopItem>
              </DockDesktop>
            );
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
      />
      {contextHolder}
    </div>
  );
}

export default Index;
