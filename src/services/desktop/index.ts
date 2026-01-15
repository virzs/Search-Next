import { baseGetRequest } from "@/utils/axios";
import { DesktopListItem, DesktopTheme } from "zs_library";

export interface DefaultUserConfig {
  config: {
    list: DesktopListItem[];
  };
}

/**
 * 获取默认用户配置
 * @returns
 */
export const getDefaultUserConfig = () => {
  return baseGetRequest<DefaultUserConfig>(
    "/tabs/desktop/config/user/default",
  )();
};

export interface UserLimit {
  maxConfigs: number;
  maxPages: number;
  source: string;
}

/**
 * 获取当前用户配置限制
 */
export const getUserLimit = () => {
  return baseGetRequest<UserLimit>("/tabs/desktop/user-limit/public")();
};

export interface ThemeConfigApiItem {
  _id: string;
  name: string;
  description?: string;
  lightConfig: DesktopTheme;
  darkConfig?: DesktopTheme;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * 获取所有主题
 */
export const getActiveThemeConfigs = () => {
  return baseGetRequest<ThemeConfigApiItem[]>(
    "/tabs/desktop/theme-config/active",
  )();
};
