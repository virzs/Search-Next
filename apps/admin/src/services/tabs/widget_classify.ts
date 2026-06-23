import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";

export interface WidgetClassify {
  name: string;
  description?: string;
  icon?: any;
  enable: boolean;
  parent?: string;
}

// /tabs/widget-classify get
export async function getWidgetClassify(params: any) {
  return baseGetRequest("/tabs/widget-classify")(params);
}

// /tabs/widget-classify post
export async function addWidgetClassify(data: WidgetClassify) {
  return basePostRequest("/tabs/widget-classify")(data);
}

// /tabs/widget-classify/{id} put
export async function updateWidgetClassify(id: string, data: WidgetClassify) {
  return basePutRequest("/tabs/widget-classify")(id, data);
}

// /tabs/widget-classify/{id} delete
export async function delWidgetClassify(id: string) {
  return baseDeleteRequest("/tabs/widget-classify")(id);
}

// /tabs/widget-classify/{id} detail
export async function getWidgetClassifyDetail(id: string) {
  return baseDetailRequest("/tabs/widget-classify")(id);
}

// /tabs/widget-classify/{id}/enable put
export async function updateWidgetClassifyEnable(id: string) {
  return basePutRequestNoId(`/tabs/widget-classify/${id}/enable`)({});
}

// /tabs/widget-classify get
export async function getAllWidgetClassify(params: any) {
  return baseGetRequest("/tabs/widget-classify/all")(params);
}
