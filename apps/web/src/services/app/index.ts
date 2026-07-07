import { AppApiItem } from "@/types";
import { baseGetRequest, baseDetailRequest } from "@/utils/axios";
import { toBackendAssetUrl } from "@/utils/utils";
import {
  buildAppEntryUrl as buildSharedAppEntryUrl,
  getAppIconUrl as getSharedAppIconUrl,
} from "@search-next/desktop";
import type { BasePageParams } from "../types";

/**
 * 获取所有已启用的应用列表（公开接口）
 * 对应后端 GET /tabs/app/public
 */
export const getPublicApps = baseGetRequest<AppApiItem[]>("/tabs/app/public");

export interface AppPublicParams extends Partial<BasePageParams> {
  classify?: string;
  search?: string;
}

export const getPublicAppsPage = (params: AppPublicParams = {}) => {
  return baseGetRequest("/tabs/app/public")(params);
};

export interface AppClassifyLevel1Item {
  _id: string;
  name: string;
  description?: string;
  appCount?: number;
}

export const getTabsAppClassifyPublicLevel1 = (params = {}) => {
  return baseGetRequest<AppClassifyLevel1Item[]>(
    "/tabs/app-classify/public/level1",
  )(params);
};

export interface AppCollectionPublicItem {
  _id: string;
  title: string;
  description?: string;
  kicker?: string;
  accentColor?: string;
  layout?: "story" | "compact";
  featured?: boolean;
  itemLimit?: number;
  total?: number;
  apps?: AppApiItem[];
  previewApps?: AppApiItem[];
}

export const getTabsAppCollectionPublicList = (params = {}) => {
  return baseGetRequest<AppCollectionPublicItem[]>(
    "/tabs/app-collection/public/list",
  )(params);
};

export const getTabsAppCollectionPublicAppsPage = (id: string, params = {}) => {
  return baseGetRequest(`/tabs/app-collection/public/${id}/apps`)(params);
};

/**
 * 获取单个应用详情（公开接口）
 * 对应后端 GET /tabs/app/public/:id
 */
export const getPublicAppDetail =
  baseDetailRequest<AppApiItem>("/tabs/app/public");

/**
 * 根据后端应用数据构建完整的入口文件 URL
 * 拼接规则: dir + "/" + entryFileName → 基于 origin 的绝对地址
 * @param app 应用数据
 * @returns 入口文件绝对 URL，如果无法构建返回 null
 */
export const buildAppEntryUrl = (app: AppApiItem): string | null =>
  buildSharedAppEntryUrl(app, toBackendAssetUrl);

/**
 * 获取应用图标 URL
 * @param app 应用数据
 * @returns 图标 URL 或 null
 */
export const getAppLauncherIconUrl = (app: AppApiItem): string | null => {
  const url = app.iconUrl || app.icon?.url;
  if (!url || typeof url !== "string") return null;
  return toBackendAssetUrl(url);
};

export const getAppIconUrl = (app: AppApiItem): string | null =>
  getSharedAppIconUrl(app, toBackendAssetUrl);
