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
  previewImages?: Array<{ url?: string } | string>;
  lightConfig: DesktopTheme;
  darkConfig?: DesktopTheme;
  sortOrder?: number;
  isActive?: boolean;
}

const toAbsUrl = (entry: string) => {
  if (!entry) return entry;
  if (entry.startsWith("http://") || entry.startsWith("https://")) return entry;
  if (entry.startsWith("//")) return `${window.location.protocol}${entry}`;
  return new URL(entry, window.location.origin).href;
};

export const getThemePreviewImageUrl = (
  theme: ThemeConfigApiItem | null | undefined,
  index = 0,
): string | null => {
  const image = theme?.previewImages?.[index];
  if (!image) return null;
  const url = typeof image === "string" ? image : image?.url;
  if (!url || typeof url !== "string") return null;
  return toAbsUrl(url);
};

export const resolveDesktopThemeFromConfigs = (
  configs: ThemeConfigApiItem[] | null | undefined,
  themeId: string | null | undefined,
  preferDark: boolean,
): DesktopTheme | null => {
  const items = configs ?? [];
  const active = (themeId ? items.find((t) => t._id === themeId) : null) ?? items[0] ?? null;
  if (!active) return null;
  if (preferDark && active.darkConfig) return active.darkConfig;
  return active.lightConfig;
};

/**
 * 获取所有主题
 */
export const getActiveThemeConfigs = () => {
  return baseGetRequest<ThemeConfigApiItem[]>(
    "/tabs/desktop/theme-config/active",
  )();
};
