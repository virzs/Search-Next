import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
} from "@/utils/axios";

export interface WebsiteTag {
  name: string;
  description?: string;
  icon?: any;
  sort: number;
  enable: boolean;
  websites: string[];
}

// /tabs/website_tag get
export async function getWebsiteTag(params: any) {
  return baseGetRequest("/tabs/website_tag")(params);
}

// /tabs/website_tag post
export async function addWebsiteTag(data: WebsiteTag) {
  return basePostRequest("/tabs/website_tag")(data);
}

// /tabs/website_tag/{id} put
export async function updateWebsiteTag(id: string, data: WebsiteTag) {
  return basePutRequest("/tabs/website_tag")(id, data);
}

// /tabs/website_tag/{id} delete
export async function delWebsiteTag(id: string) {
  return baseDeleteRequest("/tabs/website_tag")(id);
}

// /tabs/website_tag/{id} detail
export async function getWebsiteTagDetail(id: string) {
  return baseDetailRequest("/tabs/website_tag")(id);
}

// /tabs/website_tag/search get
export async function searchWebsiteTag(params: { search: string }) {
  return baseGetRequest("/tabs/website_tag/search")(params);
}

// /tabs/website_tag/quick post
export async function quickCreateWebsiteTag(data: { name: string }) {
  return basePostRequest("/tabs/website_tag/quick")(data);
}