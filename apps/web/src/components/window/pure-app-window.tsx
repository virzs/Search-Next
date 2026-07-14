import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (visible) {
      setViewMode("full");
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

  return (
    <DesktopNextBaseModal
      visible={visible}
      onClose={onClose}
      width={typeof width === "number" ? width : undefined}
      destroyOnClose
      floatingControls
      styles={{
        body: { padding: 0 },
        inner: { height: "100%", overflow: "hidden" },
      }}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-white/95 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)] backdrop-blur-xl in-data-fullscreen:h-full! dark:bg-[#1c1c1e]/95 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        style={{ height }}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
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
