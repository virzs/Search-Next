import React, { useMemo } from "react";
import { Button, Empty, Spin, Tag } from "antd";
import { RiApps2Line } from "@remixicon/react";
import { AppSegmented, DefaultAppView } from "@/components";
import { useWidget } from "@/hooks/useWidget";
import type {
  WidgetApiItem,
  WidgetScreenshot,
  WidgetSizeConfig,
} from "@/types";
import type { StoreAddPayload } from "../../index";
import { toBackendAssetUrl } from "@/utils/utils";
import StoreHeroCard from "../../components/StoreHeroCard";
import { css } from "@emotion/css";

type PreviewTheme = "light" | "dark";

const PREVIEW_THEME_OPTIONS = [
  { label: "浅色", value: "light" },
  { label: "深色", value: "dark" },
];

const widgetViewClassName = css`
  .apple-store-get-button.ant-btn {
    border-color: #007aff !important;
    background: #007aff !important;
    color: #ffffff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }

  .apple-store-get-link.ant-btn {
    color: #007aff !important;
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

const supportsIconMode = (widget: WidgetApiItem) =>
  Boolean(widget.configSnapshot?.supportIconMode ?? widget.supportIconMode);

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
  onAddStoreItem?: (payload: StoreAddPayload) => void;
  query?: string;
}

const WidgetView: React.FC<WidgetViewProps> = ({ onAddStoreItem, query }) => {
  const { widgets, loading, refresh, getIconUrl } = useWidget();
  const [previewTheme, setPreviewTheme] = React.useState<PreviewTheme>("light");

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredWidgets = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return widgets.filter((w) => {
      if (!supportsIconMode(w)) return false;
      if (!q) return true;
      const haystack = `${w.name} ${w.description || ""} ${w.tags?.join(" ") || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, widgets]);

  const handleAdd = (widget: WidgetApiItem, sizeId?: string) => {
    onAddStoreItem?.({ kind: "widget", widgetId: widget._id, sizeId });
  };

  return (
    <DefaultAppView
      className={widgetViewClassName}
      contentClassName="h-full overflow-hidden px-0 pt-0 pb-0"
      headerRight={
        <AppSegmented
          size="small"
          options={PREVIEW_THEME_OPTIONS}
          value={previewTheme}
          onChange={(value) => setPreviewTheme(value as PreviewTheme)}
        />
      }
    >
      <div className="h-full overflow-y-auto px-4 pb-8 pt-4">
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
                    className="overflow-hidden rounded-[22px] border border-white/80 bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_44px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]"
                  >
                    <div className="flex items-start gap-3.5 px-5 pt-5">
                      <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#f2f2f7] shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_1px_2px_rgba(0,0,0,0.08)] dark:bg-white/10">
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
                            className="apple-store-get-button h-7! shrink-0 px-4! text-xs! font-bold!"
                            onClick={() =>
                              handleAdd(widget, widget.defaultSizeId)
                            }
                          >
                            获取
                          </Button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8e8e93]">
                          {widget.tags?.length ? (
                            widget.tags.slice(0, 4).map((tag) => (
                              <Tag
                                key={tag}
                                className="m-0! rounded-full! border-0! bg-[#f2f2f7]! text-xs! font-medium! text-[#6e6e73]! dark:bg-white/10! dark:text-gray-300!"
                              >
                                {tag}
                              </Tag>
                            ))
                          ) : (
                            <Tag className="m-0! rounded-full! border-0! bg-[#f2f2f7]! text-xs! font-medium! text-[#6e6e73]! dark:bg-white/10! dark:text-gray-300!">
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
                      <div className="mt-4 overflow-x-auto pb-5">
                        <div className="flex w-max gap-3 px-5">
                          {previewItems.map((item) => (
                            <div
                              key={item.sizeId}
                              className="group shrink-0 rounded-[18px] border border-white/80 bg-[#f5f5f7] p-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-blue-400/80 dark:hover:bg-blue-950/30"
                              style={{ width: getPreviewTileWidth(item) }}
                            >
                              <div
                                className="flex min-h-[78px] w-full items-center justify-center overflow-hidden rounded-[14px] bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.045)] dark:bg-black/20"
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
                                <Button
                                  type="link"
                                  size="small"
                                  className="apple-store-get-link h-5! px-0! text-[11px]! font-bold!"
                                  aria-label={`添加 ${widget.name} ${item.label}`}
                                  onClick={() => handleAdd(widget, item.sizeId)}
                                >
                                  获取
                                </Button>
                              </div>
                              {item.screenshot?.width &&
                              item.screenshot.height ? (
                                <div className="mt-1 text-[11px] text-gray-400">
                                  {item.screenshot.width}×
                                  {item.screenshot.height}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 pb-5 pt-4">
                        <div className="flex h-24 w-full items-center justify-center rounded-[18px] border border-dashed border-white bg-[#f5f5f7] text-sm font-semibold text-[#6e6e73] dark:border-white/10 dark:bg-white/[0.06]">
                          <span>{widget.defaultSizeId || "2x2"}</span>
                          <Button
                            type="link"
                            className="apple-store-get-link ml-2 px-0! font-bold!"
                            onClick={() =>
                              handleAdd(widget, widget.defaultSizeId)
                            }
                          >
                            获取
                          </Button>
                        </div>
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
