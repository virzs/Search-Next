import React, { useCallback, useState } from "react";
import { Modal, Button } from "antd";
import {
  RiCloseLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
} from "@remixicon/react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const windowTitle = (title ||
    (config.props?.title as string) ||
    "小组件") as string;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={isFullscreen ? "100vw" : width}
      style={{
        top: isFullscreen ? 0 : undefined,
        paddingBottom: 0,
        maxWidth: "none",
      }}
      styles={{
        body: {
          padding: 0,
          height: isFullscreen ? "calc(100vh - 110px)" : height,
          overflow: "hidden",
        },
        container: {
          padding: 0,
          overflow: "hidden",
        },
      }}
      destroyOnHidden
      centered={!isFullscreen}
      maskClosable={false}
      className="widget-window"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b select-none">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-700">
              {windowTitle}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="text"
              size="small"
              onClick={handleFullscreen}
              icon={
                isFullscreen ? (
                  <RiFullscreenExitLine size={16} />
                ) : (
                  <RiFullscreenLine size={16} />
                )
              }
            ></Button>
            <Button
              type="text"
              size="small"
              danger
              onClick={onClose}
              icon={<RiCloseLine size={16} />}
            ></Button>
          </div>
        </div>
        <div className="relative w-full h-full">
          <PureWidget
            // 将宿主注入的 SDK 透传给 PureWidget，供小组件 mount 时使用
            config={{ ...config, mode: "full", ...(sdk ? { sdk } : {}) }}
            className="w-full h-full"
          />
        </div>
      </div>
    </Modal>
  );
};

export default PureWidgetWindow;
