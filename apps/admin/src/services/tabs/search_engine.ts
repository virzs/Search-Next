import { baseDeleteRequest, baseDetailRequest, baseGetRequest, basePostRequest, basePutRequest } from "@/utils/axios";

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
  isEnabled: true;
  icon?: string;
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
