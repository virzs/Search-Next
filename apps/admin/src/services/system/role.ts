import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
} from "@/utils/axios";

export interface RoleRequest {
  _id?: string;
  code?: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
  isSuperAdmin?: boolean;
}

export const SYSTEM_ADMIN_ROLE_CODE = "system_admin";

// /system/role get
export async function getRole(params: any) {
  return baseGetRequest("/system/role")(params);
}

//   /system/role/list get
export async function getRoleList(params: any): Promise<RoleRequest[]> {
  return baseGetRequest("/system/role/list")(params);
}

// /system/role post
export async function postRole(params: RoleRequest) {
  return basePostRequest("/system/role")(params);
}

// /system/role/{id} put
export async function putRole(id: string, params: RoleRequest) {
  return basePutRequest("/system/role")(id, params);
}

// /system/role/{id} delete
export async function deleteRole(id: string) {
  return baseDeleteRequest("/system/role")(id);
}

// /system/role/{id} detail
export async function detailRole(id: string) {
  return baseDetailRequest("/system/role")(id);
}

// /system/role/permissions/{id} detail 权限仅id
export async function detailRolePermissions(id: string) {
  return baseDetailRequest("/system/role/permissions")(id);
}
