import type { ThemeConfigApiItem } from "@/services/desktop";
import {
  MY_THEMES_STORAGE_KEY,
  MY_WALLPAPERS_STORAGE_KEY,
} from "@/utils/storage";

export const MY_WALLPAPERS_CHANGED_EVENT =
  "search-next:my-wallpapers-changed";
export const MY_THEMES_CHANGED_EVENT = "search-next:my-themes-changed";

export type MyWallpaperItem =
  | {
      id: string;
      type: "gradient";
      name: string;
      css: string;
      createdAt: string;
    }
  | {
      id: string;
      type: "image";
      name: string;
      url: string;
      createdAt: string;
    };

export type MyThemeItem = {
  id: string;
  name: string;
  description?: string;
  lightBackground: string;
  darkBackground: string;
  accentColor: string;
  createdAt: string;
  updatedAt?: string;
};

type StorageV1<T> = {
  version: 1;
  items: T[];
};

const parseStorageItems = <T,>(raw: string | null): T[] => {
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object") return [];
  const record = parsed as Record<string, unknown>;
  if (record.version !== 1) return [];
  const items = record.items;
  if (!Array.isArray(items)) return [];
  return items.filter(Boolean) as T[];
};

const stringifyStorageItems = <T,>(items: T[]) => {
  const payload: StorageV1<T> = { version: 1, items };
  return JSON.stringify(payload);
};

export const readMyWallpapers = (): MyWallpaperItem[] => {
  try {
    return parseStorageItems<MyWallpaperItem>(
      localStorage.getItem(MY_WALLPAPERS_STORAGE_KEY),
    );
  } catch {
    return [];
  }
};

export const writeMyWallpapers = (items: MyWallpaperItem[]) => {
  try {
    localStorage.setItem(MY_WALLPAPERS_STORAGE_KEY, stringifyStorageItems(items));
  } catch {
    void 0;
  }
  window.dispatchEvent(new Event(MY_WALLPAPERS_CHANGED_EVENT));
};

export const readMyThemes = (): MyThemeItem[] => {
  try {
    return parseStorageItems<MyThemeItem>(
      localStorage.getItem(MY_THEMES_STORAGE_KEY),
    );
  } catch {
    return [];
  }
};

export const writeMyThemes = (items: MyThemeItem[]) => {
  try {
    localStorage.setItem(MY_THEMES_STORAGE_KEY, stringifyStorageItems(items));
  } catch {
    void 0;
  }
  window.dispatchEvent(new Event(MY_THEMES_CHANGED_EVENT));
};

export const toMyThemeConfig = (theme: MyThemeItem): ThemeConfigApiItem => {
  const makeConfig = (backgroundColor: string, preferDark = false) => {
    const textColor = preferDark ? "rgba(255,255,255,0.86)" : "rgba(0,0,0,0.82)";
    const borderColor = preferDark
      ? "rgba(255,255,255,0.15)"
      : "rgba(0,0,0,0.10)";
    const hoverColor = preferDark
      ? "rgba(255,255,255,0.10)"
      : "rgba(0,0,0,0.06)";

    return {
      token: {
        base: {
          backgroundColor,
          hoverColor,
          dangerColor: "#ff3b30",
          textColor,
          shadowColor: preferDark
            ? "rgba(0,0,0,0.42)"
            : "rgba(0,0,0,0.14)",
          boxShadowBorderColor: borderColor,
          borderColor,
          backdropFilter: "blur(28px)",
        },
        dock: {
          backgroundColor: preferDark
            ? "rgba(28,28,30,0.62)"
            : "rgba(255,255,255,0.62)",
          borderColor,
          boxShadowColor: preferDark
            ? "rgba(0,0,0,0.42)"
            : "rgba(0,0,0,0.14)",
        },
        items: {
          textColor,
          iconBackgroundColor: preferDark
            ? "rgba(255,255,255,0.10)"
            : "rgba(255,255,255,0.72)",
          iconShadowColor: preferDark
            ? "rgba(0,0,0,0.42)"
            : "rgba(0,0,0,0.12)",
        },
        contextMenu: {
          textColor,
          activeColor: theme.accentColor,
          dangerColor: "#ff3b30",
          backgroundColor: preferDark
            ? "rgba(28,28,30,0.82)"
            : "rgba(255,255,255,0.82)",
          borderColor,
          backdropFilter: "blur(28px)",
        },
      },
    };
  };

  return {
    _id: theme.id,
    name: theme.name,
    description: theme.description || "自定义主题",
    isActive: true,
    lightConfig: makeConfig(theme.lightBackground, false),
    darkConfig: makeConfig(theme.darkBackground, true),
  };
};

export const getMyThemeConfigs = () => readMyThemes().map(toMyThemeConfig);
