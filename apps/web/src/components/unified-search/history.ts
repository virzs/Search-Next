import { useCallback, useEffect, useState } from "react";
import { SEARCH_HISTORY_STORAGE_KEY } from "@/utils/storage";

export { SEARCH_HISTORY_STORAGE_KEY };

export type SearchHistoryKind =
  | "search"
  | "website"
  | "app"
  | "setting"
  | "shortcut";

export type SearchHistoryShortcutScope =
  | "all"
  | "web-search"
  | "website"
  | "app"
  | "setting";

export interface SearchHistoryItem {
  id: string;
  kind: SearchHistoryKind;
  title: string;
  description?: string;
  query?: string;
  url?: string;
  widgetId?: string;
  settingPath?: string;
  shortcutCode?: string;
  shortcutScope?: SearchHistoryShortcutScope;
  updatedAt: number;
}

export const UNIFIED_SEARCH_HISTORY_CHANGED_EVENT =
  "search-next:unified-search-history-changed";
export const SEARCH_HISTORY_LIMIT = 8;

export const readSearchHistory = (): SearchHistoryItem[] => {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is SearchHistoryItem => {
        if (!item || typeof item !== "object") return false;
        const record = item as SearchHistoryItem;
        return (
          typeof record.id === "string" &&
          typeof record.kind === "string" &&
          typeof record.title === "string"
        );
      })
      .slice(0, SEARCH_HISTORY_LIMIT);
  } catch {
    return [];
  }
};

export const writeSearchHistory = (items: SearchHistoryItem[]) => {
  const nextItems = items.slice(0, SEARCH_HISTORY_LIMIT);
  localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(nextItems));
  window.dispatchEvent(
    new CustomEvent(UNIFIED_SEARCH_HISTORY_CHANGED_EVENT, {
      detail: nextItems,
    }),
  );
};

export const removeSearchHistoryItem = (id: string) => {
  writeSearchHistory(readSearchHistory().filter((item) => item.id !== id));
};

export const clearSearchHistory = () => {
  writeSearchHistory([]);
};

export const useUnifiedSearchHistory = () => {
  const [history, setHistory] = useState(readSearchHistory);

  useEffect(() => {
    const handleChange = () => setHistory(readSearchHistory());
    window.addEventListener("storage", handleChange);
    window.addEventListener(UNIFIED_SEARCH_HISTORY_CHANGED_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(
        UNIFIED_SEARCH_HISTORY_CHANGED_EVENT,
        handleChange,
      );
    };
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    removeSearchHistoryItem(id);
  }, []);

  const clearHistory = useCallback(() => {
    clearSearchHistory();
  }, []);

  return {
    history,
    removeHistoryItem,
    clearHistory,
  };
};
