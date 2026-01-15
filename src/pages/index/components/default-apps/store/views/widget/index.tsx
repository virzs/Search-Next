import React, { useMemo } from "react";
import { Button, Card, Typography } from "antd";
import {
  RiTimeLine,
  RiSunLine,
  RiTodoLine,
  RiCalculatorLine,
  RiApps2Line,
} from "@remixicon/react";
import { WIDGET_CONFIGS } from "@/services/micro-frontend";
import StoreHeroCard from "../../components/StoreHeroCard";
import { DefaultAppView } from "@/components";

const { Title, Text } = Typography;

interface WidgetInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  size: "small" | "medium" | "large";
}

interface WidgetViewProps {
  onAddWidget?: (widgetId: string) => void;
  query?: string;
}

const WIDGETS: WidgetInfo[] = [
  {
    id: "test",
    name: "测试小组件",
    description: "演示图标模式和完整模式的小组件，支持在图标状态下交互",
    icon: <RiApps2Line className="text-2xl text-blue-500" />,
    category: "演示",
    size: "medium",
  },
  {
    id: "weather",
    name: "天气预报",
    description: "实时天气信息和预报",
    icon: <RiSunLine className="text-2xl text-orange-500" />,
    category: "生活工具",
    size: "medium",
  },
  {
    id: "clock",
    name: "时钟",
    description: "数字时钟和定时器，支持图标模式显示",
    icon: <RiTimeLine className="text-2xl text-blue-500" />,
    category: "工具",
    size: "small",
  },
  {
    id: "todo",
    name: "待办事项",
    description: "任务管理和提醒",
    icon: <RiTodoLine className="text-2xl text-green-500" />,
    category: "效率工具",
    size: "large",
  },
  {
    id: "calculator",
    name: "计算器",
    description: "基础数学计算",
    icon: <RiCalculatorLine className="text-2xl text-purple-500" />,
    category: "工具",
    size: "medium",
  },
];

const WidgetView: React.FC<WidgetViewProps> = ({ onAddWidget, query }) => {
  const handleAddWidget = (widgetId: string) => {
    onAddWidget?.(widgetId);
  };

  const filteredWidgets = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return WIDGETS;
    return WIDGETS.filter((w) => {
      const haystack = `${w.name} ${w.description} ${w.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <DefaultAppView contentClassName="h-full flex flex-col overflow-hidden pt-5 px-1 pb-4">
      <div className="shrink-0">
        <StoreHeroCard
          subtitle="精选"
          title="用小组件，让桌面更有用"
          description="支持时钟、待办、天气等，后续持续扩展。"
          gradient="bg-linear-to-br from-fuchsia-600 via-purple-600 to-indigo-600"
          circlePosition="left"
        />
      </div>

      <div className="mt-5 shrink-0 px-1">
        <Title level={5} className="mb-1!">
          全部小组件
        </Title>
        <Text type="secondary">点击“获取”即可添加到桌面</Text>
      </div>

      <div className="mt-3 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 overflow-y-auto pr-1 flex-1 px-1">
        {filteredWidgets.map((widget) => {
          const disabled = !WIDGET_CONFIGS[widget.id];
          return (
            <Card key={widget.id} className="rounded-2xl! overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl bg-black/5 p-2 dark:bg-white/10">
                  {widget.icon}
                </div>
                <div className="min-w-0 grow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 dark:text-gray-100 line-clamp-1">
                        {widget.name}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {widget.description}
                      </div>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      className="rounded-full!"
                      disabled={disabled}
                      onClick={() => handleAddWidget(widget.id)}
                    >
                      获取
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-black/5 px-2 py-1 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                      {widget.category}
                    </span>
                    <span className="text-gray-400">
                      {widget.size === "small" && "小尺寸"}
                      {widget.size === "medium" && "中尺寸"}
                      {widget.size === "large" && "大尺寸"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredWidgets.filter((w) => !WIDGET_CONFIGS[w.id]).length > 0 && (
        <div className="mt-4 shrink-0 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-300/20 dark:bg-yellow-200/10 mx-1">
          <Text type="warning" className="text-sm">
            部分小组件正在开发中，敬请期待...
          </Text>
        </div>
      )}
    </DefaultAppView>
  );
};

export default WidgetView;
