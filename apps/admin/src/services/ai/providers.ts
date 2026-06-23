import { baseDeleteRequest, baseDetailRequest, baseGetRequest, basePostRequest, basePutRequest } from "@/utils/axios";

export interface Provider {
  _id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  defaultModel: string;
  enabled: boolean;
  supportedModels: string[];
  description: string;
}

/**
 * 服务商列表
 * /ai/providers
 */

export async function getProvidersList(params: any) {
  return baseGetRequest("/ai/providers")(params);
}

export interface AddProviderData {
  name: string;
  displayName: string;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  enabled: boolean;
  supportedModels: string[];
  description: string;
}

/**
 * 新增
 * /ai/providers post
 */

export async function addProvider(data: AddProviderData) {
  return basePostRequest("/ai/providers")(data);
}

/**
 * 修改
 * /ai/providers/:id put
 */

export async function updateProvider(id: string, data: AddProviderData) {
  return basePutRequest("/ai/providers")(id, data);
}

/**
 * 删除
 * /ai/providers/:id delete
 */
export async function deleteProvider(id: string) {
  return baseDeleteRequest("/ai/providers")(id);
}

/**
 * 详情
 * /ai/providers/:id get
 */
export async function getProviderDetail(id: string) {
  return baseDetailRequest("/ai/providers")(id);
}

/**
 * 获取可用的服务商列表
 * /ai/providers/available
 */
export const getAvailableProviders = async () => {
  return baseGetRequest<Provider[]>("/ai/providers/available")({});
};
