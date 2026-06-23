import { baseGetRequest, basePostRequest, basePutRequestNoId } from "@/utils/axios";

export interface DesktopUserLimit {
  defaultMaxConfigs: number;
  defaultMaxPages: number;
  roleConfigs: {
    role: string;
    maxConfigs: number;
    maxPages: number;
  }[];
  description?: string;
}

export interface DesktopUserLimitResponse extends Omit<DesktopUserLimit, "roleConfigs"> {
  roleConfigs: {
    role: {
      _id: string;
      name: string;
    };
    maxConfigs: number;
    maxPages: number;
  }[];
}

/**
 * 获取用户配置限制
 * @param params
 * @returns
 */
export const getDesktopUserLimit = (params: any) => {
  return baseGetRequest<DesktopUserLimitResponse>("/tabs/desktop/user-limit")(params);
};

/**
 * 创建用户配置限制
 * @param params
 * @returns
 */
export const createOrUpdateDesktopUserLimit = (params: DesktopUserLimit) => {
  return basePostRequest<DesktopUserLimitResponse>("/tabs/desktop/user-limit")(params);
};

/**
 * 更新用户配置限制
 * @param params
 * @returns
 */
export const updateDesktopUserLimit = (params: DesktopUserLimit) => {
  return basePutRequestNoId<DesktopUserLimitResponse>("/tabs/desktop/user-limit")(params);
};
