import {
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
  baseDeleteRequest,
  baseDetailRequest,
} from "@/utils/axios";

export interface WebsiteImportErrorItem {
  index: number;
  key?: string;
  message: string;
}

export interface WebsiteImportResult {
  total: number;
  created: number;
  updated: number;
  restored: number;
  failed: number;
  errors: WebsiteImportErrorItem[];
}

export interface WebsiteExportItem {
  name: string;
  url: string;
  description?: string;
  enable?: boolean;
  public?: boolean;
  themeColor?: string;
}

export interface WebsiteExportPackage {
  schemaVersion: 1;
  type: "website";
  exportedAt: string;
  items: WebsiteExportItem[];
}

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

// /tabs/website/export get
export async function exportWebsite() {
  return baseGetRequest<WebsiteExportPackage>("/tabs/website/export")();
}

// /tabs/website/import post
export async function importWebsite(data: unknown) {
  return basePostRequest<WebsiteImportResult>("/tabs/website/import")(
    data as object,
  );
}
