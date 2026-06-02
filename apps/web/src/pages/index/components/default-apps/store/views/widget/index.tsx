import React, { useMemo } from "react";
import { Button, Card, Typography, Spin, Empty, Tag } from "antd";
import { RiApps2Line } from "@remixicon/react";
import StoreHeroCard from "../../components/StoreHeroCard";
import { DefaultAppView } from "@/components";
import { useWidget } from "@/hooks/useWidget";
import type { WidgetApiItem } from "@/types";

const { Title, Text } = Typography;

interface WidgetViewProps {
  onAddWidget?: (widgetId: string) => void;
  query?: string;
}

const WidgetView: React.FC<WidgetViewProps> = ({ onAddWidget, query }) => {
  const { widgets, loading, addToDesktop, getIconUrl } = useWidget();

  /** 根据搜索词过滤小组件列表 */
  const filteredWidgets = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return widgets;
    return widgets.filter((w) => {
      const haystack = `${w.name} ${w.description || ""} ${w.tags?.join(" ") || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, widgets]);

  /** 点击"添加到桌面"，直接添加到桌面 */
  const handleAdd = (widget: WidgetApiItem) => {
    addToDesktop(widget._id);
    onAddWidget?.(widget._id);
  };

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
        <Text type="secondary">点击"添加到桌面"即可添加到桌面</Text>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Spin tip="正在加载小组件..." />
        </div>
      )}

      {/* 空状态 */}
      {!loading && filteredWidgets.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <Empty description={query ? "未找到匹配的小组件" : "暂无可用小组件"} />
        </div>
      )}

      {/* 小组件列表 */}
      {!loading && filteredWidgets.length > 0 && (
        <div className="mt-3 grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 overflow-y-auto pr-1 flex-1 px-1">
          {filteredWidgets.map((widget) => {
            const iconUrl = getIconUrl(widget);
            return (
              <Card key={widget._id} className="rounded-2xl! overflow-hidden">
                <div className="flex items-start gap-3">
                  {/* 小组件图标 */}
                  <div className="shrink-0 rounded-xl bg-black/5 p-2 dark:bg-white/10 w-10 h-10 flex items-center justify-center overflow-hidden">
                    {iconUrl ? (
                      <img src={iconUrl} alt={widget.name} className="w-full h-full object-contain" />
                    ) : (
                      <RiApps2Line className="text-2xl text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0 grow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-100 line-clamp-1">
                          {widget.name}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {widget.description || "暂无描述"}
                        </div>
                      </div>
                      <Button
                        type="primary"
                        className="rounded-full!"
                        onClick={() => handleAdd(widget)}
                      >
                        添加到桌面
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs gap-2">
                      <div className="flex gap-1 flex-wrap">
                        {widget.tags?.length ? (
                          widget.tags.map((tag) => (
                            <Tag key={tag} className="rounded-full! text-xs! m-0!">
                              {tag}
                            </Tag>
                          ))
                        ) : (
                          <span className="rounded-full bg-black/5 px-2 py-1 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                            小组件
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        {widget.defaultSizeId && <span>{widget.defaultSizeId}</span>}
                        {widget.version && <span>v{widget.version}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DefaultAppView>
  );
};

export default WidgetView;
