import { useEffect, useMemo, useState } from "react";
import { RiArrowLeftSLine, RiSettings3Line } from "@remixicon/react";
import { DesktopNextBaseModal } from "zs_library";
import PureApp, { PureAppConfig } from "../micro-frontend/pure-app";
import type { AppMode, AppSDK } from "@/sdk";
import type { AppConfig } from "@/types";
import { resolveLocalizedText, useI18n } from "@/i18n";

interface PureAppWindowProps {
  config: PureAppConfig;
  visible: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
  height?: number | string;
  appConfig?: AppConfig;
  /** 应用 SDK 实例 */
  sdk?: AppSDK;
  createSdk?: (mode: AppMode, sizeId: string) => AppSDK | undefined;
}

const PureAppWindow: React.FC<PureAppWindowProps> = ({
  config,
  visible,
  onClose,
  title,
  width = 600,
  height = 400,
  appConfig,
  sdk,
  createSdk,
}) => {
  const { t, language } = useI18n();
  const [viewMode, setViewMode] = useState<"full" | "settings">("full");
  const [appBackVisible, setAppBackVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setViewMode("full");
      setAppBackVisible(false);
    }
  }, [config.entry, visible]);

  const settingsRoutePath = appConfig?.pagePaths?.settings;
  const appTitle =
    title ||
    resolveLocalizedText(
      appConfig?.displayNameI18n,
      language,
      appConfig?.name,
    ) ||
    t("ui.app");
  const hasSettings = Boolean(appConfig?.id && settingsRoutePath);
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
        title: appTitle,
      },
      mode: "full" as AppMode,
      ...(currentSdk ? { sdk: currentSdk } : {}),
    }),
    [config, currentSdk, appTitle],
  );

  const settingsConfig = useMemo(
    () => ({
      ...config,
      props: {
        ...(config.props ?? {}),
        title: appTitle,
        pagePath: settingsRoutePath,
      },
      mode: "settings" as AppMode,
      ...(currentSdk ? { sdk: currentSdk } : {}),
    }),
    [config, currentSdk, settingsRoutePath, appTitle],
  );

  useEffect(() => {
    if (
      !visible ||
      viewMode !== "full" ||
      !currentSdk?.events
    ) {
      setAppBackVisible(false);
      return undefined;
    }

    const handler = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return;
      const data = payload as { appId?: string; backVisible?: unknown };
      if (data.appId && data.appId !== currentSdk.appId) return;
      if (typeof data.backVisible === "boolean") {
        setAppBackVisible(data.backVisible);
      }
    };

    currentSdk.events.on("app:chrome", handler);
    return () => currentSdk.events.off("app:chrome", handler);
  }, [currentSdk, viewMode, visible]);

  const showBackButton = viewMode === "settings" || appBackVisible;
  const handleHeaderBack = () => {
    if (viewMode === "settings") {
      setViewMode("full");
      return;
    }
    currentSdk?.events.emit("app:title-back", {
      appId: currentSdk.appId,
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
                {t("ui.back")}
              </button>
            )}
          </div>
          <div className="min-w-0 truncate text-center text-[13px] font-semibold text-[#424245] dark:text-[#f5f5f7]">
            {viewMode === "settings"
              ? t("ui.titleSettings", { title: appTitle })
              : appTitle}
          </div>
          <div className="flex items-center justify-end">
            {viewMode === "full" && hasSettings && (
              <button
                type="button"
                aria-label={t("ui.openSettings")}
                title={t("ui.settings")}
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
            <PureApp config={fullConfig} className="h-full w-full" />
          ) : settingsRoutePath ? (
            <PureApp config={settingsConfig} className="h-full w-full" />
          ) : null}
        </div>
      </div>
    </DesktopNextBaseModal>
  );
};

export default PureAppWindow;
