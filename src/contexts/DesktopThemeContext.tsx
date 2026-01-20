import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DESKTOP_THEME_STORAGE_KEY,
  PERSONALIZATION_STORAGE_KEY,
} from "@/utils/storage";

export type DesktopThemeId = string;

export interface DesktopThemeContextValue {
  personalization: PersonalizationConfig;
  activeThemeId: DesktopThemeId;
  setActiveThemeId: (id: DesktopThemeId) => void;
  setWallpaper: (wallpaper: PersonalizationWallpaper | null) => void;
}

const DesktopThemeContext = createContext<DesktopThemeContextValue | undefined>(
  undefined,
);

export type PersonalizationWallpaper =
  | { type: "none"; name?: string }
  | { type: "image"; url: string; name?: string }
  | { type: "gradient"; css: string; name?: string };

export interface PersonalizationConfig {
  themeId: DesktopThemeId;
  wallpaper: PersonalizationWallpaper;
  fontFamily?: string;
}

const isThemeId = (value: unknown): value is DesktopThemeId => {
  return typeof value === "string" && value.length > 0;
};

export const DesktopThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const defaultThemeId: DesktopThemeId = "light";
  const [personalization, setPersonalization] = useState<PersonalizationConfig>(
    {
      themeId: defaultThemeId,
      wallpaper: { type: "none", name: "无" },
    },
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersonalizationConfig>;
        const resolvedThemeId = isThemeId(parsed?.themeId)
          ? parsed.themeId
          : defaultThemeId;
        const wallpaper = (parsed?.wallpaper as
          | PersonalizationWallpaper
          | undefined) ?? { type: "none", name: "无" };
        setPersonalization({
          themeId: resolvedThemeId,
          wallpaper,
          fontFamily: parsed?.fontFamily,
        });
        return;
      }
      const legacyRaw = localStorage.getItem(DESKTOP_THEME_STORAGE_KEY);
      const resolvedLegacyThemeId = isThemeId(legacyRaw)
        ? legacyRaw
        : defaultThemeId;
      const migrated: PersonalizationConfig = {
        themeId: resolvedLegacyThemeId,
        wallpaper: { type: "none", name: "无" },
      };
      setPersonalization(migrated);
      try {
        localStorage.setItem(
          PERSONALIZATION_STORAGE_KEY,
          JSON.stringify(migrated),
        );
      } catch {
        void 0;
      }
    } catch {
      setPersonalization({
        themeId: defaultThemeId,
        wallpaper: { type: "none", name: "无" },
      });
    }
  }, []);

  const value: DesktopThemeContextValue = useMemo(
    () => ({
      personalization,
      activeThemeId: personalization.themeId,
      setActiveThemeId: (id) => {
        if (!isThemeId(id)) return;
        const next: PersonalizationConfig = { ...personalization, themeId: id };
        setPersonalization(next);
        try {
          localStorage.setItem(
            PERSONALIZATION_STORAGE_KEY,
            JSON.stringify(next),
          );
        } catch {
          void 0;
        }
      },
      setWallpaper: (wallpaper) => {
        const nextWallpaper = wallpaper ?? { type: "none", name: "无" };
        const next: PersonalizationConfig = {
          ...personalization,
          wallpaper: nextWallpaper,
        };
        setPersonalization(next);
        try {
          localStorage.setItem(
            PERSONALIZATION_STORAGE_KEY,
            JSON.stringify(next),
          );
        } catch {
          void 0;
        }
      },
    }),
    [personalization],
  );

  return (
    <DesktopThemeContext.Provider value={value}>
      {children}
    </DesktopThemeContext.Provider>
  );
};

export default DesktopThemeContext;
