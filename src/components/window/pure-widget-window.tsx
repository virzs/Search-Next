import React, { useCallback, useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { RiCloseLine, RiSubtractLine, RiFullscreenLine, RiFullscreenExitLine } from '@remixicon/react';
import PureWidget, { PureWidgetConfig } from '../micro-frontend/pure-widget';

interface PureWidgetWindowProps {
  config: PureWidgetConfig;
  visible: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
  height?: number | string;
}

const PureWidgetWindow: React.FC<PureWidgetWindowProps> = ({
  config,
  visible,
  onClose,
  title,
  width = 600,
  height = 400,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const windowTitle = (title || (config.props?.title as string) || '小组件') as string;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={isFullscreen ? '100vw' : width}
      style={{
        top: isFullscreen ? 0 : undefined,
        paddingBottom: 0,
        maxWidth: 'none',
      }}
      bodyStyle={{
        padding: 0,
        height: isFullscreen ? 'calc(100vh - 110px)' : height,
        overflow: 'hidden',
      }}
      destroyOnClose
      centered={!isFullscreen}
      maskClosable={false}
      className="widget-window"
   >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b select-none">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-700">{windowTitle}</div>
          </div>
          <Space size={4}>
            <Button type="text" size="small" onClick={handleMinimize} icon={<RiSubtractLine />}></Button>
            <Button type="text" size="small" onClick={handleFullscreen} icon={isFullscreen ? <RiFullscreenExitLine /> : <RiFullscreenLine />}></Button>
            <Button type="text" size="small" danger onClick={onClose} icon={<RiCloseLine />}></Button>
          </Space>
        </div>
        <div className="relative w-full h-full">
          {!isMinimized && (
            <PureWidget
              config={{ ...config, mode: 'full' }}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PureWidgetWindow;