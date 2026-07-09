import { baseGetRequest } from "@/utils/axios";

export interface ProjectPublicInfo {
  name: string;
  description?: string;
  register?: {
    forceEmailCaptcha?: boolean;
    forceInvitationCode: boolean;
    allowRegister: boolean;
    registerDisabledTip?: string;
  };
  turnstile?: {
    enabled?: boolean;
    siteKey?: string;
  };
}

/**
 * 获取项目公共信息
 * @returns
 */
export const getProjectPublicInfo = () => {
  return baseGetRequest<ProjectPublicInfo>("/system/project/public")();
};

export interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  effectiveStart: string;
  effectiveEnd: string;
}

/**
 * 获取公告
 */
export const getNotice = () => {
  return baseGetRequest<NoticeItem[]>("/system/notice/public/list")({
    key: "tabs",
  });
};
