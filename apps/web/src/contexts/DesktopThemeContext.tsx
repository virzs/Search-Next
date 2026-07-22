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
export const SCREEN_SAVER_TIMEOUT_MINUTES = [1, 5, 10, 30] as const;
export type ScreenSaverTimeoutMinutes =
  (typeof SCREEN_SAVER_TIMEOUT_MINUTES)[number];

export interface ScreenSaverConfig {
  enabled: boolean;
  timeoutMinutes: ScreenSaverTimeoutMinutes;
}

export interface DesktopThemeContextValue {
  personalization: PersonalizationConfig;
  activeThemeId: DesktopThemeId;
  appearanceMode: AppearanceMode;
  resolvedColorScheme: ResolvedColorScheme;
  setActiveThemeId: (id: DesktopThemeId) => void;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setWallpaper: (wallpaper: PersonalizationWallpaper | null) => void;
  setScreenSaver: (screenSaver: ScreenSaverConfig) => void;
  setZenMode: (enabled: boolean) => void;
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
  screenSaver: ScreenSaverConfig;
  zenMode: boolean;
  fontFamily?: string;
}

const defaultThemeId: DesktopThemeId = "light";
const defaultAppearanceMode: AppearanceMode = "system";
const defaultWallpaper: PersonalizationWallpaper = { type: "none", name: "无" };
const DEFAULT_SCREEN_SAVER_CONFIG: ScreenSaverConfig = {
  enabled: false,
  timeoutMinutes: 5,
};

const isThemeId = (value: unknown): value is DesktopThemeId => {
  return typeof value === "string" && value.length > 0;
};

const isAppearanceMode = (value: unknown): value is AppearanceMode => {
  return value === "system" || value === "dark" || value === "light";
};

const isScreenSaverTimeout = (
  value: unknown,
): value is ScreenSaverTimeoutMinutes =>
  SCREEN_SAVER_TIMEOUT_MINUTES.includes(
    value as ScreenSaverTimeoutMinutes,
  );

const parseScreenSaver = (value: unknown): ScreenSaverConfig => {
  if (!value || typeof value !== "object") {
    return DEFAULT_SCREEN_SAVER_CONFIG;
  }
  const record = value as Record<string, unknown>;
  return {
    enabled: record.enabled === true,
    timeoutMinutes: isScreenSaverTimeout(record.timeoutMinutes)
      ? record.timeoutMinutes
      : DEFAULT_SCREEN_SAVER_CONFIG.timeoutMinutes,
  };
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
      screenSaver: DEFAULT_SCREEN_SAVER_CONFIG,
      zenMode: false,
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
        const screenSaver = parseScreenSaver(parsed?.screenSaver);
        setPersonalization({
          themeId: resolvedThemeId,
          appearanceMode,
          wallpaper,
          screenSaver,
          zenMode: parsed?.zenMode === true,
          fontFamily: parsed?.fontFamily,
        });
        return;
      }
    } catch {
      setPersonalization({
        themeId: defaultThemeId,
        appearanceMode: defaultAppearanceMode,
        wallpaper: defaultWallpaper,
        screenSaver: DEFAULT_SCREEN_SAVER_CONFIG,
        zenMode: false,
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
      setScreenSaver: (screenSaver) => {
        const next: PersonalizationConfig = {
          ...personalization,
          screenSaver: parseScreenSaver(screenSaver),
        };
        setPersonalization(next);
        persistPersonalization(next);
      },
      setZenMode: (enabled) => {
        const next: PersonalizationConfig = {
          ...personalization,
          zenMode: enabled === true,
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
