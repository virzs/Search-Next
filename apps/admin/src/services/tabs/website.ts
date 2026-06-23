import {
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
  baseDeleteRequest,
  baseDetailRequest,
} from "@/utils/axios";

// /tabs/website
export async function getWebsiteList(params: any) {
  return baseGetRequest("/tabs/website")(params);
}

// /tabs/website post
export async function addWebsite(data: any) {
  return basePostRequest("/tabs/website")(data);
}

// /tabs/website/:id put
export async function updateWebsite(id: string, data: any) {
  return basePutRequest("/tabs/website")(id, data);
}

// /tabs/website/:id delete
export async function deleteWebsite(id: string) {
  return baseDeleteRequest("/tabs/website")(id);
}

// /tabs/website/:id get
export async function getWebsiteDetail(id: string) {
  return baseDetailRequest("/tabs/website")(id);
}

interface ParseWebsiteData {
  url: string;
  ignoreCache?: boolean;
}

export interface ParseWebsiteResponse {
  title?: string;
  description?: string;
  icon?: string;
  isCache?: boolean;
  icons?: string[];
}

//tabs/website/parse post
export async function parseWebsite(data: ParseWebsiteData) {
  return basePostRequest<ParseWebsiteResponse>("/tabs/website/parse")(data);
}

interface UpdateWebsitePublicData {
  ids: string[];
  isPublic: boolean;
}

// /tabs/website/public put
export async function updateWebsitePublic(data: UpdateWebsitePublicData) {
  return basePutRequestNoId("/tabs/website/public")(data);
}
