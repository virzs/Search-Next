import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";
import { getApiPrefix } from "@/utils/utils";
import { getToken } from "@/utils/token";

const normalizeSearchToQ = (params: any) => {
  if (!params || typeof params !== "object") return params;
  if (params.search !== undefined && params.q === undefined) {
    const { search, ...rest } = params;
    return { ...rest, q: search };
  }
  return params;
};

export interface DesktopWallpaperCategory {
  _id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  creator?: any;
  updater?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const getDesktopWallpaperCategories = (params: any) => {
  return baseGetRequest("/tabs/desktop/wallpaper/category")(
    normalizeSearchToQ(params),
  );
};

export const getEnabledDesktopWallpaperCategories = () => {
  return baseGetRequest("/tabs/desktop/wallpaper/category/admin/enabled")({});
};

export const createDesktopWallpaperCategory = (
  params: DesktopWallpaperCategory,
) => {
  return basePostRequest("/tabs/desktop/wallpaper/category")(params);
};

export const updateDesktopWallpaperCategory = (
  id: string,
  params: DesktopWallpaperCategory,
) => {
  return basePutRequest("/tabs/desktop/wallpaper/category")(id, params);
};

export const deleteDesktopWallpaperCategory = (id: string) => {
  return baseDeleteRequest("/tabs/desktop/wallpaper/category")(id);
};

export const getDesktopWallpaperCategoryDetail = (id: string) => {
  return baseDetailRequest("/tabs/desktop/wallpaper/category")(id);
};

export const toggleDesktopWallpaperCategory = (id: string) => {
  return basePutRequestNoId(`/tabs/desktop/wallpaper/category/${id}/toggle`)(
    {},
  );
};

export interface DesktopWallpaperSource {
  _id?: string;
  name: string;
  description?: string;
  request: any;
  response: any;
  cache?: any;
  isActive?: boolean;
  sortOrder?: number;
  creator?: any;
  updater?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface DesktopResource {
  _id: string;
  name: string;
  key: string;
  mimetype: string;
  dir: string;
  size: number;
  url: string;
}

export interface DesktopWallpaper {
  _id?: string;
  type?: "image" | "application";
  image?: string | DesktopResource;
  thumbnail?: string | DesktopResource;
  application?: {
    packageName: string;
    version: string;
    entry: string;
    preview: string;
    author?: string;
    projectUrl?: string;
    description?: string;
    revision: string;
  };
  name?: string;
  description?: string;
  author?: string;
  url?: string;
  categoryId?: string | DesktopWallpaperCategory | null;
  isActive?: boolean;
  sortOrder?: number;
  creator?: any;
  updater?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationWallpaperPayload {
  file?: File;
  name?: string;
  description?: string;
  author?: string;
  url?: string;
  categoryId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

const requestApplicationWallpaper = async (
  method: "POST" | "PUT",
  path: string,
  payload: ApplicationWallpaperPayload,
) => {
  const form = new FormData();
  if (payload.file) form.append("file", payload.file);
  if (payload.name !== undefined) form.append("name", payload.name);
  if (payload.description !== undefined) {
    form.append("description", payload.description);
  }
  if (payload.author !== undefined) form.append("author", payload.author);
  if (payload.url !== undefined) form.append("url", payload.url);
  if (payload.categoryId !== undefined) {
    form.append("categoryId", payload.categoryId ?? "");
  }
  if (payload.isActive !== undefined) {
    form.append("isActive", String(payload.isActive));
  }
  if (payload.sortOrder !== undefined) {
    form.append("sortOrder", String(payload.sortOrder));
  }

  const response = await fetch(getApiPrefix(path), {
    method,
    headers: { authorization: `Bearer ${getToken() ?? ""}` },
    body: form,
  });
  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(data?.message || data?.msg || "网页壁纸保存失败");
  }
  return (data?.data ?? data) as DesktopWallpaper;
};

export const createApplicationWallpaper = (
  payload: ApplicationWallpaperPayload,
) =>
  requestApplicationWallpaper(
    "POST",
    "/tabs/desktop/wallpaper/upload/application",
    payload,
  );

export const updateApplicationWallpaper = (
  id: string,
  payload: ApplicationWallpaperPayload,
) =>
  requestApplicationWallpaper(
    "PUT",
    `/tabs/desktop/wallpaper/upload/${id}/application`,
    payload,
  );

export const getApplicationWallpaperPreviewUrl = (
  wallpaper: DesktopWallpaper | null | undefined,
) => {
  if (!wallpaper?._id || !wallpaper.application?.revision) return null;
  return getApiPrefix(
    `/tabs/desktop/wallpaper/runtime/${wallpaper._id}/${wallpaper.application.revision}/preview`,
  );
};

export const getApplicationWallpaperEntryUrl = (
  wallpaper: DesktopWallpaper | null | undefined,
) => {
  if (!wallpaper?._id || !wallpaper.application?.revision) return null;
  return getApiPrefix(
    `/tabs/desktop/wallpaper/runtime/${wallpaper._id}/${wallpaper.application.revision}/entry`,
  ).replace(/\/$/, "");
};

export const getDesktopWallpapers = (params: any) => {
  return baseGetRequest("/tabs/desktop/wallpaper/upload")(
    normalizeSearchToQ(params),
  );
};

export const createDesktopWallpaper = (params: DesktopWallpaper) => {
  return basePostRequest("/tabs/desktop/wallpaper/upload")(params);
};

export const updateDesktopWallpaper = (
  id: string,
  params: DesktopWallpaper,
) => {
  return basePutRequest("/tabs/desktop/wallpaper/upload")(id, params);
};

export const deleteDesktopWallpaper = (id: string) => {
  return baseDeleteRequest("/tabs/desktop/wallpaper/upload")(id);
};

export const getDesktopWallpaperDetail = (id: string) => {
  return baseDetailRequest("/tabs/desktop/wallpaper/upload")(id);
};

export const toggleDesktopWallpaper = (id: string) => {
  return basePutRequestNoId(`/tabs/desktop/wallpaper/upload/${id}/toggle`)({});
};
