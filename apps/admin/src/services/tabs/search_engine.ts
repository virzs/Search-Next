import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";

/**
 * 搜索引擎分页
 * /tabs/search-engine
 */
export async function getSearchEngine(params: any) {
  return baseGetRequest("/tabs/search-engine")(params);
}

export interface SearchEngine {
  name: string;
  description?: string;
  searchUrl: string;
  suggestUrl?: string;
  jsonpCode: string;
  isEnabled: boolean;
  icon?: string;
}

export interface ImportErrorItem {
  index: number;
  key?: string;
  message: string;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  restored: number;
  failed: number;
  errors: ImportErrorItem[];
}

export interface SearchEngineExportPackage {
  schemaVersion: 1;
  type: "search-engine";
  exportedAt: string;
  items: SearchEngine[];
}

/**
 * 新增
 * /tabs/search-engine
 */
export async function addSearchEngine(data: SearchEngine) {
  return basePostRequest("/tabs/search-engine")(data);
}

/**
 * 更新
 * /tabs/search-engine
 */
export async function updateSearchEngine(id: string, data: SearchEngine) {
  return basePutRequest("/tabs/search-engine")(id, data);
}

/**
 * 切换启用状态
 * /tabs/search-engine/:id/enable
 */
export async function toggleSearchEngineEnable(id: string) {
  return basePutRequestNoId(`/tabs/search-engine/${id}/enable`)({});
}

/**
 * 删除
 * /tabs/search-engine
 */
export async function delSearchEngine(id: string) {
  return baseDeleteRequest("/tabs/search-engine")(id);
}

/**
 * 详情
 * /tabs/search-engine
 */
export async function getSearchEngineDetail(id: string) {
  return baseDetailRequest("/tabs/search-engine")(id);
}

/**
 * 已启用的列表
 * /tabs/search-engine/enabled
 */
export async function getSearchEngineEnabled() {
  return baseGetRequest("/tabs/search-engine/enabled")();
}

/**
 * 导出
 * /tabs/search-engine/export
 */
export async function exportSearchEngine() {
  return baseGetRequest<SearchEngineExportPackage>(
    "/tabs/search-engine/export",
  )();
}

/**
 * 导入
 * /tabs/search-engine/import
 */
export async function importSearchEngine(data: unknown) {
  return basePostRequest<ImportResult>("/tabs/search-engine/import")(
    data as object,
  );
}
