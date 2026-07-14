import { DesktopNextBaseModal } from "zs_library";
import { App, Button, Popconfirm, Tag } from "antd";
import { useState, type FC } from "react";
import { css } from "@emotion/css";
import type { AppConfig } from "@/types";
import { sharedEventBus } from "@/sdk";
import {
  clearAppStorage,
  formatAppStorageSize,
  getAppStorageStats,
} from "@/utils/app-storage";
import { resolveLocalizedText, useI18n } from "@/i18n";

interface AppInfoModalProps {
  visible: boolean;
  onClose: () => void;
  appId: string;
  appName?: string;
  appConfig?: AppConfig;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-3 py-2">
    <div className="text-xs font-semibold text-[#86868b]">{label}</div>
    <div className="min-w-0 break-words text-sm font-medium text-[#1d1d1f]">
      {value || "-"}
    </div>
  </div>
);

const AppInfoModal: FC<AppInfoModalProps> = ({
  visible,
  onClose,
  appId,
  appName,
  appConfig,
}) => {
  const { t, language } = useI18n();
  const { message } = App.useApp();
  const [, setVersion] = useState(0);
  const stats = getAppStorageStats(appId);
  const title =
    resolveLocalizedText(
      appConfig?.displayNameI18n,
      language,
      appName || appConfig?.name,
    ) || t("ui.app");
  const description = resolveLocalizedText(
    appConfig?.descriptionI18n,
    language,
    appConfig?.description,
  );

  const handleClear = () => {
    const keys = clearAppStorage(appId);
    keys.forEach((key) => {
      sharedEventBus.emit("storage:changed", { appId, key, value: null });
    });
    sharedEventBus.emit("storage:changed", { appId, key: "*", value: null });
    setVersion((value) => value + 1);
    message.success(t("ui.appDataCleared"));
  };

  return (
    <DesktopNextBaseModal
      visible={visible}
      onClose={onClose}
      width={520}
      destroyOnClose
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className={appleAppInfoClassName}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-[21px] font-semibold tracking-normal text-[#1d1d1f]">
              {title}
            </div>
            {description ? (
              <div className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-[#6e6e73]">
                {description}
              </div>
            ) : null}
          </div>
          <Tag className="m-0! rounded-full! border-0! bg-[#f2f2f7]! px-3! py-1! text-xs! font-bold! text-[#6e6e73]!">
            {t("ui.appInfo")}
          </Tag>
        </div>

        <div className="mt-5 rounded-[14px] bg-white/72 px-4 py-2 shadow-[inset_0_0_0_1px_rgba(60,60,67,0.08)]">
          <InfoRow label={t("ui.appID")} value={appId} />
          <InfoRow label={t("ui.version")} value={appConfig?.version} />
          <InfoRow label={t("ui.author")} value={appConfig?.author} />
        </div>

        <div className="mt-4 rounded-[14px] bg-white/72 px-4 py-2 shadow-[inset_0_0_0_1px_rgba(60,60,67,0.08)]">
          <InfoRow
            label={t("ui.storageUsed")}
            value={formatAppStorageSize(stats.byteSize)}
          />
          <InfoRow
            label={t("ui.dataItems")}
            value={t("ui.countItems", { count: stats.keyCount })}
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button shape="round" onClick={onClose}>
            {t("ui.close")}
          </Button>
          <Popconfirm
            title={t("ui.clearAppData")}
            description={t("ui.app.clearDataWarning")}
            okText={t("ui.clear")}
            cancelText={t("ui.cancel")}
            onConfirm={handleClear}
          >
            <Button danger shape="round" disabled={stats.keyCount === 0}>
              {t("ui.clearAppData2")}
            </Button>
          </Popconfirm>
        </div>
      </div>
    </DesktopNextBaseModal>
  );
};

export default AppInfoModal;

const appleAppInfoClassName = css`
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 18px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.88),
      rgba(245, 245, 247, 0.84)
    ),
    rgba(245, 245, 247, 0.76);
  padding: 22px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 24px 70px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(28px) saturate(1.18);
`;
