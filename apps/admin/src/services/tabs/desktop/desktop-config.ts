import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";

// tabs/desktop/config/admin
export const getDesktopAdminConfig = (params: any) => {
  return baseGetRequest("/tabs/desktop/config/admin")(params);
};

export const postDesktopAdminConfig = (data: any) => {
  return basePostRequest("/tabs/desktop/config/admin")(data);
};

export const putDesktopAdminConfig = (id: string, data: any) => {
  return basePutRequest("/tabs/desktop/config/admin")(id, data);
};

export const deleteDesktopAdminConfig = (id: string) => {
  return baseDeleteRequest("/tabs/desktop/config/admin")(id);
};

export const detailDesktopAdminConfig = (id: string) => {
  return baseDetailRequest("/tabs/desktop/config/admin")(id);
};

export const putDesktopAdminConfigActive = (id: string) => {
  return basePutRequestNoId(`/tabs/desktop/config/admin/${id}/active`)({});
};
