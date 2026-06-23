import { baseDeleteRequest, baseGetRequest, basePostRequest } from "@/utils/axios";

/**
 * 获取当前用户的API Key列表
 * /ai/user-api-keys
 */
export const getUserApiKeyList = async (params: any) => {
  return baseGetRequest("/ai/user-api-keys")(params);
};

export interface AddUserApiKeyData {
  provider: string;
  apiKey: string;
}

/**
 * 添加API Key
 * /ai/user-api-keys
 */
export const addUserApiKey = async (data: any) => {
  return basePostRequest("/ai/user-api-keys")(data);
};

/**
 * 删除API Key
 * /ai/user-api-keys/{provider}
 */
export const deleteUserApiKey = async (provider: string) => {
  return baseDeleteRequest("/ai/user-api-keys")(provider);
};
