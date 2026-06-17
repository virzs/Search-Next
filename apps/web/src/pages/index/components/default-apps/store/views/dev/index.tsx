import React, { useState } from "react";
import {
  Button,
  Empty,
  Space,
  Tag,
  App,
  Popconfirm,
} from "antd";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiCodeSSlashLine,
  RiEditLine,
} from "@remixicon/react";
import StoreHeroCard from "../../components/StoreHeroCard";
import { DefaultAppView } from "@/components";
import { useWidget } from "@/hooks/useWidget";
import type { DevWidget } from "@/contexts/WidgetContext";
import DevWidgetModal, { toSizeConfigs } from "./dev-widget-modal";
import type { DevWidgetFormValues } from "./dev-widget-modal";

const DevView: React.FC = () => {
  const { message } = App.useApp();
  const {
    devWidgets,
    addDevWidget,
    updateDevWidget,
    removeDevWidget,
    addToDesktop,
  } = useWidget();

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DevWidget | null>(null);

  const openAddModal = () => {
    setEditingWidget(null);
    setModalOpen(true);
  };

  const openEditModal = (dw: DevWidget) => {
    setEditingWidget(dw);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingWidget(null);
  };

  // 弹窗提交回调
  const handleSubmit = (values: DevWidgetFormValues, sizeConfigs: ReturnType<typeof toSizeConfigs>) => {
    const defaultSizeId = sizeConfigs[0]?.id || "2x2";

    if (editingWidget) {
      updateDevWidget(editingWidget.id, {
        name: values.name,
        entry: values.entry,
        sizeConfigs,
        defaultSizeId,
      });
      message.success("已更新");
    } else {
      const created = addDevWidget({
        name: values.name,
        entry: values.entry,
        sizeConfigs,
        defaultSizeId,
      });
      if (!created) {
        message.warning("该入口地址已存在，请勿重复添加");
        return;
      }
      addToDesktop(created.id);
      message.success("已添加到桌面");
    }
  };

  const handleRemove = (id: string) => {
    removeDevWidget(id);
    message.success("已移除");
  };

  return (
    <DefaultAppView contentClassName="flex flex-col overflow-hidden px-3 pb-6 pt-4">
      <div className="mb-4 flex shrink-0 items-end justify-between gap-3 px-1">
        <div className="text-[34px] font-extrabold leading-[38px] tracking-normal text-gray-950 dark:text-gray-50">
          开发者
        </div>
        <Button
          type="primary"
          icon={<RiAddLine size={16} />}
          shape="round"
          className="font-bold!"
          onClick={openAddModal}
        >
          添加
        </Button>
      </div>

      <div className="shrink-0">
        <StoreHeroCard
          title="调试自定义小组件"
          description="维护 ESM 入口地址和尺寸配置，用于本地或后端解压入口的小组件调试。"
          tone="dev"
        />
      </div>

      {devWidgets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Empty description="暂无自定义小组件" />
        </div>
      ) : (
        <div className="mt-5 grid flex-1 grid-cols-1 gap-3 overflow-y-auto px-1 pr-1">
          {devWidgets.map((dw) => {
            return (
              <div
                key={dw.id}
                className="rounded-2xl border border-black/[0.08] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_26px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.08]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#30d158,#00c7be)] text-white">
                    <RiCodeSSlashLine size={22} />
                  </div>
                  <div className="min-w-0 grow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="line-clamp-1 font-bold text-gray-950 dark:text-gray-50">
                          {dw.name}
                        </div>
                        <div className="mt-1 line-clamp-1 break-all text-xs font-medium text-gray-500 dark:text-gray-400">
                          {dw.entry}
                        </div>
                      </div>
                      <Space size={4}>
                        <Button
                          className="rounded-full!"
                          icon={<RiEditLine size={14} />}
                          onClick={() => openEditModal(dw)}
                        />
                        <Button
                          type="primary"
                          className="rounded-full!"
                          onClick={() => addToDesktop(dw.id)}
                        >
                          添加到桌面
                        </Button>
                        <Popconfirm
                          title="确定删除该小组件？"
                          onConfirm={() => handleRemove(dw.id)}
                          okText="删除"
                          cancelText="取消"
                        >
                          <Button
                            danger
                            className="rounded-full!"
                            icon={<RiDeleteBinLine size={14} />}
                          />
                        </Popconfirm>
                      </Space>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
                      {dw.sizeConfigs.map((sc) => (
                        <Tag key={sc.id} className="rounded-full! text-xs! m-0!">
                          {sc.name || sc.id}
                        </Tag>
                      ))}
                      <span className="text-gray-400">
                        {new Date(dw.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DevWidgetModal
        open={modalOpen}
        onClose={closeModal}
        editingWidget={editingWidget}
        onSubmit={handleSubmit}
      />
    </DefaultAppView>
  );
};

export default DevView;
