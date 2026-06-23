import {
  baseDeleteRequest,
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  basePutRequestNoId,
} from "@/utils/axios";
import { DesktopTheme } from "zs_library";

export interface DesktopThemeCategory {
  _id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface DesktopThemeConfig {
  _id?: string;
  name: string;
  description?: string;
  lightConfig: DesktopTheme;
  darkConfig?: DesktopTheme;
  previewImages?: string[];
  categoryId?: string | DesktopThemeCategory;
}

export const getDesktopThemeConfig = (params: any) => {
  return baseGetRequest("/tabs/desktop/theme-config")(params);
};

export const createDesktopThemeConfig = (params: DesktopThemeConfig) => {
  return basePostRequest("/tabs/desktop/theme-config")(params);
};

export const updateDesktopThemeConfig = (id: string, params: DesktopThemeConfig) => {
  return basePutRequest("/tabs/desktop/theme-config")(id, params);
};

export const deleteDesktopThemeConfig = (id: string) => {
  return baseDeleteRequest("/tabs/desktop/theme-config")(id);
};

export const getDesktopThemeConfigDetail = (id: string) => {
  return baseDetailRequest("/tabs/desktop/theme-config")(id);
};

export const toggleDesktopThemeConfig = (id: string) => {
  return basePutRequestNoId(`/tabs/desktop/theme-config/${id}/toggle`)({});
};

export const getActiveDesktopThemeConfig = () => {
  return baseGetRequest<DesktopThemeConfig[]>("/tabs/desktop/theme-config/active")({});
};

export const getDesktopThemeCategory = (params: any) => {
  return baseGetRequest("/tabs/desktop/theme-config-category")(params);
};

export const createDesktopThemeCategory = (params: DesktopThemeCategory) => {
  return basePostRequest("/tabs/desktop/theme-config-category")(params);
};

export const updateDesktopThemeCategory = (id: string, params: DesktopThemeCategory) => {
  return basePutRequest("/tabs/desktop/theme-config-category")(id, params);
};

export const deleteDesktopThemeCategory = (id: string) => {
  return baseDeleteRequest("/tabs/desktop/theme-config-category")(id);
};

export const getDesktopThemeCategoryDetail = (id: string) => {
  return baseDetailRequest("/tabs/desktop/theme-config-category")(id);
};

export const toggleDesktopThemeCategory = (id: string) => {
  return basePutRequestNoId(`/tabs/desktop/theme-config-category/${id}/toggle`)({});
};
