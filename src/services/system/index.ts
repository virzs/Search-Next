import { baseGetRequest } from "@/utils/axios";

export interface ProjectPublicInfo {
  name: string;
  description?: string;
  register?: {
    forceInvitationCode: boolean;
    allowRegister: boolean;
    registerDisabledTip?: string;
  };
}

/**
 * 获取项目公共信息
 * @returns
 */
export const getProjectPublicInfo = () => {
  return baseGetRequest<ProjectPublicInfo>("/system/project/public")();
};
