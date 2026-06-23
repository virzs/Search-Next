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

export type WidgetSettingsFieldType = "input" | "select" | "switch" | "textarea" | "number";

export interface WidgetSizeConfig {
  row: number;
  col: number;
  name: string;
  id: string;
}

export interface WidgetSettingsField {
  key: string;
  label: string;
  type: WidgetSettingsFieldType;
  default?: any;
  description?: string;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  rules?: Array<Record<string, any>>;
}

export interface WidgetScreenshot {
  mode?: string;
  themeId: string;
  sizeId: string;
  width?: number;
  height?: number;
  file: string;
  url: string;
}

export interface WidgetItem {
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
  sizeConfigs?: WidgetSizeConfig[];
  defaultSizeId?: string;
  supportIconMode?: boolean;
  tags?: string[];
  sortOrder?: number;
  settingsSchema?: WidgetSettingsField[]; // 设置表单Schema
  sourceType?: "legacy" | "snwidget";
  packageName?: string;
  activeVersion?: string;
  entryUrl?: string;
  iconUrl?: string;
  screenshots?: WidgetScreenshot[];
  configSnapshot?: Record<string, unknown>;
}

export interface WidgetPackageImportResult {
  widget: WidgetItem;
  version: WidgetVersionItem;
}

export interface WidgetVersionItem {
  _id: string;
  widget: string;
  name: string;
  version: string;
  packageName: string;
  packageUrl: string;
  entryFileName: string;
  entryUrl: string;
  iconUrl?: string;
  screenshots?: WidgetScreenshot[];
  active: boolean;
  configSnapshot: Record<string, unknown>;
  createdAt?: string;
}

// /tabs/widget 分页获取
export async function getWidget(params: any) {
  return baseGetRequest("/tabs/widget")(params);
}

// /tabs/widget 新增
export async function addWidget(data: WidgetItem) {
  return basePostRequest("/tabs/widget")(data);
}

// /tabs/widget/{id} 更新
export async function updateWidget(id: string, data: WidgetItem) {
  return basePutRequest("/tabs/widget")(id, data);
}

// /tabs/widget/{id} 删除
export async function delWidget(id: string) {
  return baseDeleteRequest("/tabs/widget")(id);
}

// /tabs/widget/{id} 详情
export async function getWidgetDetail(id: string) {
  return baseDetailRequest("/tabs/widget")(id);
}

// /tabs/widget/{id}/enable 切换启用状态
export async function updateWidgetEnable(id: string) {
  return basePutRequestNoId(`/tabs/widget/${id}/enable`)({});
}

export async function uploadWidgetPackage(file: File, widgetId?: string): Promise<WidgetPackageImportResult> {
  const form = new FormData();
  form.append("file", file);
  const url = new URL(getApiPrefix("/tabs/widget/package"), window.location.origin);
  if (widgetId) url.searchParams.set("widgetId", widgetId);
  const response = await fetch(url.href, {
    method: "POST",
    headers: {
      authorization: `Bearer ${getToken() ?? ""}`,
    },
    body: form,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.msg || "小组件包上传失败");
  }
  return data;
}

export async function getWidgetVersions(id: string) {
  return baseGetRequest(`/tabs/widget/${id}/versions`)({}) as Promise<WidgetVersionItem[]>;
}

export async function publishWidgetVersion(id: string, versionId: string) {
  return basePutRequestNoId(`/tabs/widget/${id}/versions/${versionId}/publish`)({});
}
