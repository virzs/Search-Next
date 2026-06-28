import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
} from "@/utils/axios";
import type { ProviderModel } from "./models";

export interface Provider {
  _id: string;
  name: string;
  displayName: string;
  type: string;
  baseUrl?: string;
  apiKeyPreview?: string;
  testModel?: string;
  priority?: number;
  timeoutMs?: number;
  enabled: boolean;
  description: string;
  lastTestedAt?: string;
  lastTestStatus?: string;
  lastTestMessage?: string;
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
  type?: string;
  baseUrl?: string;
  apiKey?: string;
  testModel?: string;
  priority?: number;
  timeoutMs?: number;
  enabled: boolean;
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

export const getProviderOptions = async () => {
  return baseGetRequest<Provider[]>("/ai/providers/options")({});
};

export const testProvider = (id: string, data?: Partial<AddProviderData>) =>
  basePostRequest(`/ai/providers/${id}/test`)(data);

export const syncProviderModels = (id: string, data?: Partial<AddProviderData>) =>
  basePostRequest(`/ai/providers/${id}/models/sync`)(data);

export interface SaveProviderModelData {
  publicModel: string;
  upstreamModel: string;
  priority?: number;
  enabled?: boolean;
  tag?: "official" | "proxy";
  costInputPricePer1K?: number;
  costOutputPricePer1K?: number;
}

export const getProviderModelsByProvider = (providerId: string) =>
  baseGetRequest<ProviderModel[]>(`/ai/providers/${providerId}/models`)({});

export const addProviderModel = (providerId: string, data: SaveProviderModelData) =>
  basePostRequest(`/ai/providers/${providerId}/models`)(data);

export const updateProviderModel = (providerId: string, providerModelId: string, data: SaveProviderModelData) =>
  basePutRequest(`/ai/providers/${providerId}/models`)(providerModelId, data);

export const deleteProviderModel = (providerId: string, providerModelId: string) =>
  baseDeleteRequest(`/ai/providers/${providerId}/models`)(providerModelId);
