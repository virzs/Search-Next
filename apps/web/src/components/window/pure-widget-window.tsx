import { DesktopNextBaseModal } from "zs_library";
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
  width = 600,
  height = 400,
  sdk,
}) => {
  return (
    <DesktopNextBaseModal
      visible={visible}
      onClose={onClose}
      width={typeof width === "number" ? width : undefined}
      destroyOnClose
    >
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <PureWidget
          config={{ ...config, mode: "full", ...(sdk ? { sdk } : {}) }}
          className="w-full h-full"
        />
      </div>
    </DesktopNextBaseModal>
  );
};

export default PureWidgetWindow;
