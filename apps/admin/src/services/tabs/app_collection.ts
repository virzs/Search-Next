import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
} from "@/utils/axios";

export interface AppCollection {
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
  apps?: string[];
  type?: "static" | "dynamic";
  dynamic?: {
    classifyIds?: string[];
    sortBy?: "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    limit?: number;
  };
  updateIntervalSec?: number;
}

export async function getAppCollection(params: any) {
  return baseGetRequest("/tabs/app-collection")(params);
}

export async function addAppCollection(data: AppCollection) {
  return basePostRequest("/tabs/app-collection")(data);
}

export async function updateAppCollection(id: string, data: AppCollection) {
  return basePutRequest("/tabs/app-collection")(id, data);
}

export async function delAppCollection(id: string) {
  return baseDeleteRequest("/tabs/app-collection")(id);
}

export async function getAppCollectionDetail(id: string) {
  return baseDetailRequest("/tabs/app-collection")(id);
}

export async function previewAppCollectionDynamic(data: {
  dynamic: AppCollection["dynamic"];
}) {
  return basePostRequest("/tabs/app-collection/preview_dynamic")(data);
}
