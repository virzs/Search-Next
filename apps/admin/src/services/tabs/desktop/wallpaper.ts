import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";

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
  image: string | DesktopResource;
  name?: string;
  description?: string;
  categoryId?: string | DesktopWallpaperCategory | null;
  isActive?: boolean;
  sortOrder?: number;
  creator?: any;
  updater?: any;
  createdAt?: string;
  updatedAt?: string;
}

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
