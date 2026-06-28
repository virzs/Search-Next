import { WidgetApiItem } from "@/types";
import { baseGetRequest, baseDetailRequest } from "@/utils/axios";
import { toBackendAssetUrl } from "@/utils/utils";

/**
 * 获取所有已启用的小组件列表（公开接口）
 * 对应后端 GET /tabs/widget/public
 */
export const getPublicWidgets = baseGetRequest<WidgetApiItem[]>(
  "/tabs/widget/public",
);

/**
 * 获取单个小组件详情（公开接口）
 * 对应后端 GET /tabs/widget/public/:id
 */
export const getPublicWidgetDetail = baseDetailRequest<WidgetApiItem>(
  "/tabs/widget/public",
);

const withWidgetVersionToken = (url: string, widget: WidgetApiItem) => {
  const token = [
    widget.packageName,
    widget.configSnapshot?.version,
    widget.version,
    widget.updatedAt,
  ]
    .filter((item) => typeof item === "string" && item)
    .join(":");
  if (!token) return url;

  try {
    const nextUrl = new URL(url, window.location.origin);
    nextUrl.searchParams.set("snWidgetVersion", token);
    return nextUrl.href;
  } catch {
    return url;
  }
};

/**
 * 根据后端小组件数据构建完整的入口文件 URL
 * 拼接规则: dir + "/" + entryFileName → 基于 origin 的绝对地址
 * @param widget 小组件数据
 * @returns 入口文件绝对 URL，如果无法构建返回 null
 */
export const buildWidgetEntryUrl = (widget: WidgetApiItem): string | null => {
  if (widget.entryUrl) {
    return withWidgetVersionToken(toBackendAssetUrl(widget.entryUrl), widget);
  }
  if (!widget.entryFileName) return null;

  // 如果 files 中有同名文件且带 url，直接使用
  const matchedFile = widget.files?.find(
    (f) => f.name === widget.entryFileName && f.url,
  );
  if (matchedFile?.url) {
    return withWidgetVersionToken(toBackendAssetUrl(matchedFile.url), widget);
  }

  // 兜底：通过 dir + entryFileName 拼接路径
  if (widget.dir) {
    const path = `/uploads/${widget.dir}/${widget.entryFileName}`;
    return withWidgetVersionToken(toBackendAssetUrl(path), widget);
  }

  return null;
};

/**
 * 获取小组件图标 URL
 * @param widget 小组件数据
 * @returns 图标 URL 或 null
 */
export const getWidgetIconUrl = (widget: WidgetApiItem): string | null => {
  const url = widget.iconUrl || widget.icon?.url;
  if (!url || typeof url !== "string") return null;
  return toBackendAssetUrl(url);
};

const getSnwidgetAppIconUrlFromEntry = (widget: WidgetApiItem): string | null => {
  if (widget.sourceType !== "snwidget") return null;

  const appIcon = widget.configSnapshot?.appIcon || widget.appIcon;
  if (appIcon?.type === "custom") return null;
  const src = appIcon?.type === "image" && appIcon.src ? appIcon.src : "icon.svg";

  if (/^https?:\/\//i.test(src) || src.startsWith("//") || src.startsWith("/")) {
    return toBackendAssetUrl(src);
  }

  const entryUrl = buildWidgetEntryUrl(widget);
  if (!entryUrl) return null;

  try {
    const url = new URL(src, entryUrl);
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
};

export const getWidgetAppIconUrl = (widget: WidgetApiItem): string | null => {
  const appIcon = widget.configSnapshot?.appIcon || widget.appIcon;
  if (appIcon?.type === "custom") return null;
  const entryIconUrl = getSnwidgetAppIconUrlFromEntry(widget);
  if (entryIconUrl) return entryIconUrl;

  const url =
    widget.appIconUrl ||
    (typeof widget.configSnapshot?.appIconUrl === "string"
      ? widget.configSnapshot.appIconUrl
      : undefined) ||
    widget.iconUrl ||
    widget.icon?.url;
  if (!url || typeof url !== "string") return null;
  return toBackendAssetUrl(url);
};
