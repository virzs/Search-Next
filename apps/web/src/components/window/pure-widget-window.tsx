import { DesktopBaseModal } from "zs_library";
import PureWidget, { PureWidgetConfig } from "../micro-frontend/pure-widget";
import type { WidgetSDK } from "@/sdk";

interface PureWidgetWindowProps {
  config: PureWidgetConfig;
  visible: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
  height?: number | string;
  /** 小组件 SDK 实例 */
  sdk?: WidgetSDK;
}

const PureWidgetWindow: React.FC<PureWidgetWindowProps> = ({
  config,
  visible,
  onClose,
  title,
  width = 600,
  height = 400,
  sdk,
}) => {
  const windowTitle = (title ||
    (config.props?.title as string) ||
    "小组件") as string;

  return (
    <DesktopBaseModal
      visible={visible}
      onClose={onClose}
      title={windowTitle}
      width={typeof width === "number" ? width : undefined}
      destroyOnClose
      contentClassName="w-full overflow-hidden"
    >
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <PureWidget
          config={{ ...config, mode: "full", ...(sdk ? { sdk } : {}) }}
          className="w-full h-full"
        />
      </div>
    </DesktopBaseModal>
  );
};

export default PureWidgetWindow;
