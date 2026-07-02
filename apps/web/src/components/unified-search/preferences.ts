import { useCallback, useEffect, useState } from "react";
import {
  defaultUnifiedSearchShortcut,
  normalizeUnifiedSearchShortcut,
  type UnifiedSearchShortcut,
} from "./shortcut";
import {
  SEARCH_SELECTED_ENGINES_STORAGE_KEY,
  UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY,
} from "@/utils/storage";

export {
  SEARCH_SELECTED_ENGINES_STORAGE_KEY,
  UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY,
};

export const UNIFIED_SEARCH_PREFS_CHANGED_EVENT =
  "search-next:unified-search-preferences-changed";

export interface UnifiedSearchPreferences {
  showDesktopSearchBar: boolean;
  enableSpotlightShortcut: boolean;
  spotlightShortcut: UnifiedSearchShortcut;
}

export const defaultUnifiedSearchPreferences: UnifiedSearchPreferences = {
  showDesktopSearchBar: true,
  enableSpotlightShortcut: true,
  spotlightShortcut: defaultUnifiedSearchShortcut,
};

export const readUnifiedSearchPreferences = (): UnifiedSearchPreferences => {
  try {
    const raw = localStorage.getItem(UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY);
    if (!raw) return defaultUnifiedSearchPreferences;
    const parsed = JSON.parse(raw) as Partial<UnifiedSearchPreferences>;
    return {
      ...defaultUnifiedSearchPreferences,
      ...parsed,
      spotlightShortcut: normalizeUnifiedSearchShortcut(
        parsed.spotlightShortcut,
      ),
    };
  } catch {
    return defaultUnifiedSearchPreferences;
  }
};

export const writeUnifiedSearchPreferences = (
  preferences: UnifiedSearchPreferences,
) => {
  localStorage.setItem(
    UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences),
  );
  window.dispatchEvent(
    new CustomEvent(UNIFIED_SEARCH_PREFS_CHANGED_EVENT, {
      detail: preferences,
    }),
  );
};

export const useUnifiedSearchPreferences = () => {
  const [preferences, setPreferencesState] = useState(
    readUnifiedSearchPreferences,
  );

  useEffect(() => {
    const handleChange = () => {
      setPreferencesState(readUnifiedSearchPreferences());
    };
    window.addEventListener("storage", handleChange);
    window.addEventListener(UNIFIED_SEARCH_PREFS_CHANGED_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(
        UNIFIED_SEARCH_PREFS_CHANGED_EVENT,
        handleChange,
      );
    };
  }, []);

  const setPreference = useCallback(
    <K extends keyof UnifiedSearchPreferences>(
      key: K,
      value: UnifiedSearchPreferences[K],
    ) => {
      const next = { ...readUnifiedSearchPreferences(), [key]: value };
      writeUnifiedSearchPreferences(next);
    },
    [],
  );

  return { preferences, setPreference };
};
