import React from 'react';
import { Button, Card, Grid, Typography } from 'antd';
import { RiAddLine, RiTimeLine, RiSunLine, RiTodoLine, RiCalculatorLine, RiApps2Line } from '@remixicon/react';
import { WIDGET_CONFIGS } from '@/services/micro-frontend';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

interface WidgetInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  size: 'small' | 'medium' | 'large';
}

interface WidgetViewProps {
  onAddWidget?: (widgetId: string) => void;
}

const WidgetView: React.FC<WidgetViewProps> = ({ onAddWidget }) => {
  const screens = useBreakpoint();
  // 预定义的小组件信息
  const widgets: WidgetInfo[] = [
    {
      id: 'test',
      name: '测试小组件',
      description: '演示图标模式和完整模式的小组件，支持在图标状态下交互',
      icon: <RiApps2Line className="text-2xl text-blue-500" />,
      category: '演示',
      size: 'medium',
    },
    {
      id: 'weather',
      name: '天气预报',
      description: '实时天气信息和预报',
      icon: <RiSunLine className="text-2xl text-orange-500" />,
      category: '生活工具',
      size: 'medium',
    },
    {
      id: 'clock',
      name: '时钟',
      description: '数字时钟和定时器，支持图标模式显示',
      icon: <RiTimeLine className="text-2xl text-blue-500" />,
      category: '工具',
      size: 'small',
    },
    {
      id: 'todo',
      name: '待办事项',
      description: '任务管理和提醒',
      icon: <RiTodoLine className="text-2xl text-green-500" />,
      category: '效率工具',
      size: 'large',
    },
    {
      id: 'calculator',
      name: '计算器',
      description: '基础数学计算',
      icon: <RiCalculatorLine className="text-2xl text-purple-500" />,
      category: '工具',
      size: 'medium',
    },
  ];

  const handleAddWidget = (widgetId: string) => {
    onAddWidget?.(widgetId);
  };

  const getGridCols = () => {
    if (screens.xxl) return 4;
    if (screens.xl) return 3;
    if (screens.lg) return 2;
    return 1;
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="mb-4">
        <Title level={4} className="mb-2">小组件商店</Title>
        <Text type="secondary">选择小组件添加到您的桌面</Text>
      </div>
      
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
        }}
      >
        {widgets.map((widget) => (
          <Card
            key={widget.id}
            size="small"
            className="hover:shadow-md transition-shadow"
            actions={[
              <Button
                key="add"
                type="primary"
                size="small"
                icon={<RiAddLine />}
                onClick={() => handleAddWidget(widget.id)}
                disabled={!WIDGET_CONFIGS[widget.id]} // 只有配置存在的才能添加
              >
                添加到桌面
              </Button>,
            ]}
          >
            <Card.Meta
              avatar={<div className="p-2">{widget.icon}</div>}
              title={widget.name}
              description={
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">{widget.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                      {widget.category}
                    </span>
                    <span className="text-gray-400">
                      {widget.size === 'small' && '小尺寸'}
                      {widget.size === 'medium' && '中尺寸'}
                      {widget.size === 'large' && '大尺寸'}
                    </span>
                  </div>
                </div>
              }
            />
          </Card>
        ))}
      </div>

      {widgets.filter(w => !WIDGET_CONFIGS[w.id]).length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text type="warning" className="text-sm">
            部分小组件正在开发中，敬请期待...
          </Text>
        </div>
      )}
    </div>
  );
};

export default WidgetView;
