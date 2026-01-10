import { baseGetRequest } from "@/utils/axios";
import { BasePageParams } from "../types";

// /tabs/website/classify get
export const getTabsWebsiteClassify = (params = {}) => {
  return baseGetRequest("/tabs/website_classify/tree")(params);
};

export interface WebsitePublicParams extends BasePageParams {
  classify?: string;
  tags?: string[];
  search?: string;
}

// /tabs/website/public get
export const getTabsWebsitePublic = (params = {}) => {
  return baseGetRequest("/tabs/website/public")(params);
};

export interface WebsiteCollectionPublicItem {
  _id: string;
  title: string;
  description?: string;
  enable: boolean;
  effectiveStart?: string | null;
  effectiveEnd?: string | null;
  sort?: number;
  websites?: any[];
}

// /tabs/website_collection/public/list get
export const getTabsWebsiteCollectionPublicList = (params = {}) => {
  return baseGetRequest<WebsiteCollectionPublicItem[]>("/tabs/website_collection/public/list")(params);
};

// /tabs/website_collection/public/:id/websites get
export const getTabsWebsiteCollectionPublicWebsitesPage = (id: string, params = {}) => {
  return baseGetRequest(`/tabs/website_collection/public/${id}/websites`)(params);
};
