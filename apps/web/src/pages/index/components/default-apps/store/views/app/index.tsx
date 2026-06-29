import React, { useEffect, useMemo } from "react";
import { Button, Empty, Spin, Tag } from "antd";
import { RiApps2Line } from "@remixicon/react";
import { DefaultAppView } from "@/components";
import { useWidget } from "@/hooks/useWidget";
import type { WidgetApiItem } from "@/types";
import type { StoreAddPayload } from "../../index";
import StoreHeroCard from "../../components/StoreHeroCard";
import PureWidget from "@/components/micro-frontend/pure-widget";
import { css } from "@emotion/css";

const appViewClassName = css`
  .apple-store-get-button.ant-btn {
    border-color: #007aff !important;
    background: #007aff !important;
    color: #ffffff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;

const supportsAppMode = (widget: WidgetApiItem) =>
  Boolean(widget.configSnapshot?.supportAppMode ?? widget.supportAppMode);

const getAppIcon = (widget: WidgetApiItem) =>
  widget.configSnapshot?.appIcon ?? widget.appIcon;

interface AppIconPreviewProps {
  widget: WidgetApiItem;
  entryUrl: string | null;
  iconUrl: string | null;
}

const AppIconPreview: React.FC<AppIconPreviewProps> = ({
  widget,
  entryUrl,
  iconUrl,
}) => {
  const appIcon = getAppIcon(widget);
  if (appIcon?.type === "custom" && entryUrl) {
    return (
      <PureWidget
        config={{
          entry: entryUrl,
          props: { title: widget.name },
          mode: "appIcon",
        }}
        className="h-full w-full"
      />
    );
  }

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={widget.name}
        className="h-full w-full object-contain p-3"
        loading="lazy"
      />
    );
  }

  return <RiApps2Line className="text-3xl text-blue-500" />;
};

interface AppViewProps {
  onAddStoreItem?: (payload: StoreAddPayload) => void;
  query?: string;
}

const AppView: React.FC<AppViewProps> = ({ onAddStoreItem, query }) => {
  const {
    widgets,
    loading,
    refresh,
    getAppIconUrl,
    getEntryUrl,
  } = useWidget();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredApps = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return widgets
      .filter(supportsAppMode)
      .filter((w) => {
        if (!q) return true;
        const haystack =
          `${w.name} ${w.description || ""} ${w.tags?.join(" ") || ""}`.toLowerCase();
        return haystack.includes(q);
      });
  }, [query, widgets]);

  const handleAdd = (widget: WidgetApiItem) => {
    onAddStoreItem?.({ kind: "app", widgetId: widget._id });
  };

  return (
    <DefaultAppView
      className={appViewClassName}
      contentClassName="h-full overflow-hidden px-0 pt-0 pb-0"
    >
      <div className="h-full overflow-y-auto px-4 pb-8 pt-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <StoreHeroCard
            title="把工具作为应用打开"
            description="应用以固定图标添加到桌面，点击后在独立窗口中运行完整功能。"
            tone="widget"
          />

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Spin />
            </div>
          ) : null}

          {!loading && filteredApps.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center">
              <Empty description={query ? "未找到匹配的应用" : "暂无可用应用"} />
            </div>
          ) : null}

          {!loading && filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredApps.map((widget) => {
                const iconUrl = getAppIconUrl(widget);
                const entryUrl = getEntryUrl(widget);
                return (
                  <article
                    key={widget._id}
                    className="flex min-h-[150px] flex-col rounded-[22px] border border-white/80 bg-white/90 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_44px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.08]"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#f2f2f7] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_1px_2px_rgba(0,0,0,0.08)] dark:bg-white/10">
                        <AppIconPreview
                          widget={widget}
                          entryUrl={entryUrl}
                          iconUrl={iconUrl}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-bold tracking-normal text-gray-950 dark:text-gray-50">
                          {widget.name}
                        </div>
                        {widget.description ? (
                          <div className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-gray-500 dark:text-gray-400">
                            {widget.description}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Tag className="m-0! rounded-full! border-0! bg-[#f2f2f7]! text-xs! font-medium! text-[#6e6e73]! dark:bg-white/10! dark:text-gray-300!">
                          应用
                        </Tag>
                        {widget.version ? (
                          <span className="text-xs font-medium text-[#8e8e93]">
                            v{widget.version}
                          </span>
                        ) : null}
                      </div>
                      <Button
                        type="primary"
                        size="small"
                        shape="round"
                        className="apple-store-get-button h-7! shrink-0 px-4! text-xs! font-bold!"
                        onClick={() => handleAdd(widget)}
                      >
                        获取
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </DefaultAppView>
  );
};

export default AppView;
