import {
  DesktopRemoteApp,
  type DesktopRemoteAppConfig,
} from "@search-next/desktop";
import type { CSSProperties, FC } from "react";
import type { AppSDK } from "@/sdk";
import { useI18n } from "@/i18n";

export type PureAppConfig = DesktopRemoteAppConfig<AppSDK>;

interface PureAppProps {
  config: PureAppConfig;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

const PureApp: FC<PureAppProps> = ({
  config,
  className,
  style,
  onClick,
}) => {
  const { t } = useI18n();

  return (
    <DesktopRemoteApp
      config={config}
      className={className}
      style={style}
      onClick={onClick}
      loadFailedFallback={
        <div className="flex h-full w-full items-center justify-center text-xs text-red-500">
          {t("app.loadFailed")}
        </div>
      }
    />
  );
};

export default PureApp;
