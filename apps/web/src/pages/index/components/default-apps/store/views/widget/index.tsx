import React, { useMemo } from "react";
import { Button, Empty, Segmented, Spin, Tag } from "antd";
import { RiApps2Line } from "@remixicon/react";
import { DefaultAppView } from "@/components";
import { useWidget } from "@/hooks/useWidget";
import type { WidgetApiItem, WidgetScreenshot, WidgetSizeConfig } from "@/types";
import { toBackendAssetUrl } from "@/utils/utils";

type PreviewTheme = "light" | "dark";

const PREVIEW_THEME_OPTIONS = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
];

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

const parseSizeFromId = (sizeId: string): Pick<WidgetSizeConfig, "row" | "col"> => {
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
  if (sizeConfig?.col && sizeConfig.row) return `${sizeConfig.col} / ${sizeConfig.row}`;
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
  const [previewTheme, setPreviewTheme] =
    React.useState<PreviewTheme>("light");

  const filteredWidgets = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return widgets;
    return widgets.filter((w) => {
      const haystack =
        `${w.name} ${w.description || ""} ${w.tags?.join(" ") || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, widgets]);

  const featuredWidget = filteredWidgets[0] ?? widgets[0];
  const featuredPreviewItems = featuredWidget
    ? getPreviewItems(featuredWidget, previewTheme)
        .filter((item) => item.screenshot)
        .slice(0, 3)
    : [];

  const handleAdd = (widget: WidgetApiItem, sizeId?: string) => {
    addToDesktop(widget._id, sizeId ? { sizeId } : undefined);
    onAddWidget?.(widget._id);
  };

  return (
    <DefaultAppView contentClassName="h-full overflow-hidden px-0 pt-0 pb-0">
      <div className="h-full overflow-y-auto px-3 pb-6 pt-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <section className="relative min-h-[230px] overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#0a84ff_0%,#5e5ce6_58%,#ff375f_100%)] px-7 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_46%)]" />
            <div className="relative z-10 grid min-h-[176px] gap-6 md:grid-cols-[minmax(0,1fr)_360px] md:items-end">
              <div className="self-end">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.78]">
                  今日推荐
                </div>
                <div className="max-w-xl whitespace-nowrap text-[34px] font-bold leading-[1.08] tracking-normal md:text-[40px]">
                  桌面小组件
                </div>
                <div className="mt-3 max-w-lg text-base leading-6 text-white/[0.88]">
                  时钟、日程、待办和效率工具，在桌面保持信息可见。
                </div>
              </div>

              <div className="hidden items-end justify-end gap-3 md:flex">
                {featuredPreviewItems.length ? (
                  featuredPreviewItems.map((item, index) => (
                    <button
                      key={`${item.sizeId}-${item.screenshot?.file}`}
                      type="button"
                      aria-label={`添加 ${featuredWidget?.name} ${item.label}`}
                      onClick={() => featuredWidget && handleAdd(featuredWidget, item.sizeId)}
                      className="group flex w-28 flex-col items-center rounded-[24px] border border-white/30 bg-white/20 p-3 text-left shadow-[0_18px_38px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.28]"
                      style={{ marginBottom: index === 1 ? 22 : 0 }}
                    >
                      <div
                        className="flex w-full items-center justify-center overflow-hidden rounded-[18px] bg-white/90 p-2"
                        style={{
                          aspectRatio: getPreviewAspectRatio(
                            item.screenshot,
                            item.sizeConfig,
                          ),
                        }}
                      >
                        <img
                          src={getScreenshotUrl(item.screenshot)}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-2 text-xs font-semibold text-white">
                        {item.label}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center rounded-[32px] border border-white/30 bg-white/20 backdrop-blur-xl">
                    <RiApps2Line size={46} />
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <div className="text-[28px] font-bold leading-8 tracking-normal text-gray-950 dark:text-gray-50">
                小组件
              </div>
              <div className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                {filteredWidgets.length} 个项目
              </div>
            </div>
            <Segmented
              size="small"
              options={PREVIEW_THEME_OPTIONS}
              value={previewTheme}
              onChange={(value) => setPreviewTheme(value as PreviewTheme)}
            />
          </div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Spin tip="正在加载小组件..." />
            </div>
          ) : null}

          {!loading && filteredWidgets.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center">
              <Empty description={query ? "未找到匹配的小组件" : "暂无可用小组件"} />
            </div>
          ) : null}

          {!loading && filteredWidgets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredWidgets.map((widget) => {
                const iconUrl = getIconUrl(widget);
                const previewItems = getPreviewItems(widget, previewTheme);
                const hasScreenshots = previewItems.some((item) => item.screenshot);

                return (
                  <article
                    key={widget._id}
                    className="overflow-hidden rounded-[28px] border border-white/70 bg-white/[0.82] shadow-[0_18px_42px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]"
                  >
                    <div className="flex items-start gap-4 px-5 pt-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gray-100 shadow-inner dark:bg-white/10">
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
                            <div className="truncate text-lg font-semibold tracking-normal text-gray-950 dark:text-gray-50">
                              {widget.name}
                            </div>
                            <div className="mt-1 line-clamp-2 min-h-9 text-sm leading-[18px] text-gray-500 dark:text-gray-400">
                              {widget.description || "暂无描述"}
                            </div>
                          </div>
                          <Button
                            type="primary"
                            shape="round"
                            className="shrink-0 px-5! font-semibold!"
                            onClick={() => handleAdd(widget, widget.defaultSizeId)}
                          >
                            获取
                          </Button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          {widget.tags?.length ? (
                            widget.tags.slice(0, 4).map((tag) => (
                              <Tag key={tag} className="m-0! rounded-full! border-0! bg-gray-100! text-xs! text-gray-600! dark:bg-white/10! dark:text-gray-300!">
                                {tag}
                              </Tag>
                            ))
                          ) : (
                            <Tag className="m-0! rounded-full! border-0! bg-gray-100! text-xs! text-gray-600! dark:bg-white/10! dark:text-gray-300!">
                              小组件
                            </Tag>
                          )}
                          {widget.version ? <span>v{widget.version}</span> : null}
                        </div>
                      </div>
                    </div>

                    {hasScreenshots ? (
                      <div className="mt-5 overflow-x-auto pb-5">
                        <div className="flex w-max gap-3 px-5">
                          {previewItems.map((item) => (
                            <button
                              key={item.sizeId}
                              type="button"
                              aria-label={`添加 ${widget.name} ${item.label}`}
                              onClick={() => handleAdd(widget, item.sizeId)}
                              className="group shrink-0 rounded-[22px] border border-gray-200/90 bg-gray-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-blue-400/80 dark:hover:bg-blue-950/30"
                              style={{ width: getPreviewTileWidth(item) }}
                            >
                              <div
                                className="flex w-full items-center justify-center overflow-hidden rounded-[16px] bg-white p-2 dark:bg-black/20"
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
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/[0.18] dark:text-blue-300">
                                  获取
                                </span>
                              </div>
                              {item.screenshot?.width && item.screenshot.height ? (
                                <div className="mt-1 text-[11px] text-gray-400">
                                  {item.screenshot.width}×{item.screenshot.height}
                                </div>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 pb-5 pt-4">
                        <button
                          type="button"
                          onClick={() => handleAdd(widget, widget.defaultSizeId)}
                          className="flex h-24 w-full items-center justify-center rounded-[22px] border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-400 dark:border-white/10 dark:bg-white/[0.06]"
                        >
                          {widget.defaultSizeId || "2x2"}
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
