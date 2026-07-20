import { baseGetRequest, basePostRequest, basePutRequest } from "@/utils/axios";
import type { Resource } from "@/services/resource";

export const DEFAULT_PROJECT_THEME_COLOR = "rgb(250, 84, 28)";

export interface ProjectSiteConfig {
  icon?: Resource;
  themeColor: string;
}

export interface ProjectData {
  _id?: string;
  name: string;
  description?: string;
  login?: {
    title?: string;
    subTitle?: string;
    background?: {
      url?: string;
    };
  };
  register?: {
    title?: string;
    subTitle?: string;
    allowRegister?: boolean;
    registerDisabledTip?: string;
    forceInvitationCode?: boolean;
    forceEmailCaptcha?: boolean;
  };
  turnstile?: {
    enabled?: boolean;
    siteKey?: string;
    secretKey?: string;
  };
  adminAccess?: {
    loginRoleIds?: string[];
  };
  release?: {
    repositoryUrl?: string;
  };
  site?: ProjectSiteConfig;
}

export type ProjectPublicData = Pick<
  ProjectData,
  "name" | "description" | "login" | "register" | "turnstile" | "site"
>;

// detail
// /system/project
export async function getProject(params: Record<string, unknown> = {}) {
  return baseGetRequest<ProjectData>("/system/project")(params);
}

// post
// /system/project
export async function addProject(data: ProjectData) {
  return basePostRequest("/system/project")(data);
}

// put
// /system/project/{id}
export async function updateProject(id: string, data: ProjectData) {
  return basePutRequest("/system/project")(id, data);
}

// get
// /system/project/public
export async function getPublicProject(params: Record<string, unknown> = {}) {
  return baseGetRequest<ProjectPublicData>("/system/project/public")(params);
}
