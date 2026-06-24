import { baseGetRequest, basePostRequest, basePutRequest } from "@/utils/axios";

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
}

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
  return baseGetRequest<ProjectData>("/system/project/public")(params);
}
