export type DesktopConfigWallpaperType =
  | 'image'
  | 'gradient'
  | 'application'
  | 'none';

export type DesktopConfigWallpaper = {
  type: DesktopConfigWallpaperType;
  url?: string;
  css?: string;
  id?: string;
  revision?: string;
  previewUrl?: string;
  name: string;
};

export type DesktopConfigPersonalization = {
  themeId: string;
  wallpaper: DesktopConfigWallpaper;
};

export type DesktopConfigListItem = {
  id: string;
  type: string;
  dataType?: string;
  config?: Record<string, any>;
  data?: Record<string, any>;
  children?: DesktopConfigListItem[];
};

export type DesktopConfigJson = {
  personalization?: DesktopConfigPersonalization;
  list: DesktopConfigListItem[];
};
