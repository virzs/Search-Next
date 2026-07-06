import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";
import { Resource } from "../resource";
import { getApiPrefix } from "@/utils/utils";
import { getToken } from "@/utils/token";

export type AppSettingsFieldType = "input" | "select" | "switch" | "textarea" | "number";

export interface AppSizeConfig {
  row: number;
  col: number;
  name: string;
  id: string;
}

export interface AppSettingsField {
  key: string;
  label: string;
  type: AppSettingsFieldType;
  default?: any;
  description?: string;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  rules?: Array<Record<string, any>>;
}

export interface AppScreenshot {
  mode?: string;
  themeId: string;
  sizeId: string;
  width?: number;
  height?: number;
  file: string;
  url: string;
}

export type AppIcon =
  | { type: "image"; src?: string }
  | { type: "custom" };

export interface AppPagePaths {
  settings?: string;
}

export interface AppItem {
  _id?: string;
  name: string;
  description?: string;
  preview?: Resource | null;
  previewImages?: Resource[];
  icon?: Resource | null;
  files: Resource[];
  entryFileName?: string; // 入口文件名称
  classify?: string; // 分类ID
  enable?: boolean;
  dir?: string;
  version?: string;
  author?: string;
  sizeConfigs?: AppSizeConfig[];
  defaultSizeId?: string;
  supportIconMode?: boolean;
  supportAppMode?: boolean;
  appIcon?: AppIcon;
  appIconUrl?: string;
  pagePaths?: AppPagePaths;
  tags?: string[];
  sortOrder?: number;
  settingsSchema?: AppSettingsField[]; // 设置表单Schema
  sourceType?: "legacy" | "snapp";
  packageName?: string;
  activeVersion?: string;
  entryUrl?: string;
  iconUrl?: string;
  screenshots?: AppScreenshot[];
  configSnapshot?: Record<string, unknown>;
}

export interface AppPackageImportResult {
  app: AppItem;
  version: AppVersionItem;
}

export interface AppVersionItem {
  _id: string;
  app: string;
  name: string;
  version: string;
  packageName: string;
  packageUrl: string;
  entryFileName: string;
  entryUrl: string;
  iconUrl?: string;
  appIcon?: AppIcon;
  appIconUrl?: string;
  pagePaths?: AppPagePaths;
  screenshots?: AppScreenshot[];
  active: boolean;
  configSnapshot: Record<string, unknown>;
  createdAt?: string;
}

// /tabs/app 分页获取
export async function getApp(params: any) {
  return baseGetRequest("/tabs/app")(params);
}

// /tabs/app 新增
export async function addApp(data: AppItem) {
  return basePostRequest("/tabs/app")(data);
}

// /tabs/app/{id} 更新
export async function updateApp(id: string, data: AppItem) {
  return basePutRequest("/tabs/app")(id, data);
}

// /tabs/app/{id} 删除
export async function delApp(id: string) {
  return baseDeleteRequest("/tabs/app")(id);
}

// /tabs/app/{id} 详情
export async function getAppDetail(id: string) {
  return baseDetailRequest("/tabs/app")(id);
}

// /tabs/app/{id}/enable 切换启用状态
export async function updateAppEnable(id: string) {
  return basePutRequestNoId(`/tabs/app/${id}/enable`)({});
}

export async function uploadAppPackage(file: File, appId?: string): Promise<AppPackageImportResult> {
  const form = new FormData();
  form.append("file", file);
  const url = new URL(getApiPrefix("/tabs/app/package"), window.location.origin);
  if (appId) url.searchParams.set("appId", appId);
  const response = await fetch(url.href, {
    method: "POST",
    headers: {
      authorization: `Bearer ${getToken() ?? ""}`,
    },
    body: form,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.msg || "应用包上传失败");
  }
  return data?.data ?? data;
}

export async function getAppVersions(id: string) {
  return baseGetRequest(`/tabs/app/${id}/versions`)({}) as Promise<AppVersionItem[]>;
}

export async function publishAppVersion(id: string, versionId: string) {
  return basePutRequestNoId(`/tabs/app/${id}/versions/${versionId}/publish`)({});
}
