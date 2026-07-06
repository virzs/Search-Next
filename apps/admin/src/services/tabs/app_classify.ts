import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";

export interface AppClassify {
  name: string;
  description?: string;
  icon?: any;
  enable: boolean;
  sortOrder?: number;
}

// /tabs/app-classify get
export async function getAppClassify(params: any) {
  return baseGetRequest("/tabs/app-classify")(params);
}

// /tabs/app-classify post
export async function addAppClassify(data: AppClassify) {
  return basePostRequest("/tabs/app-classify")(data);
}

// /tabs/app-classify/{id} put
export async function updateAppClassify(id: string, data: AppClassify) {
  return basePutRequest("/tabs/app-classify")(id, data);
}

// /tabs/app-classify/{id} delete
export async function delAppClassify(id: string) {
  return baseDeleteRequest("/tabs/app-classify")(id);
}

// /tabs/app-classify/{id} detail
export async function getAppClassifyDetail(id: string) {
  return baseDetailRequest("/tabs/app-classify")(id);
}

// /tabs/app-classify/{id}/enable put
export async function updateAppClassifyEnable(id: string) {
  return basePutRequestNoId(`/tabs/app-classify/${id}/enable`)({});
}

// /tabs/app-classify get
export async function getAllAppClassify(params: any) {
  return baseGetRequest("/tabs/app-classify/all")(params);
}
