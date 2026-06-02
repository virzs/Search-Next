import React, { useState } from "react";
import {
  Button,
  Card,
  Empty,
  Space,
  Tag,
  Typography,
  App,
  Popconfirm,
  Alert,
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

const { Title } = Typography;

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
    <DefaultAppView contentClassName="flex flex-col overflow-hidden pt-5 px-1 pb-4">
      {/* 顶部 Hero 卡片 */}
      <div className="shrink-0">
        <StoreHeroCard
          subtitle="开发者"
          title="自定义小组件测试"
          description="推荐将 apps/widgets/<name> 打包为 .snwidget 上传后台；这里仅保留远程入口调试。"
          gradient="bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600"
          circlePosition="right"
        />
      </div>

      {/* 标题栏 + 添加按钮 */}
      <div className="mt-5 shrink-0 px-1">
        <Alert
          type="info"
          showIcon
          className="mb-3"
          message="本地 public/widgets 已废弃"
          description="请在 apps/widgets/<name> 编写源码，执行 pnpm widget:pack <name> 生成 .snwidget 后到后台导入，线上从后端 /static/widgets/... 地址加载。"
        />
        <div className="flex items-center justify-between mb-3">
          <Title level={5} className="mb-0!">
            自定义小组件
          </Title>
          <Space size={8}>
            <Button
              type="primary"
              icon={<RiAddLine size={16} />}
              className="rounded-full!"
              onClick={openAddModal}
            >
              添加
            </Button>
          </Space>
        </div>
      </div>

      {/* 空状态 */}
      {devWidgets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Empty description="暂无自定义小组件。建议通过后台导入 .snwidget；这里可手动填写后端解压后的 entryUrl 调试。" />
        </div>
      ) : (
        // 小组件列表（可滚动区域）
        <div className="grid gap-3 grid-cols-1 overflow-y-auto pr-1 flex-1 px-1">
          {devWidgets.map((dw) => {
            return (
              <Card
                key={dw.id}
                className="rounded-2xl! overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-xl bg-emerald-500/10 p-2 w-10 h-10 flex items-center justify-center">
                    <RiCodeSSlashLine className="text-emerald-600 dark:text-emerald-400" size={20} />
                  </div>
                  <div className="min-w-0 grow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-100 line-clamp-1">
                          {dw.name}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1 break-all">
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
                      <Tag className="rounded-full! text-xs! m-0!" color="green">
                        开发者
                      </Tag>
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
              </Card>
            );
          })}
        </div>
      )}

      {/* 添加/编辑弹窗 */}
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
