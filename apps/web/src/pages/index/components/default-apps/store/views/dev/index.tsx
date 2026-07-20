import React, { useState } from "react";
import {
  Empty,
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
import { DefaultAppView, useAppRouteContext } from "@/components";
import { useApp } from "@/hooks/useApp";
import type { DevApp } from "@/contexts/AppContext";
import DevAppModal, { toSizeConfigs } from "./dev-app-modal";
import type { DevAppFormValues } from "./dev-app-modal";
import type { StoreOutletContext } from "../../index";
import { useI18n } from "@/i18n";
import { AppButton, AppIconButton } from "@/components/ui";

const DevView: React.FC = () => {
  const { t } = useI18n();
  const { message } = App.useApp();
  const {
    devApps,
    addDevApp,
    updateDevApp,
    removeDevApp,
  } = useApp();
  const { onAddStoreItem } = useAppRouteContext<StoreOutletContext>();

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<DevApp | null>(null);

  const openAddModal = () => {
    setEditingApp(null);
    setModalOpen(true);
  };

  const openEditModal = (dw: DevApp) => {
    setEditingApp(dw);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingApp(null);
  };

  // 弹窗提交回调
  const handleSubmit = (values: DevAppFormValues, sizeConfigs: ReturnType<typeof toSizeConfigs>) => {
    const defaultSizeId = sizeConfigs[0]?.id || "2x2";

    if (editingApp) {
      updateDevApp(editingApp.id, {
        name: values.name,
        entry: values.entry,
        sizeConfigs,
        defaultSizeId,
      });
      message.success(t("ui.updated"));
    } else {
      const created = addDevApp({
        name: values.name,
        entry: values.entry,
        sizeConfigs,
        defaultSizeId,
      });
      if (!created) {
        message.warning(t("ui.dev.duplicateEntry"));
        return;
      }
      onAddStoreItem?.({ kind: "app", appId: created.id });
      message.success(t("ui.addedToDesktop"));
    }
  };

  const handleRemove = (id: string) => {
    removeDevApp(id);
    message.success(t("ui.removed"));
  };

  return (
    <DefaultAppView
      className="h-full"
      contentClassName="flex flex-col overflow-hidden px-4 pb-8 pt-4"
    >
      <div className="mb-4 flex shrink-0 items-end justify-between gap-3 px-1">
        <div className="text-[28px] font-bold leading-[34px] tracking-normal text-[var(--sn-text)]">
          {t("ui.developer")}
        </div>
        <AppButton
          intent="primary"
          size="default"
          icon={<RiAddLine size={16} />}
          onClick={openAddModal}
        >
          {t("ui.add")}
        </AppButton>
      </div>

      <div className="shrink-0">
        <StoreHeroCard
          title={t("ui.debugCustomApps")}
          description={t("ui.dev.customAppsDescription")}
          tone="dev"
        />
      </div>

      {devApps.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Empty description={t("ui.noCustomApps")} />
        </div>
      ) : (
        <div className="mt-5 grid flex-1 grid-cols-1 gap-3 overflow-y-auto px-1 pr-1">
          {devApps.map((dw) => {
            return (
              <div
                key={dw.id}
                className="rounded-[var(--sn-radius-surface)] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-4 shadow-[var(--sn-shadow)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[var(--sn-radius-control)] bg-[linear-gradient(135deg,#30d158,#00c7be)] text-white">
                    <RiCodeSSlashLine size={22} />
                  </div>
                  <div className="min-w-0 grow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-[14px] font-semibold leading-5 text-[var(--sn-text)]">
                          {dw.name}
                        </div>
                        <div className="mt-1 line-clamp-1 break-all text-[12px] leading-[18px] text-[var(--sn-text-secondary)]">
                          {dw.entry}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <AppIconButton
                          size="small"
                          icon={<RiEditLine size={14} />}
                          aria-label={t("ui.edit")}
                          onClick={() => openEditModal(dw)}
                        />
                        <AppButton
                          intent="primary"
                          size="small"
                          onClick={() =>
                            onAddStoreItem?.({ kind: "app", appId: dw.id })
                          }
                        >
                          {t("ui.addToDesktop")}
                        </AppButton>
                        <Popconfirm
                          title={t("ui.deleteThisApp")}
                          onConfirm={() => handleRemove(dw.id)}
                          okText={t("ui.delete")}
                          cancelText={t("ui.cancel")}
                        >
                          <AppIconButton
                            intent="quiet"
                            danger
                            size="small"
                            icon={<RiDeleteBinLine size={14} />}
                            aria-label={t("ui.delete")}
                          />
                        </Popconfirm>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
                      {dw.sizeConfigs.map((sc) => (
                        <Tag
                          key={sc.id}
                          className="m-0! rounded-[var(--sn-radius-control)]! text-xs!"
                        >
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

      <DevAppModal
        open={modalOpen}
        onClose={closeModal}
        editingApp={editingApp}
        onSubmit={handleSubmit}
      />
    </DefaultAppView>
  );
};

export default DevView;
