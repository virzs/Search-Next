import React, { useState, useCallback } from 'react';
import { Modal, Button, Space } from 'antd';
import { RiCloseLine, RiSubtractLine, RiFullscreenLine, RiFullscreenExitLine } from '@remixicon/react';
import MicroFrontend from '../micro-frontend';
import InternalWidget from '../micro-frontend/internal-widget';
import { MicroAppConfig } from '../../services/micro-frontend';
import { motion } from 'framer-motion';

interface WidgetWindowProps {
  config: MicroAppConfig;
  visible: boolean;
  onClose: () => void;  title?: string;
  width?: number;
  height?: number;
  widgetId?: string; // 用于内部组件识别
}

const WidgetWindow: React.FC<WidgetWindowProps> = ({
  config,
  visible,
  onClose,  title,  width = 400,
  height = 300,
  widgetId,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const windowTitle = (title || config.props?.title || config.name) as string;

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
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b select-none">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-700">
              {windowTitle}
            </div>
          </div>
          <Space size={4}>
            <Button
              type="text"
              size="small"
              icon={<RiSubtractLine size={14} />}
              onClick={handleMinimize}
              className="text-gray-500 hover:text-gray-700"
            />
            <Button
              type="text"
              size="small"
              icon={
                isFullscreen ? (
                  <RiFullscreenExitLine size={14} />
                ) : (
                  <RiFullscreenLine size={14} />
                )
              }
              onClick={handleFullscreen}
              className="text-gray-500 hover:text-gray-700"
            />
            <Button
              type="text"
              size="small"
              icon={<RiCloseLine size={14} />}
              onClick={onClose}
              className="text-gray-500 hover:text-red-500"
            />
          </Space>
        </div>

        {/* 内容区域 */}
        <motion.div
          className="flex-1 overflow-hidden"
          animate={{
            height: isMinimized ? 0 : 'auto',
            opacity: isMinimized ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}        >
          {/* 根据配置选择渲染方式 */}
          {config.entry === 'internal' && widgetId ? (
            <InternalWidget
              widgetId={widgetId}
              mode="full"
              className="w-full h-full"
            />
          ) : (
            <MicroFrontend
              config={config}
              className="w-full h-full"
              onLoad={(app) => {
                console.log(`Widget ${config.name} loaded:`, app);
              }}
              onError={(error) => {
                console.error(`Widget ${config.name} error:`, error);
              }}
            />
          )}
        </motion.div>
      </div>
    </Modal>
  );
};

export default WidgetWindow;
