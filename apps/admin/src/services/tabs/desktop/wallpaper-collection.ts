import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
} from "@/utils/axios";
import type { DesktopWallpaper } from "./wallpaper";

export interface DesktopWallpaperCollection {
  _id?: string;
  title: string;
  description?: string;
  kicker?: string;
  cover?: any;
  accentColor?: string;
  layout?: "story" | "compact";
  featured?: boolean;
  itemLimit?: number;
  enable?: boolean;
  effectiveStart?: string;
  effectiveEnd?: string;
  sort?: number;
  wallpapers?: Array<string | DesktopWallpaper>;
  type?: "static" | "dynamic";
  dynamic?: {
    categoryIds?: string[];
    wallpaperTypes?: Array<"image" | "gradient" | "application">;
    sortBy?: "createdAt" | "updatedAt" | "sortOrder";
    sortOrder?: "asc" | "desc";
    limit?: number;
  };
  updateIntervalSec?: number;
  creator?: any;
  updater?: any;
  createdAt?: string;
  updatedAt?: string;
}

const basePath = "/tabs/desktop/wallpaper/collection";

export const getDesktopWallpaperCollections = (params: any) =>
  baseGetRequest(basePath)(params);

export const createDesktopWallpaperCollection = (
  data: DesktopWallpaperCollection,
) => basePostRequest(basePath)(data);

export const updateDesktopWallpaperCollection = (
  id: string,
  data: DesktopWallpaperCollection,
) => basePutRequest(basePath)(id, data);

export const deleteDesktopWallpaperCollection = (id: string) =>
  baseDeleteRequest(basePath)(id);

export const getDesktopWallpaperCollectionDetail = (id: string) =>
  baseDetailRequest(basePath)(id);

export const previewDesktopWallpaperCollectionDynamic = (data: {
  dynamic: DesktopWallpaperCollection["dynamic"];
}) => basePostRequest(`${basePath}/preview_dynamic`)(data);
