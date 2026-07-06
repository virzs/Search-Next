import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
} from "@/utils/axios";

export interface WebsiteCollection {
  title: string;
  description?: string;
  kicker?: string;
  cover?: any;
  accentColor?: string;
  layout?: "story" | "compact";
  featured?: boolean;
  itemLimit?: number;
  enable?: boolean;
  effectiveStart?: string;
  effectiveEnd?: string;
  sort?: number;
  websites?: string[];
  type?: "static" | "dynamic";
  dynamic?: {
    classifyIds?: string[];
    tags?: string[];
    sortBy?: "createdAt" | "updatedAt" | "click";
    sortOrder?: "asc" | "desc";
    limit?: number;
  };
  updateIntervalSec?: number;
}

export async function getWebsiteCollection(params: any) {
  return baseGetRequest("/tabs/website_collection")(params);
}

export async function addWebsiteCollection(data: WebsiteCollection) {
  return basePostRequest("/tabs/website_collection")(data);
}

export async function updateWebsiteCollection(id: string, data: WebsiteCollection) {
  return basePutRequest("/tabs/website_collection")(id, data);
}

export async function delWebsiteCollection(id: string) {
  return baseDeleteRequest("/tabs/website_collection")(id);
}

export async function getWebsiteCollectionDetail(id: string) {
  return baseDetailRequest("/tabs/website_collection")(id);
}

export async function previewWebsiteCollectionDynamic(data: { dynamic: WebsiteCollection["dynamic"] }) {
  return basePostRequest("/tabs/website_collection/preview_dynamic")(data);
}
