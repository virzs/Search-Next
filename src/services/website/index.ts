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
