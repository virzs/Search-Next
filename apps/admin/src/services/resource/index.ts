import { baseDeleteRequest, baseGetRequest, basePostRequest, basePutRequest } from "@/utils/axios";
import { checkPath } from "@/utils/utils";
import axios from "axios";

export interface Resource {
  _id: string;
  name: string;
  key: string;
  mimetype: string;
  dir: string;
  size: number;
  url: string;
}

export interface DirectUploadTask {
  service: "local" | "qiniu" | "r2";
  method: "SERVER" | "POST" | "PUT";
  uploadUrl?: string;
  key?: string;
  name?: string;
  uploadToken?: string;
  headers?: Record<string, string>;
  fields?: Record<string, string>;
  expiresIn?: number;
}

export interface DirectUploadPayload {
  dir: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface CompleteDirectUploadPayload {
  uploadToken: string;
}

const resourceServerUpload = (
  dir: string,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
) => {
  return basePostRequest<Resource>(`/resource${checkPath(dir)}`, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  })({ file });
};

export const resourceCreateDirectUpload = (data: DirectUploadPayload) => {
  return basePostRequest<DirectUploadTask>("/resource/direct")(data);
};

export const resourceCompleteDirectUpload = (data: CompleteDirectUploadPayload) => {
  return basePostRequest<Resource>("/resource/direct/complete")(data);
};

export const resourceUpload = (
  dir: string,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
) =>
  resourceCreateDirectUpload({
    dir,
    filename: file.name,
    mimetype: file.type || "application/octet-stream",
    size: file.size,
  }).then(async (task) => {
    if (task.method === "SERVER" || task.service === "local") {
      return resourceServerUpload(dir, file, onUploadProgress);
    }

    if (!task.uploadUrl || !task.uploadToken) {
      throw new Error("Upload task is incomplete");
    }

    if (task.method === "PUT") {
      await axios.put(task.uploadUrl, file, {
        headers: task.headers,
        onUploadProgress,
      });
    }

    if (task.method === "POST") {
      const formData = new FormData();
      Object.entries(task.fields ?? {}).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);
      await axios.post(task.uploadUrl, formData, { onUploadProgress });
    }

    return resourceCompleteDirectUpload({
      uploadToken: task.uploadToken,
    });
  });

/**
 * @name 获取单个资源下载链接
 */
export const resourceDownload = (id: string) => {
  return baseGetRequest(`/resource/url/${id}`)();
};

/**
 * @name 批量获取资源下载链接
 */
export const resourceDownloadBatch = (ids: string[]) => {
  return basePostRequest("/resource/urls")({ ids });
};

/**
 * @name 获取资源列表 R2
 */
export const resourceR2List = (params: any) => {
  return baseGetRequest("/resource/r2")(params);
};

/**
 * @name 删除资源
 */
export const resourceDelete = (id: string) => {
  return baseDeleteRequest(`/resource`)(id);
};

/**
 * @name 获取资源列表 Qiniu
 */
export const resourceQiniuList = (params: any) => {
  return baseGetRequest("/resource/qiniu")(params);
};

/**
 * @name 获取资源列表 Local
 */
export const resourceLocalList = (params: any) => {
  return baseGetRequest("/resource/local")(params);
};

/**
 * @name 获取资源关联的所有数据
 * @description /resource/association/{id}
 */
export const resourceAssociation = (id: string) => {
  return baseGetRequest(`/resource/association/${id}`)();
};

/**
 * @name 获取资源详情
 */
export const resourceDetail = (id: string) => {
  return baseGetRequest(`/resource/objects/${id}`)();
};

/**
 * @name 批量上传
 */
export const resourceBatchUpload = (dir: string, files: File[]) => {
  return Promise.all(files.map((file) => resourceUpload(dir, file)));
};

/**
 * @name 回收站列表
 * @description /resource/recycle
 */
export const resourceRecycleList = (params: any) => {
  return baseGetRequest("/resource/recycle")(params);
};

/**
 * @name 彻底删除资源
 * @description /resource/recycle/{id}
 */
export const resourceRecycleDelete = (id: string) => {
  return baseDeleteRequest("/resource/recycle")(id);
};

/**
 * @name 恢复资源
 * @description /resource/recycle/restore/{id}
 */
export const resourceRestore = (id: string) => {
  return basePutRequest("/resource/recycle/restore")(id);
};
