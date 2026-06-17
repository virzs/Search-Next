import React, { useMemo } from "react";
import { Button, Empty, Segmented, Spin, Tag } from "antd";
import { RiApps2Line } from "@remixicon/react";
import { DefaultAppView } from "@/components";
import { useWidget } from "@/hooks/useWidget";
import type {
  WidgetApiItem,
  WidgetScreenshot,
  WidgetSizeConfig,
} from "@/types";
import { toBackendAssetUrl } from "@/utils/utils";
import StoreHeroCard from "../../components/StoreHeroCard";
import { css } from "@emotion/css";

type PreviewTheme = "light" | "dark";

const PREVIEW_THEME_OPTIONS = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
];

const widgetViewClassName = css`
  .ant-segmented {
    border-radius: 999px;
    background: rgba(118, 118, 128, 0.14);
    padding: 3px;
  }

  .ant-segmented-item {
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
  }

  .ant-segmented-item-selected {
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.14);
  }
`;

const FALLBACK_SIZE_CONFIG: WidgetSizeConfig = {
  row: 2,
  col: 2,
  name: "2x2",
  id: "2x2",
};

const getPreviewTheme = (themeId?: string): PreviewTheme =>
  themeId === "dark" ? "dark" : "light";

const getPreviewSortIndex = (sizeId: string) => {
  const order = ["1x1", "2x1", "2x2", "3x2", "4x2"];
  const index = order.indexOf(sizeId);
  return index >= 0 ? index : order.length;
};

const getWidgetScreenshots = (widget: WidgetApiItem): WidgetScreenshot[] => {
  if (widget.screenshots?.length) return widget.screenshots;
  const snapshotScreenshots = widget.configSnapshot?.screenshots;
  return Array.isArray(snapshotScreenshots)
    ? (snapshotScreenshots as WidgetScreenshot[])
    : [];
};

const pickScreenshot = (
  screenshots: WidgetScreenshot[],
  sizeId: string,
  theme?: PreviewTheme,
) => {
  return screenshots
    .filter(
      (item) =>
        item.sizeId === sizeId &&
        (!theme || getPreviewTheme(item.themeId) === theme),
    )
    .sort((a, b) => Number(b.mode === "icon") - Number(a.mode === "icon"))[0];
};

const parseSizeFromId = (
  sizeId: string,
): Pick<WidgetSizeConfig, "row" | "col"> => {
  const match = sizeId.match(/^(\d+)x(\d+)$/);
  if (!match) return { row: 2, col: 2 };
  return { col: Number(match[1]), row: Number(match[2]) };
};

const getPreviewItems = (widget: WidgetApiItem, theme: PreviewTheme) => {
  const screenshots = getWidgetScreenshots(widget).filter(
    (item) => item?.url && item?.sizeId,
  );
  const sizeConfigs = widget.sizeConfigs?.length
    ? widget.sizeConfigs
    : [FALLBACK_SIZE_CONFIG];
  const sizeConfigMap = new Map(sizeConfigs.map((item) => [item.id, item]));
  const sizeIds = Array.from(
    new Set([
      ...sizeConfigs.map((item) => item.id),
      ...screenshots.map((item) => item.sizeId),
    ]),
  );

  return sizeIds
    .sort((a, b) => {
      const configDiff =
        (sizeConfigs.findIndex((item) => item.id === a) + 1 ||
          Number.MAX_SAFE_INTEGER) -
        (sizeConfigs.findIndex((item) => item.id === b) + 1 ||
          Number.MAX_SAFE_INTEGER);
      return (
        configDiff ||
        getPreviewSortIndex(a) - getPreviewSortIndex(b) ||
        a.localeCompare(b)
      );
    })
    .map((sizeId) => {
      const screenshot =
        pickScreenshot(screenshots, sizeId, theme) ||
        pickScreenshot(screenshots, sizeId);
      const fallbackSize = parseSizeFromId(sizeId);
      const sizeConfig = sizeConfigMap.get(sizeId) ?? {
        ...fallbackSize,
        id: sizeId,
        name: sizeId,
      };
      return {
        sizeId,
        label: sizeConfig.name || sizeId,
        screenshot,
        sizeConfig,
      };
    });
};

type PreviewItem = ReturnType<typeof getPreviewItems>[number];

const getPreviewAspectRatio = (
  screenshot?: WidgetScreenshot,
  sizeConfig?: WidgetSizeConfig,
) => {
  if (screenshot?.width && screenshot.height) {
    return `${screenshot.width} / ${screenshot.height}`;
  }
  if (sizeConfig?.col && sizeConfig.row)
    return `${sizeConfig.col} / ${sizeConfig.row}`;
  return "1 / 1";
};

const getPreviewTileWidth = (item: PreviewItem) => {
  const ratio = item.sizeConfig.col / item.sizeConfig.row;
  return Math.round(Math.min(188, Math.max(108, ratio * 104)));
};

const getScreenshotUrl = (screenshot?: WidgetScreenshot) =>
  screenshot?.url ? toBackendAssetUrl(screenshot.url) : "";

interface WidgetViewProps {
  onAddWidget?: (widgetId: string) => void;
  query?: string;
}

const WidgetView: React.FC<WidgetViewProps> = ({ onAddWidget, query }) => {
  const { widgets, loading, addToDesktop, getIconUrl } = useWidget();
  const [previewTheme, setPreviewTheme] = React.useState<PreviewTheme>("light");

  const filteredWidgets = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return widgets;
    return widgets.filter((w) => {
      const haystack =
        `${w.name} ${w.description || ""} ${w.tags?.join(" ") || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, widgets]);

  const handleAdd = (widget: WidgetApiItem, sizeId?: string) => {
    addToDesktop(widget._id, sizeId ? { sizeId } : undefined);
    onAddWidget?.(widget._id);
  };

  return (
    <DefaultAppView
      className={widgetViewClassName}
      contentClassName="h-full overflow-hidden px-0 pt-0 pb-0"
      headerRight={
        <Segmented
          size="small"
          options={PREVIEW_THEME_OPTIONS}
          value={previewTheme}
          onChange={(value) => setPreviewTheme(value as PreviewTheme)}
        />
      }
    >
      <div className="h-full overflow-y-auto px-3 pb-6 pt-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <StoreHeroCard
            title="桌面信息一眼可见"
            description="查看浅色或深色预览，比较不同尺寸截图，再选择合适尺寸添加到桌面。"
            tone="widget"
          />

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Spin />
            </div>
          ) : null}

          {!loading && filteredWidgets.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center">
              <Empty
                description={query ? "未找到匹配的小组件" : "暂无可用小组件"}
              />
            </div>
          ) : null}

          {!loading && filteredWidgets.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredWidgets.map((widget) => {
                const iconUrl = getIconUrl(widget);
                const previewItems = getPreviewItems(widget, previewTheme);
                const hasScreenshots = previewItems.some(
                  (item) => item.screenshot,
                );

                return (
                  <article
                    key={widget._id}
                    className="overflow-hidden rounded-[18px] border border-black/[0.08] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_26px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.08]"
                  >
                    <div className="flex items-start gap-3 px-4 pt-4">
                      <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 shadow-inner dark:bg-white/10">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={widget.name}
                            className="h-full w-full object-contain p-3"
                            loading="lazy"
                          />
                        ) : (
                          <RiApps2Line className="text-3xl text-blue-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-base font-bold tracking-normal text-gray-950 dark:text-gray-50">
                              {widget.name}
                            </div>
                            {widget.description ? (
                              <div className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-gray-500 dark:text-gray-400">
                                {widget.description}
                              </div>
                            ) : null}
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            shape="round"
                            className="h-7! shrink-0 px-4! text-xs! font-extrabold!"
                            onClick={() =>
                              handleAdd(widget, widget.defaultSizeId)
                            }
                          >
                            获取
                          </Button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          {widget.tags?.length ? (
                            widget.tags.slice(0, 4).map((tag) => (
                              <Tag
                                key={tag}
                                className="m-0! rounded-full! border-0! bg-gray-100! text-xs! text-gray-600! dark:bg-white/10! dark:text-gray-300!"
                              >
                                {tag}
                              </Tag>
                            ))
                          ) : (
                            <Tag className="m-0! rounded-full! border-0! bg-gray-100! text-xs! text-gray-600! dark:bg-white/10! dark:text-gray-300!">
                              小组件
                            </Tag>
                          )}
                          {widget.version ? (
                            <span>v{widget.version}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {hasScreenshots ? (
                      <div className="mt-4 overflow-x-auto pb-4">
                        <div className="flex w-max gap-3 px-4">
                          {previewItems.map((item) => (
                            <button
                              key={item.sizeId}
                              type="button"
                              aria-label={`添加 ${widget.name} ${item.label}`}
                              onClick={() => handleAdd(widget, item.sizeId)}
                              className="group shrink-0 rounded-[15px] border border-black/[0.12] bg-[#f5f5f7] p-2 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-blue-400/80 dark:hover:bg-blue-950/30"
                              style={{ width: getPreviewTileWidth(item) }}
                            >
                              <div
                                className="flex min-h-[78px] w-full items-center justify-center overflow-hidden rounded-[11px] bg-white p-2 dark:bg-black/20"
                                style={{
                                  aspectRatio: getPreviewAspectRatio(
                                    item.screenshot,
                                    item.sizeConfig,
                                  ),
                                }}
                              >
                                {item.screenshot ? (
                                  <img
                                    src={getScreenshotUrl(item.screenshot)}
                                    alt={`${widget.name} ${item.label}`}
                                    className="max-h-full max-w-full object-contain"
                                    loading="lazy"
                                  />
                                ) : (
                                  <RiApps2Line className="text-2xl text-gray-400" />
                                )}
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="truncate text-xs font-semibold text-gray-800 dark:text-gray-100">
                                  {item.label}
                                </span>
                                <span className="text-[11px] font-bold text-[#0071e3] dark:text-blue-300">
                                  获取
                                </span>
                              </div>
                              {item.screenshot?.width &&
                              item.screenshot.height ? (
                                <div className="mt-1 text-[11px] text-gray-400">
                                  {item.screenshot.width}×
                                  {item.screenshot.height}
                                </div>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 pb-4 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleAdd(widget, widget.defaultSizeId)
                          }
                          className="flex h-24 w-full items-center justify-center rounded-[15px] border border-dashed border-gray-200 bg-[#f5f5f7] text-sm font-semibold text-gray-500 dark:border-white/10 dark:bg-white/[0.06]"
                        >
                          <span>{widget.defaultSizeId || "2x2"}</span>
                          <span className="ml-3 text-[#0071e3]">获取</span>
                        </button>
                      </div>
                    )}
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

export default WidgetView;
