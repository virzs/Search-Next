import { baseGetRequest } from "@/utils/axios";

// /tabs/website/classify get
export const getTabsWebsiteClassify = (params = {}) => {
  return baseGetRequest("/tabs/website_classify/tree")(params);
};
