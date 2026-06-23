export type DesktopConfigWallpaperType = 'image' | 'gradient' | 'none';

export type DesktopConfigWallpaper = {
  type: DesktopConfigWallpaperType;
  url?: string;
  css?: string;
  name: string;
};

export type DesktopConfigPersonalization = {
  themeId: string;
  wallpaper: DesktopConfigWallpaper;
};

export type DesktopConfigListItem = {
  id: string;
  type: string;
  config?: Record<string, any>;
  data?: Record<string, any>;
  children?: DesktopConfigListItem[];
};

export type DesktopConfigJson = {
  personalization?: DesktopConfigPersonalization;
  list: DesktopConfigListItem[];
};
