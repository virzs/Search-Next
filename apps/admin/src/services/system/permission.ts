import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
} from "@/utils/axios";

// /system/permission/tree get
export async function getPermissionTree(params: any) {
  return baseGetRequest("/system/permission/tree")(params);
}

export interface PermissionListData {
  name: string;
  description: string;
  url: string;
  method: string;
  type: number;
  parent: string;
  level: number;
}

// /system/permission post
export async function addPermission(data: PermissionListData) {
  return basePostRequest("/system/permission")(data);
}

// /system/permission/{id} put
export async function updatePermission(id: string, data: PermissionListData) {
  return basePutRequest("/system/permission")(id, data);
}

// /system/permission/{id} delete
export async function deletePermission(id: string) {
  return baseDeleteRequest("/system/permission")(id);
}

// /system/permission/{id} detail
export async function getPermissionDetail(id: string) {
  return baseDetailRequest("/system/permission")(id);
}
