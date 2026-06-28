import { DesktopNextBaseModal } from "zs_library";
import { App, Button, Popconfirm, Tag } from "antd";
import { useMemo, useState, type FC } from "react";
import { css } from "@emotion/css";
import type { WidgetConfig } from "@/types";
import { sharedEventBus } from "@/sdk";
import {
  clearWidgetStorage,
  formatWidgetStorageSize,
  getWidgetStorageStats,
} from "@/utils/widget-storage";

interface WidgetInfoModalProps {
  visible: boolean;
  onClose: () => void;
  widgetId: string;
  widgetName?: string;
  widgetConfig?: WidgetConfig;
}

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-3 py-2">
    <div className="text-xs font-semibold text-[#86868b]">{label}</div>
    <div className="min-w-0 break-words text-sm font-medium text-[#1d1d1f]">
      {value || "-"}
    </div>
  </div>
);

const WidgetInfoModal: FC<WidgetInfoModalProps> = ({
  visible,
  onClose,
  widgetId,
  widgetName,
  widgetConfig,
}) => {
  const { message } = App.useApp();
  const [version, setVersion] = useState(0);
  const stats = useMemo(() => getWidgetStorageStats(widgetId), [widgetId, version]);
  const title = widgetName || widgetConfig?.name || "应用";
  const appIconType =
    widgetConfig?.appIcon?.type === "custom" ? "自定义元素" : "图片";

  const handleClear = () => {
    const keys = clearWidgetStorage(widgetId);
    keys.forEach((key) => {
      sharedEventBus.emit("storage:changed", { widgetId, key, value: null });
    });
    sharedEventBus.emit("storage:changed", { widgetId, key: "*", value: null });
    setVersion((value) => value + 1);
    message.success("应用数据已清除");
  };

  return (
    <DesktopNextBaseModal
      visible={visible}
      onClose={onClose}
      width={520}
      destroyOnClose
    >
      <div className={appleWidgetInfoClassName}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-[21px] font-semibold tracking-normal text-[#1d1d1f]">
              {title}
            </div>
            {widgetConfig?.description ? (
              <div className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-[#6e6e73]">
                {widgetConfig.description}
              </div>
            ) : null}
          </div>
          <Tag className="m-0! rounded-full! border-0! bg-[#f2f2f7]! px-3! py-1! text-xs! font-bold! text-[#6e6e73]!">
            应用信息
          </Tag>
        </div>

        <div className="mt-5 rounded-[14px] bg-white/72 px-4 py-2 shadow-[inset_0_0_0_1px_rgba(60,60,67,0.08)]">
          <InfoRow label="应用ID" value={widgetId} />
          <InfoRow label="版本" value={widgetConfig?.version} />
          <InfoRow label="作者" value={widgetConfig?.author} />
          <InfoRow label="来源" value={widgetConfig?.sourceType || "legacy"} />
          <InfoRow label="图标模式" value={appIconType} />
          <InfoRow label="入口" value={widgetConfig?.entry} />
        </div>

        <div className="mt-4 rounded-[14px] bg-white/72 px-4 py-2 shadow-[inset_0_0_0_1px_rgba(60,60,67,0.08)]">
          <InfoRow label="存储占用" value={formatWidgetStorageSize(stats.byteSize)} />
          <InfoRow label="数据项" value={`${stats.keyCount} 项`} />
          <InfoRow label="命名空间" value={stats.key} />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button shape="round" onClick={onClose}>
            关闭
          </Button>
          <Popconfirm
            title="清除应用数据？"
            description="清除后该应用的本地数据将无法恢复。"
            okText="清除"
            cancelText="取消"
            onConfirm={handleClear}
          >
            <Button danger shape="round" disabled={stats.keyCount === 0}>
              清除应用数据
            </Button>
          </Popconfirm>
        </div>
      </div>
    </DesktopNextBaseModal>
  );
};

export default WidgetInfoModal;

const appleWidgetInfoClassName = css`
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(245, 245, 247, 0.84)),
    rgba(245, 245, 247, 0.76);
  padding: 22px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 24px 70px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(28px) saturate(1.18);
`;
