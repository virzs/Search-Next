import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PERSONALIZATION_STORAGE_KEY } from "@/utils/storage";

export type DesktopThemeId = string;
export type AppearanceMode = "system" | "dark" | "light";
export type ResolvedColorScheme = "dark" | "light";

export interface DesktopThemeContextValue {
  personalization: PersonalizationConfig;
  activeThemeId: DesktopThemeId;
  appearanceMode: AppearanceMode;
  resolvedColorScheme: ResolvedColorScheme;
  setActiveThemeId: (id: DesktopThemeId) => void;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setWallpaper: (wallpaper: PersonalizationWallpaper | null) => void;
}

const DesktopThemeContext = createContext<DesktopThemeContextValue | undefined>(
  undefined,
);

export type PersonalizationWallpaper =
  | { type: "none"; name?: string }
  | { type: "image"; url: string; name?: string }
  | { type: "gradient"; css: string; name?: string }
  | {
      type: "application";
      id: string;
      revision: string;
      previewUrl: string;
      name?: string;
    };

export interface PersonalizationConfig {
  themeId: DesktopThemeId;
  appearanceMode?: AppearanceMode;
  wallpaper: PersonalizationWallpaper;
  fontFamily?: string;
}

const defaultThemeId: DesktopThemeId = "light";
const defaultAppearanceMode: AppearanceMode = "system";
const defaultWallpaper: PersonalizationWallpaper = { type: "none", name: "无" };

const isThemeId = (value: unknown): value is DesktopThemeId => {
  return typeof value === "string" && value.length > 0;
};

const isAppearanceMode = (value: unknown): value is AppearanceMode => {
  return value === "system" || value === "dark" || value === "light";
};

const parseWallpaper = (value: unknown): PersonalizationWallpaper => {
  if (!value || typeof value !== "object") return defaultWallpaper;
  const record = value as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name : undefined;
  if (record.type === "none") return { type: "none", name };
  if (record.type === "image" && typeof record.url === "string") {
    return { type: "image", url: record.url, name };
  }
  if (record.type === "gradient" && typeof record.css === "string") {
    return { type: "gradient", css: record.css, name };
  }
  if (
    record.type === "application" &&
    typeof record.id === "string" &&
    typeof record.revision === "string"
  ) {
    return {
      type: "application",
      id: record.id,
      revision: record.revision,
      previewUrl:
        typeof record.previewUrl === "string" ? record.previewUrl : "",
      name,
    };
  }
  return defaultWallpaper;
};

const getSystemColorScheme = (): ResolvedColorScheme => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

const resolveColorScheme = (
  mode: AppearanceMode,
  systemColorScheme: ResolvedColorScheme,
): ResolvedColorScheme => {
  return mode === "system" ? systemColorScheme : mode;
};

const persistPersonalization = (config: PersonalizationConfig) => {
  try {
    localStorage.setItem(PERSONALIZATION_STORAGE_KEY, JSON.stringify(config));
  } catch {
    void 0;
  }
};

export const DesktopThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [personalization, setPersonalization] = useState<PersonalizationConfig>(
    {
      themeId: defaultThemeId,
      appearanceMode: defaultAppearanceMode,
      wallpaper: defaultWallpaper,
    },
  );
  const [systemColorScheme, setSystemColorScheme] =
    useState<ResolvedColorScheme>(getSystemColorScheme);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersonalizationConfig>;
        const resolvedThemeId = isThemeId(parsed?.themeId)
          ? parsed.themeId
          : defaultThemeId;
        const appearanceMode = isAppearanceMode(parsed?.appearanceMode)
          ? parsed.appearanceMode
          : defaultAppearanceMode;
        const wallpaper = parseWallpaper(parsed?.wallpaper);
        setPersonalization({
          themeId: resolvedThemeId,
          appearanceMode,
          wallpaper,
          fontFamily: parsed?.fontFamily,
        });
        return;
      }
    } catch {
      setPersonalization({
        themeId: defaultThemeId,
        appearanceMode: defaultAppearanceMode,
        wallpaper: defaultWallpaper,
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemColorScheme(query.matches ? "dark" : "light");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const appearanceMode = personalization.appearanceMode ?? defaultAppearanceMode;
  const resolvedColorScheme = resolveColorScheme(
    appearanceMode,
    systemColorScheme,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedColorScheme;
    root.dataset.appearanceMode = appearanceMode;
    root.classList.toggle("dark", resolvedColorScheme === "dark");
    root.style.colorScheme = resolvedColorScheme;
  }, [appearanceMode, resolvedColorScheme]);

  const value: DesktopThemeContextValue = useMemo(
    () => ({
      personalization,
      activeThemeId: personalization.themeId,
      appearanceMode,
      resolvedColorScheme,
      setActiveThemeId: (id) => {
        if (!isThemeId(id)) return;
        const next: PersonalizationConfig = { ...personalization, themeId: id };
        setPersonalization(next);
        persistPersonalization(next);
      },
      setAppearanceMode: (mode) => {
        if (!isAppearanceMode(mode)) return;
        const next: PersonalizationConfig = {
          ...personalization,
          appearanceMode: mode,
        };
        setPersonalization(next);
        persistPersonalization(next);
      },
      setWallpaper: (wallpaper) => {
        const nextWallpaper = wallpaper ?? defaultWallpaper;
        const next: PersonalizationConfig = {
          ...personalization,
          wallpaper: nextWallpaper,
        };
        setPersonalization(next);
        persistPersonalization(next);
      },
    }),
    [appearanceMode, personalization, resolvedColorScheme],
  );

  return (
    <DesktopThemeContext.Provider value={value}>
      {children}
    </DesktopThemeContext.Provider>
  );
};

export default DesktopThemeContext;
