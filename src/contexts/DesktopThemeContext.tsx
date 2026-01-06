import React, { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { desktopThemeDark, desktopThemeLight } from "zs_library";
import type { DesktopTheme } from "zs_library";
import { DESKTOP_THEME_STORAGE_KEY, PERSONALIZATION_STORAGE_KEY } from "@/utils/storage";

export type DesktopThemeId = "light" | "dark" | "ocean" | "forest" | "sunset" | "midnight";

export interface DesktopThemeItem {
  id: DesktopThemeId;
  name: string;
  kind: "light" | "dark";
  theme: DesktopTheme;
}

export interface DesktopThemeContextValue {
  themes: DesktopThemeItem[];
  personalization: PersonalizationConfig;
  activeThemeId: DesktopThemeId;
  activeTheme: DesktopThemeItem;
  setActiveThemeId: (id: DesktopThemeId) => void;
  setWallpaper: (wallpaper: PersonalizationWallpaper | null) => void;
}

const DesktopThemeContext = createContext<DesktopThemeContextValue | undefined>(undefined);

export type PersonalizationWallpaper =
  | { type: "none" }
  | { type: "image"; url: string }
  | { type: "gradient"; css: string };

export interface PersonalizationConfig {
  themeId: DesktopThemeId;
  wallpaper: PersonalizationWallpaper;
  fontFamily?: string;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const deepMerge = <T,>(base: T, patch: Partial<T>): T => {
  if (!isPlainObject(base) || !isPlainObject(patch)) return { ...(base as any), ...(patch as any) };

  const result: Record<string, unknown> = { ...(base as any) };
  for (const [key, value] of Object.entries(patch)) {
    const baseValue = (base as any)[key];
    if (isPlainObject(baseValue) && isPlainObject(value)) {
      result[key] = deepMerge(baseValue, value as any);
    } else {
      result[key] = value as any;
    }
  }
  return result as T;
};

const buildThemes = (): DesktopThemeItem[] => {
  const ocean = deepMerge(desktopThemeLight, {
    token: {
      base: {
        backgroundColor: "rgba(10, 132, 255, 0.08)",
        hoverColor: "rgba(10, 132, 255, 0.14)",
        borderColor: "rgba(10, 132, 255, 0.18)",
        shadowColor: "rgba(10, 132, 255, 0.18)",
      },
      dock: {
        backgroundColor: "rgba(10, 132, 255, 0.10)",
        borderColor: "rgba(10, 132, 255, 0.18)",
        boxShadowColor: "rgba(10, 132, 255, 0.18)",
      },
      items: {
        iconBackgroundColor: "rgba(10, 132, 255, 0.20)",
        iconShadowColor: "rgba(10, 132, 255, 0.26)",
        groupIconBackgroundColor: "rgba(10, 132, 255, 0.18)",
        groupIconShadowColor: "rgba(10, 132, 255, 0.24)",
      },
    },
  });

  const forest = deepMerge(desktopThemeLight, {
    token: {
      base: {
        backgroundColor: "rgba(22, 163, 74, 0.08)",
        hoverColor: "rgba(22, 163, 74, 0.14)",
        borderColor: "rgba(22, 163, 74, 0.18)",
        shadowColor: "rgba(22, 163, 74, 0.18)",
      },
      dock: {
        backgroundColor: "rgba(22, 163, 74, 0.10)",
        borderColor: "rgba(22, 163, 74, 0.18)",
        boxShadowColor: "rgba(22, 163, 74, 0.18)",
      },
      items: {
        iconBackgroundColor: "rgba(22, 163, 74, 0.20)",
        iconShadowColor: "rgba(22, 163, 74, 0.26)",
        groupIconBackgroundColor: "rgba(22, 163, 74, 0.18)",
        groupIconShadowColor: "rgba(22, 163, 74, 0.24)",
      },
    },
  });

  const sunset = deepMerge(desktopThemeLight, {
    token: {
      base: {
        backgroundColor: "rgba(249, 115, 22, 0.08)",
        hoverColor: "rgba(249, 115, 22, 0.14)",
        borderColor: "rgba(249, 115, 22, 0.18)",
        shadowColor: "rgba(249, 115, 22, 0.18)",
      },
      dock: {
        backgroundColor: "rgba(249, 115, 22, 0.10)",
        borderColor: "rgba(249, 115, 22, 0.18)",
        boxShadowColor: "rgba(249, 115, 22, 0.18)",
      },
      items: {
        iconBackgroundColor: "rgba(249, 115, 22, 0.20)",
        iconShadowColor: "rgba(249, 115, 22, 0.26)",
        groupIconBackgroundColor: "rgba(249, 115, 22, 0.18)",
        groupIconShadowColor: "rgba(249, 115, 22, 0.24)",
      },
    },
  });

  const midnight = deepMerge(desktopThemeDark, {
    token: {
      base: {
        hoverColor: "rgba(139, 92, 246, 0.18)",
        borderColor: "rgba(139, 92, 246, 0.18)",
        shadowColor: "rgba(139, 92, 246, 0.20)",
      },
      dock: {
        backgroundColor: "rgba(20, 18, 32, 0.48)",
        borderColor: "rgba(139, 92, 246, 0.16)",
        boxShadowColor: "rgba(139, 92, 246, 0.18)",
      },
      items: {
        iconBackgroundColor: "rgba(139, 92, 246, 0.22)",
        iconShadowColor: "rgba(139, 92, 246, 0.26)",
        groupIconBackgroundColor: "rgba(139, 92, 246, 0.18)",
        groupIconShadowColor: "rgba(139, 92, 246, 0.22)",
      },
    },
  });

  return [
    { id: "light", name: "默认浅色", kind: "light", theme: desktopThemeLight },
    { id: "dark", name: "默认深色", kind: "dark", theme: desktopThemeDark },
    { id: "ocean", name: "海洋蓝", kind: "light", theme: ocean },
    { id: "forest", name: "森林绿", kind: "light", theme: forest },
    { id: "sunset", name: "落日橙", kind: "light", theme: sunset },
    { id: "midnight", name: "午夜紫", kind: "dark", theme: midnight },
  ];
};

export const DesktopThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const themes = useMemo(() => buildThemes(), []);
  const defaultThemeId: DesktopThemeId = "light";
  const [personalization, setPersonalization] = useState<PersonalizationConfig>({
    themeId: defaultThemeId,
    wallpaper: { type: "none" },
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersonalizationConfig>;
        const themeId = parsed?.themeId as DesktopThemeId | undefined;
        const resolvedThemeId = themeId && themes.some((t) => t.id === themeId) ? themeId : defaultThemeId;
        const wallpaper = (parsed?.wallpaper as PersonalizationWallpaper | undefined) ?? { type: "none" };
        setPersonalization({ themeId: resolvedThemeId, wallpaper, fontFamily: parsed?.fontFamily });
        return;
      }
      const legacyRaw = localStorage.getItem(DESKTOP_THEME_STORAGE_KEY);
      const legacyId = legacyRaw as DesktopThemeId | null;
      const resolvedLegacyThemeId =
        legacyId && themes.some((t) => t.id === legacyId) ? legacyId : defaultThemeId;
      const migrated: PersonalizationConfig = { themeId: resolvedLegacyThemeId, wallpaper: { type: "none" } };
      setPersonalization(migrated);
      try {
        localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(migrated));
      } catch {}
    } catch {
      setPersonalization({ themeId: defaultThemeId, wallpaper: { type: "none" } });
    }
  }, [themes]);

  const activeTheme = useMemo(() => {
    return themes.find((t) => t.id === personalization.themeId) ?? themes[0];
  }, [personalization.themeId, themes]);

  const value: DesktopThemeContextValue = useMemo(
    () => ({
      themes,
      personalization,
      activeThemeId: personalization.themeId,
      activeTheme,
      setActiveThemeId: (id) => {
        if (!themes.some((t) => t.id === id)) return;
        const next: PersonalizationConfig = { ...personalization, themeId: id };
        setPersonalization(next);
        try {
          localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(next));
        } catch {}
      },
      setWallpaper: (wallpaper) => {
        const nextWallpaper = wallpaper ?? { type: "none" };
        const next: PersonalizationConfig = { ...personalization, wallpaper: nextWallpaper };
        setPersonalization(next);
        try {
          localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(next));
        } catch {}
      },
    }),
    [themes, personalization, activeTheme]
  );

  return <DesktopThemeContext.Provider value={value}>{children}</DesktopThemeContext.Provider>;
};

export default DesktopThemeContext;
