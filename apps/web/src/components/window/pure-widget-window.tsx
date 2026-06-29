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
  const [widgetBackVisible, setWidgetBackVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setViewMode("full");
      setWidgetBackVisible(false);
    }
  }, [config.entry, visible]);

  const settingsRoutePath = widgetConfig?.pagePaths?.settings;
  const widgetTitle = title || widgetConfig?.name || "小组件";
  const isPipeLinkWidget = [
    widgetTitle,
    widgetConfig?.name,
    widgetConfig?.entry,
    config.entry,
  ]
    .filter(Boolean)
    .some(
      (value) =>
        String(value).includes("pipe-link") ||
        String(value).includes("管道连线"),
    );
  const hasSettings = Boolean(
    widgetConfig?.id && settingsRoutePath && !isPipeLinkWidget,
  );
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

  useEffect(() => {
    if (
      !visible ||
      !isPipeLinkWidget ||
      viewMode !== "full" ||
      !currentSdk?.events
    ) {
      setWidgetBackVisible(false);
      return undefined;
    }

    const handler = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;
      const data = payload as { widgetId?: string; backVisible?: unknown };
      if (data.widgetId && data.widgetId !== currentSdk.widgetId) return;
      if (typeof data.backVisible === "boolean") {
        setWidgetBackVisible(data.backVisible);
      }
    };

    currentSdk.events.on("widget:chrome", handler);
    return () => currentSdk.events.off("widget:chrome", handler);
  }, [currentSdk, isPipeLinkWidget, viewMode, visible]);

  const showBackButton =
    viewMode === "settings" || (isPipeLinkWidget && widgetBackVisible);
  const handleHeaderBack = () => {
    if (viewMode === "settings") {
      setViewMode("full");
      return;
    }
    currentSdk?.events.emit("widget:title-back", {
      widgetId: currentSdk.widgetId,
    });
  };

  return (
    <DesktopNextBaseModal
      visible={visible}
      onClose={onClose}
      width={typeof width === "number" ? width : undefined}
      destroyOnClose
      styles={{
        body: { padding: 0 },
      }}
    >
      <div
        className="flex w-full flex-col overflow-hidden bg-white/95 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)] backdrop-blur-xl dark:bg-[#1c1c1e]/95 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        style={{ height: windowHeight }}
      >
        <div className="grid h-[42px] flex-none grid-cols-[92px_1fr_92px] items-center border-b border-black/5 bg-white/90 px-2 dark:border-white/10 dark:bg-[#1c1c1e]/90">
          <div className="flex items-center justify-start">
            {showBackButton && (
              <button
                type="button"
                onClick={handleHeaderBack}
                className="inline-flex h-8 cursor-pointer items-center gap-0.5 rounded-full border-0 bg-transparent px-2 text-[13px] font-medium text-[#007aff] hover:bg-[#f2f2f7] dark:hover:bg-white/10"
              >
                <RiArrowLeftSLine size={18} />
                返回
              </button>
            )}
          </div>
          <div className="min-w-0 truncate text-center text-[13px] font-semibold text-[#424245] dark:text-[#f5f5f7]">
            {viewMode === "settings" ? `${widgetTitle} 设置` : widgetTitle}
          </div>
          <div className="flex items-center justify-end">
            {viewMode === "full" && hasSettings && (
              <button
                type="button"
                aria-label="打开设置"
                title="设置"
                onClick={() => setViewMode("settings")}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-[#f5f5f7] text-[#1d1d1f] shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-[#f5f5f7] dark:hover:bg-white/15"
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
