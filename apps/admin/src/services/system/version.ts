import {
  baseDeleteRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  baseDetailRequest,
} from "@/utils/axios";

// /system/version get
export async function getVersion(params: any) {
  return baseGetRequest("/system/version")(params);
}

// /system/version post
export async function postVersion(params: any) {
  return basePostRequest("/system/version")(params);
}

// /system/version put
export async function putVersion(id: string, params: any) {
  return basePutRequest("/system/version")(id, params);
}

// /system/version delete
export async function deleteVersion(id: string) {
  return baseDeleteRequest("/system/version")(id);
}

// /system/version/{id} detail
export async function detailVersion(id: string) {
  return baseDetailRequest("/system/version")(id);
}

//system/version/latest get
export async function getLatestVersion(params: any) {
  return baseGetRequest("/system/version/latest")(params);
}
