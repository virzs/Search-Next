import React from 'react';
import TestWidget from '../test-widget';

interface InternalWidgetProps {
  widgetId: string;
  mode?: 'icon' | 'full';
  props?: Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
}

const InternalWidget: React.FC<InternalWidgetProps> = ({
  widgetId,
  mode = 'full',
  props,
  className,
  style,
}) => {
  // 根据 widgetId 渲染对应的内部组件
  const renderWidget = () => {
    switch (widgetId) {
      case 'test':
        return <TestWidget mode={mode} {...props} />;
      default:
        return (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            未知小组件: {widgetId}
          </div>
        );
    }
  };

  return (
    <div className={className} style={style}>
      {renderWidget()}
    </div>
  );
};

export default InternalWidget;
