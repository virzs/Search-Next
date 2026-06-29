import { useEffect, useMemo, useState } from "react";
import { RiArrowLeftSLine, RiSettings3Line } from "@remixicon/react";
import { DesktopNextBaseModal } from "zs_library";
import PureWidget, { PureWidgetConfig } from "../micro-frontend/pure-widget";
import type { WidgetMode, WidgetSDK } from "@/sdk";
import type { WidgetConfig } from "@/types";

interface PureWidgetWindowProps {
  config: PureWidgetConfig;
  visible: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
  height?: number | string;
  widgetConfig?: WidgetConfig;
  /** 小组件 SDK 实例 */
  sdk?: WidgetSDK;
  createSdk?: (mode: WidgetMode, sizeId: string) => WidgetSDK | undefined;
}

const PureWidgetWindow: React.FC<PureWidgetWindowProps> = ({
  config,
  visible,
  onClose,
  title,
  width = 600,
  height = 400,
  widgetConfig,
  sdk,
  createSdk,
}) => {
  const [viewMode, setViewMode] = useState<"full" | "settings">("full");

  useEffect(() => {
    if (visible) setViewMode("full");
  }, [config.entry, visible]);

  const settingsRoutePath = widgetConfig?.pagePaths?.settings;
  const hasSettings = Boolean(widgetConfig?.id && settingsRoutePath);
  const widgetTitle = title || widgetConfig?.name || "小组件";
  const contentHeight = typeof height === "number" ? height : undefined;
  const windowHeight = typeof height === "number" ? height + 46 : height;
  const currentSdk = useMemo(() => {
    if (!createSdk) return viewMode === "full" ? sdk : undefined;
    return createSdk(viewMode, viewMode === "settings" ? "settings" : "full");
  }, [createSdk, sdk, viewMode]);

  const fullConfig = useMemo(
    () => ({
      ...config,
      props: {
        ...(config.props ?? {}),
        title: widgetTitle,
      },
      mode: "full" as WidgetMode,
      ...(currentSdk ? { sdk: currentSdk } : {}),
    }),
    [config, currentSdk, widgetTitle],
  );

  const settingsConfig = useMemo(
    () => ({
      ...config,
      props: {
        ...(config.props ?? {}),
        title: widgetTitle,
        pagePath: settingsRoutePath,
      },
      mode: "settings" as WidgetMode,
      ...(currentSdk ? { sdk: currentSdk } : {}),
    }),
    [config, currentSdk, settingsRoutePath, widgetTitle],
  );

  return (
    <DesktopNextBaseModal
      visible={visible}
      onClose={onClose}
      width={typeof width === "number" ? width : undefined}
      destroyOnClose
    >
      <div
        className="flex w-full flex-col overflow-hidden rounded-[18px] bg-white/95 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)] backdrop-blur-xl"
        style={{ height: windowHeight }}
      >
        <div className="grid h-[46px] flex-none grid-cols-[92px_1fr_92px] items-center border-b border-black/5 bg-white/90 px-3">
          <div className="flex items-center justify-start">
            {viewMode === "settings" && (
              <button
                type="button"
                onClick={() => setViewMode("full")}
                className="inline-flex h-8 cursor-pointer items-center gap-0.5 rounded-full border-0 bg-transparent px-2 text-[13px] font-medium text-[#007aff] hover:bg-[#f2f2f7]"
              >
                <RiArrowLeftSLine size={18} />
                返回
              </button>
            )}
          </div>
          <div className="min-w-0 truncate text-center text-[13px] font-semibold text-[#424245]">
            {viewMode === "settings" ? `${widgetTitle} 设置` : widgetTitle}
          </div>
          <div className="flex items-center justify-end">
            {viewMode === "full" && hasSettings && (
              <button
                type="button"
                aria-label="打开设置"
                title="设置"
                onClick={() => setViewMode("settings")}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-[#f5f5f7] text-[#1d1d1f] shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition hover:bg-white"
              >
                <RiSettings3Line size={17} />
              </button>
            )}
          </div>
        </div>
        <div
          className="min-h-0 flex-1 overflow-hidden"
          style={contentHeight ? { height: contentHeight } : undefined}
        >
          {viewMode === "full" ? (
            <PureWidget config={fullConfig} className="h-full w-full" />
          ) : settingsRoutePath ? (
            <PureWidget config={settingsConfig} className="h-full w-full" />
          ) : null}
        </div>
      </div>
    </DesktopNextBaseModal>
  );
};

export default PureWidgetWindow;
