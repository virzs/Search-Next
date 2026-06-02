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

/**
 * 根据后端小组件数据构建完整的入口文件 URL
 * 拼接规则: dir + "/" + entryFileName → 基于 origin 的绝对地址
 * @param widget 小组件数据
 * @returns 入口文件绝对 URL，如果无法构建返回 null
 */
export const buildWidgetEntryUrl = (widget: WidgetApiItem): string | null => {
  if (widget.entryUrl) return toBackendAssetUrl(widget.entryUrl);
  if (!widget.entryFileName) return null;

  // 如果 files 中有同名文件且带 url，直接使用
  const matchedFile = widget.files?.find(
    (f) => f.name === widget.entryFileName && f.url,
  );
  if (matchedFile?.url) {
    return toBackendAssetUrl(matchedFile.url);
  }

  // 兜底：通过 dir + entryFileName 拼接路径
  if (widget.dir) {
    const path = `/uploads/${widget.dir}/${widget.entryFileName}`;
    return toBackendAssetUrl(path);
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
