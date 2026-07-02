import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { App as AntdApp, Button, Empty, Spin, Tag } from "antd";
import { css, cx } from "@emotion/css";
import {
  RiApps2Line,
  RiArrowRightUpLine,
  RiCloseLine,
  RiGlobalLine,
  RiSearchLine,
  RiSettings3Line,
} from "@remixicon/react";
import { useNavigate } from "react-router";
import { useRequest } from "ahooks";
import { getTabsWebsitePublic } from "@/services/website";
import {
  buildSearchEngineUrl,
  getEnabledSearchEngines,
  type SearchEngineItem,
} from "@/services/search-engine";
import { useWidget } from "@/hooks/useWidget";
import type { WidgetApiItem } from "@/types";
import {
  getWebsiteIconUrl,
  getWebsiteId,
  getWebsiteName,
  getWebsiteUrl,
} from "@/pages/index/components/default-apps/store/utils";
import { storeRoute } from "@/pages/index/components/default-apps/store/route-paths";
import { settingsRoute } from "@/pages/index/components/default-apps/settings/route-paths";
import {
  getDefaultAppRouteSearchItems,
  type RouteSearchItem,
} from "@/pages/index/components/default-apps/searchable-routes";
import { fetchSearchEngineSuggestions } from "./suggestions";
import { SEARCH_SELECTED_ENGINES_STORAGE_KEY } from "./preferences";
import {
  SEARCH_HISTORY_LIMIT,
  UNIFIED_SEARCH_HISTORY_CHANGED_EVENT,
  readSearchHistory,
  writeSearchHistory,
  type SearchHistoryItem,
} from "./history";
import {
  getUnifiedSearchShortcutParts,
  type UnifiedSearchShortcut,
} from "./shortcut";
export {
  defaultUnifiedSearchPreferences,
  readUnifiedSearchPreferences,
  useUnifiedSearchPreferences,
  writeUnifiedSearchPreferences,
} from "./preferences";
export {
  clearSearchHistory,
  readSearchHistory,
  removeSearchHistoryItem,
  useUnifiedSearchHistory,
  writeSearchHistory,
  type SearchHistoryItem,
  type SearchHistoryKind,
} from "./history";
export {
  createUnifiedSearchShortcutFromEvent,
  defaultUnifiedSearchShortcut,
  formatUnifiedSearchShortcut,
  getSystemShortcutModifierName,
  getUnifiedSearchShortcutParts,
  hasRequiredShortcutModifier,
  isShortcutModifierOnlyKey,
  matchesUnifiedSearchShortcut,
  normalizeUnifiedSearchShortcut,
} from "./shortcut";

type UnifiedSearchVariant = "desktop" | "spotlight";

interface UnifiedSearchProps {
  variant?: UnifiedSearchVariant;
  className?: string;
  open?: boolean;
  onClose?: () => void;
  onOpenApp?: (widget: WidgetApiItem) => void;
  autoFocus?: boolean;
  showShortcutHint?: boolean;
  shortcut?: UnifiedSearchShortcut;
}

interface SuggestionGroup {
  engine: SearchEngineItem;
  suggestions: string[];
}

type SearchResultKind =
  | "action"
  | "suggestion"
  | "website"
  | "app"
  | "route"
  | "setting";
type SearchResultSection =
  | "strong-internal"
  | "action"
  | "suggestion"
  | "weak-internal";

interface StandardizedSearchResult<T> {
  id: string;
  kind: SearchResultKind;
  score: number;
  section: SearchResultSection;
  engineId?: string;
  item: T;
}

type FocusableItem =
  | { id: string; type: "shortcut"; shortcut: SearchShortcutItem }
  | { id: string; type: "history"; history: SearchHistoryItem }
  | { id: string; type: "selected-search" }
  | { id: string; type: "all-search" }
  | { id: string; type: "engine-search"; engine: SearchEngineItem }
  | {
      id: string;
      type: "suggestion";
      suggestion: string;
      engine: SearchEngineItem;
    }
  | { id: string; type: "website"; website: any }
  | { id: string; type: "app"; widget: WidgetApiItem }
  | { id: string; type: "route"; route: RouteSearchItem }
  | { id: string; type: "setting"; setting: RouteSearchItem };

type NavigationDirection = "left" | "right" | "up" | "down";
type SearchShortcutScope = "all" | "web-search" | "website" | "app" | "setting";

interface SearchShortcutItem {
  code: string;
  aliases: string[];
  scope: SearchShortcutScope;
  label: string;
  description: string;
  example: string;
}

interface ParsedSearchQuery {
  text: string;
  scope: SearchShortcutScope;
  shortcut?: {
    code: string;
    label: string;
  };
}

const SEARCH_PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_WAIT = 300;
const DESKTOP_CLOSE_ANIMATION_MS = 220;
const SPOTLIGHT_CLOSE_ANIMATION_MS = 180;
const SUGGESTIONS_PER_ENGINE_LIMIT = 3;
const SUGGESTIONS_TOTAL_LIMIT = 6;
const TITLE_EXACT_MATCH_SCORE = 100;
const TITLE_CONTAINS_MATCH_SCORE = 80;
const SECONDARY_EXACT_MATCH_SCORE = 42;
const SECONDARY_CONTAINS_MATCH_SCORE = 28;
const BACKEND_WEAK_MATCH_SCORE = 8;
const STRONG_INTERNAL_MATCH_SCORE = TITLE_CONTAINS_MATCH_SCORE;

const SEARCH_SHORTCUTS: SearchShortcutItem[] = [
  {
    code: "all",
    aliases: ["all", "全部"],
    scope: "all",
    label: "全部",
    description: "搜索网页、网站、应用、设置",
    example: "@all ai",
  },
  {
    code: "ws",
    aliases: ["ws", "web", "search", "websearch", "网页搜索"],
    scope: "web-search",
    label: "网页搜索",
    description: "只打开搜索引擎与建议",
    example: "@ws ai",
  },
  {
    code: "site",
    aliases: ["site", "sites", "website", "websites", "w", "网站"],
    scope: "website",
    label: "网站",
    description: "只搜索站内网站",
    example: "@site 知乎",
  },
  {
    code: "app",
    aliases: ["app", "apps", "应用"],
    scope: "app",
    label: "应用",
    description: "只搜索应用",
    example: "@app 日历",
  },
  {
    code: "setting",
    aliases: ["setting", "settings", "set", "设置"],
    scope: "setting",
    label: "设置",
    description: "只搜索设置项",
    example: "@setting 主题",
  },
];

const readSelectedEngineIds = () => {
  try {
    const raw = localStorage.getItem(SEARCH_SELECTED_ENGINES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const writeSelectedEngineIds = (ids: string[]) => {
  localStorage.setItem(
    SEARCH_SELECTED_ENGINES_STORAGE_KEY,
    JSON.stringify(ids),
  );
};

const normalizeText = (value: unknown) =>
  String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();

const getShortcutConfig = (code: string) => {
  const normalizedCode = normalizeText(code);
  return SEARCH_SHORTCUTS.find((shortcut) =>
    shortcut.aliases.some((alias) => normalizeText(alias) === normalizedCode),
  );
};

const getEmbeddedShortcutConfig = (code: string) => {
  const normalizedCode = normalizeText(code);
  const matchedAliases = SEARCH_SHORTCUTS.flatMap((shortcut) =>
    shortcut.aliases.map((alias) => ({
      shortcut,
      alias,
      normalizedAlias: normalizeText(alias),
    })),
  )
    .filter(
      ({ normalizedAlias }) =>
        normalizedCode.startsWith(normalizedAlias) &&
        normalizedCode.length > normalizedAlias.length,
    )
    .sort((a, b) => b.normalizedAlias.length - a.normalizedAlias.length);

  const matched = matchedAliases[0];
  if (!matched) return null;

  return {
    shortcut: matched.shortcut,
    text: code.slice(matched.alias.length).trim(),
  };
};

const parseSearchQuery = (value: string): ParsedSearchQuery => {
  const raw = value.trim();
  if (!raw.startsWith("@")) {
    return { text: raw, scope: "all" };
  }

  if (raw.startsWith("@@")) {
    return { text: raw.slice(1).trim(), scope: "all" };
  }

  if (raw === "@") {
    return { text: "", scope: "all" };
  }

  const match = raw.match(/^@([^\s:：]+)(?:[\s:：]+(.*))?$/);
  if (!match) {
    return { text: "", scope: "all" };
  }

  const shortcut = getShortcutConfig(match[1]);
  if (!shortcut) {
    const embeddedShortcut = getEmbeddedShortcutConfig(match[1]);
    if (embeddedShortcut) {
      return {
        text: embeddedShortcut.text,
        scope: embeddedShortcut.shortcut.scope,
        shortcut: {
          code: match[1],
          label: embeddedShortcut.shortcut.label,
        },
      };
    }

    return { text: raw, scope: "all" };
  }

  return {
    text: (match[2] ?? "").trim(),
    scope: shortcut.scope,
    shortcut: {
      code: match[1],
      label: shortcut.label,
    },
  };
};

const flattenSearchText = (value: unknown): string[] => {
  if (value === null || value === undefined) return [];
  if (typeof value === "string" || typeof value === "number") {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenSearchText);
  }
  if (typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  return [
    record.name,
    record.title,
    record.label,
    record.key,
    record.value,
    record.id,
    record._id,
  ].flatMap(flattenSearchText);
};

const getTextMatchScore = (
  query: string,
  titleValues: unknown[],
  secondaryValues: unknown[] = [],
) => {
  const q = normalizeText(query);
  if (!q) return 0;

  let bestScore = 0;
  for (const value of titleValues.flatMap(flattenSearchText)) {
    const text = normalizeText(value);
    if (!text) continue;
    if (text === q) return TITLE_EXACT_MATCH_SCORE;
    if (text.includes(q)) {
      bestScore = Math.max(bestScore, TITLE_CONTAINS_MATCH_SCORE);
    }
  }

  for (const value of secondaryValues.flatMap(flattenSearchText)) {
    const text = normalizeText(value);
    if (!text) continue;
    if (text === q) {
      bestScore = Math.max(bestScore, SECONDARY_EXACT_MATCH_SCORE);
    } else if (text.includes(q)) {
      bestScore = Math.max(bestScore, SECONDARY_CONTAINS_MATCH_SCORE);
    }
  }

  return bestScore;
};

const withSearchResultSection = <T,>(
  result: Omit<StandardizedSearchResult<T>, "section">,
): StandardizedSearchResult<T> => ({
  ...result,
  section:
    result.score >= STRONG_INTERNAL_MATCH_SCORE
      ? "strong-internal"
      : "weak-internal",
});

const sortScoredResults = <T,>(results: StandardizedSearchResult<T>[]) =>
  results
    .map((result, index) => ({ result, index }))
    .sort(
      (a, b) => b.result.score - a.result.score || a.index - b.index,
    )
    .map(({ result }) => result)
    .slice(0, SEARCH_PAGE_SIZE);

const splitInternalResults = <T,>(results: StandardizedSearchResult<T>[]) => ({
  strong: results.filter((result) => result.section === "strong-internal"),
  weak: results.filter((result) => result.section === "weak-internal"),
});

const getWidgetTags = (widget: WidgetApiItem) => [
  ...(widget.tags ?? []),
  ...((widget.configSnapshot?.tags as string[] | undefined) ?? []),
];

const supportsAppMode = (widget: WidgetApiItem) =>
  Boolean(widget.configSnapshot?.supportAppMode ?? widget.supportAppMode);

const resolveHttpUrl = (rawUrl: string | undefined) => {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
};

const renderInlineSvgIcon = (
  svg: string | undefined,
  fallback: ReactNode,
  label: string,
) => {
  if (!svg) return fallback;
  return (
    <span
      aria-label={label}
      className={unifiedSearchSvgIconClassName}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

const renderShortcutIcon = (scope: SearchShortcutScope) => {
  if (scope === "app") return <RiApps2Line size={17} />;
  if (scope === "setting") return <RiSettings3Line size={17} />;
  if (scope === "website") return <RiGlobalLine size={17} />;
  return <RiSearchLine size={17} />;
};

const renderHistoryIcon = (history: SearchHistoryItem) => {
  if (history.kind === "app") return <RiApps2Line size={17} />;
  if (history.kind === "setting") return <RiSettings3Line size={17} />;
  if (history.kind === "route") return <RiApps2Line size={17} />;
  if (history.kind === "website") return <RiGlobalLine size={17} />;
  if (history.kind === "shortcut") {
    return renderShortcutIcon(history.shortcutScope ?? "all");
  }
  return <RiSearchLine size={17} />;
};

const UnifiedSearch = ({
  variant = "desktop",
  className,
  open = true,
  onClose,
  onOpenApp,
  autoFocus,
  showShortcutHint = true,
  shortcut,
}: UnifiedSearchProps) => {
  const navigate = useNavigate();
  const { message } = AntdApp.useApp();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedEngineIds, setSelectedEngineIds] = useState(
    readSelectedEngineIds,
  );
  const [searchHistory, setSearchHistory] = useState(readSearchHistory);
  const [suggestionGroups, setSuggestionGroups] = useState<SuggestionGroup[]>(
    [],
  );
  const [expandedSuggestionEngineIds, setExpandedSuggestionEngineIds] =
    useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [desktopClosing, setDesktopClosing] = useState(false);
  const [desktopPanelMounted, setDesktopPanelMounted] = useState(false);
  const [desktopClearAfterClose, setDesktopClearAfterClose] = useState(false);
  const [spotlightMounted, setSpotlightMounted] = useState(open);
  const [spotlightClosing, setSpotlightClosing] = useState(false);
  const {
    widgets,
    loading: widgetsLoading,
    getAppIconUrl,
    devModeEnabled,
  } = useWidget();

  const { data: enginesData, loading: enginesLoading } = useRequest(
    getEnabledSearchEngines,
  );
  const {
    data: websiteData,
    loading: websiteLoading,
    run: runWebsiteSearch,
  } = useRequest(getTabsWebsitePublic, { manual: true });

  const engines = useMemo(
    () => (Array.isArray(enginesData) ? enginesData : []),
    [enginesData],
  );
  const selectedEngines = useMemo(() => {
    const selectedSet = new Set(selectedEngineIds);
    return engines.filter((engine) => selectedSet.has(engine._id));
  }, [engines, selectedEngineIds]);
  const primaryEngines = useMemo(
    () => (selectedEngines.length ? selectedEngines : engines.slice(0, 1)),
    [engines, selectedEngines],
  );
  const parsedQuery = useMemo(() => parseSearchQuery(query), [query]);
  const debouncedParsedQuery = useMemo(
    () => parseSearchQuery(debouncedQuery),
    [debouncedQuery],
  );
  const currentQueryText = parsedQuery.text;
  const trimmedQuery = debouncedParsedQuery.text;
  const rawQuery = query.trim();
  const normalizedDebouncedQuery = trimmedQuery;
  const currentSearchScope = parsedQuery.scope;
  const searchScope = debouncedParsedQuery.scope;
  const shouldSearchWeb = searchScope === "all" || searchScope === "web-search";
  const shouldSearchWebsites =
    searchScope === "all" || searchScope === "website";
  const shouldSearchApps = searchScope === "all" || searchScope === "app";
  const shouldSearchPages = searchScope === "all";
  const shouldSearchSettings =
    searchScope === "all" || searchScope === "setting";
  const isSearchDebouncing =
    Boolean(currentQueryText) && currentQueryText !== trimmedQuery;
  const routeSearchItems = useMemo(
    () =>
      getDefaultAppRouteSearchItems({
        context: { devModeEnabled },
      }),
    [devModeEnabled],
  );
  const shortcutToken = useMemo(() => {
    if (!rawQuery.startsWith("@") || rawQuery.startsWith("@@")) return "";
    return rawQuery.slice(1).split(/[\s:：]/)[0] ?? "";
  }, [rawQuery]);
  const showStartPanel =
    !rawQuery && (variant === "spotlight" || desktopFocused);
  const showShortcutSuggestions =
    rawQuery.startsWith("@") &&
    !rawQuery.startsWith("@@") &&
    (!parsedQuery.shortcut || !currentQueryText);
  const desktopPanelShouldOpen =
    Boolean(currentQueryText) || showShortcutSuggestions || showStartPanel;

  useEffect(() => {
    if (!parseSearchQuery(query).text) {
      setDebouncedQuery(query);
      return;
    }

    const timer = window.setTimeout(
      () => setDebouncedQuery(query),
      SEARCH_DEBOUNCE_WAIT,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleHistoryChange = () => setSearchHistory(readSearchHistory());
    window.addEventListener("storage", handleHistoryChange);
    window.addEventListener(
      UNIFIED_SEARCH_HISTORY_CHANGED_EVENT,
      handleHistoryChange,
    );
    return () => {
      window.removeEventListener("storage", handleHistoryChange);
      window.removeEventListener(
        UNIFIED_SEARCH_HISTORY_CHANGED_EVENT,
        handleHistoryChange,
      );
    };
  }, []);

  useEffect(() => {
    if (!engines.length) return;
    const available = new Set(engines.map((engine) => engine._id));
    const validIds = selectedEngineIds.filter((id) => available.has(id));
    const nextIds = validIds.length ? validIds : [engines[0]._id];
    if (nextIds.join("|") !== selectedEngineIds.join("|")) {
      setSelectedEngineIds(nextIds);
      writeSelectedEngineIds(nextIds);
    }
  }, [engines, selectedEngineIds]);

  useEffect(() => {
    if (!normalizedDebouncedQuery || !shouldSearchWeb) {
      setSuggestionGroups([]);
      setSuggestionsLoading(false);
      return;
    }

    const enginesWithSuggestions = primaryEngines.filter(
      (engine) => engine.suggestUrl,
    );
    if (!enginesWithSuggestions.length) {
      setSuggestionGroups([]);
      setSuggestionsLoading(false);
      return;
    }

    let cancelled = false;
    setSuggestionsLoading(true);
    Promise.all(
      enginesWithSuggestions.map(async (engine) => ({
        engine,
        suggestions: await fetchSearchEngineSuggestions(
          engine,
          normalizedDebouncedQuery,
        ),
      })),
    )
      .then((groups) => {
        if (cancelled) return;
        setSuggestionGroups(
          groups.filter((group) => group.suggestions.length > 0),
        );
      })
      .finally(() => {
        if (!cancelled) setSuggestionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedDebouncedQuery, primaryEngines, shouldSearchWeb]);

  useEffect(() => {
    if (!normalizedDebouncedQuery || !shouldSearchWebsites) return;
    runWebsiteSearch({
      page: 1,
      pageSize: SEARCH_PAGE_SIZE,
      search: normalizedDebouncedQuery,
    });
  }, [
    normalizedDebouncedQuery,
    runWebsiteSearch,
    shouldSearchWebsites,
  ]);

  useEffect(() => {
    if (!open || !autoFocus) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [autoFocus, open]);

  useEffect(() => {
    if (!desktopClosing) return;

    const timer = window.setTimeout(() => {
      if (desktopClearAfterClose) {
        setQuery("");
        setDebouncedQuery("");
      }
      setDesktopFocused(false);
      setDesktopClosing(false);
      setDesktopPanelMounted(false);
      setDesktopClearAfterClose(false);
      setActiveItemId(null);
    }, DESKTOP_CLOSE_ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [desktopClearAfterClose, desktopClosing]);

  useEffect(() => {
    if (variant !== "desktop") return;

    if (desktopPanelShouldOpen) {
      setDesktopPanelMounted(true);
      if (desktopClosing && !desktopClearAfterClose) {
        setDesktopClosing(false);
      }
      return;
    }

    if (desktopPanelMounted && !desktopClosing) {
      setDesktopClearAfterClose(false);
      setDesktopClosing(true);
    }
  }, [
    desktopClearAfterClose,
    desktopClosing,
    desktopPanelMounted,
    desktopPanelShouldOpen,
    variant,
  ]);

  useEffect(() => {
    if (variant !== "spotlight") return;

    if (open) {
      setSpotlightMounted(true);
      setSpotlightClosing(false);
      return;
    }

    if (!spotlightMounted) return;
    setSpotlightClosing(true);

    const timer = window.setTimeout(() => {
      setSpotlightMounted(false);
      setSpotlightClosing(false);
      setActiveItemId(null);
    }, SPOTLIGHT_CLOSE_ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [open, spotlightMounted, variant]);

  useEffect(() => {
    setActiveItemId(null);
    setExpandedSuggestionEngineIds([]);
  }, [query]);

  const websiteResults = useMemo(() => {
    if (!normalizedDebouncedQuery || !shouldSearchWebsites) return [];
    const data = websiteData as any;
    if (Array.isArray(data)) return data.slice(0, SEARCH_PAGE_SIZE);
    return ((data?.data as any[]) ?? []).slice(0, SEARCH_PAGE_SIZE);
  }, [normalizedDebouncedQuery, shouldSearchWebsites, websiteData]);

  const visibleShortcutItems = useMemo(() => {
    if (!showStartPanel && !showShortcutSuggestions) return [];
    const token = normalizeText(shortcutToken);
    if (!token) return SEARCH_SHORTCUTS;
    return SEARCH_SHORTCUTS.filter((shortcut) =>
      [
        shortcut.code,
        shortcut.label,
        shortcut.description,
        ...shortcut.aliases,
      ].some((value) => normalizeText(value).includes(token)),
    );
  }, [shortcutToken, showShortcutSuggestions, showStartPanel]);

  const visibleHistoryItems = useMemo(
    () => (showStartPanel ? searchHistory.slice(0, SEARCH_HISTORY_LIMIT) : []),
    [searchHistory, showStartPanel],
  );

  const expandedSuggestionEngineSet = useMemo(
    () => new Set(expandedSuggestionEngineIds),
    [expandedSuggestionEngineIds],
  );

  const suggestionCountByEngineId = useMemo(
    () =>
      new Map(
        suggestionGroups.map((group) => [
          group.engine._id,
          group.suggestions.length,
        ]),
      ),
    [suggestionGroups],
  );

  const visibleSuggestionGroups = useMemo(() => {
    const nextGroups = suggestionGroups.map((group) => ({
      engine: group.engine,
      suggestions: [] as string[],
    }));
    const seen = new Set<string>();
    let total = 0;

    for (
      let round = 0;
      round < SUGGESTIONS_PER_ENGINE_LIMIT && total < SUGGESTIONS_TOTAL_LIMIT;
      round += 1
    ) {
      for (const [index, group] of suggestionGroups.entries()) {
        if (expandedSuggestionEngineSet.has(group.engine._id)) continue;
        if (total >= SUGGESTIONS_TOTAL_LIMIT) break;
        const suggestion = group.suggestions[round];
        const key = normalizeText(suggestion);
        if (!suggestion || !key || seen.has(key)) continue;
        seen.add(key);
        nextGroups[index].suggestions.push(suggestion);
        total += 1;
      }
    }

    for (const [index, group] of suggestionGroups.entries()) {
      if (!expandedSuggestionEngineSet.has(group.engine._id)) continue;
      nextGroups[index].suggestions = group.suggestions;
    }

    return nextGroups.filter((group) => group.suggestions.length > 0);
  }, [expandedSuggestionEngineSet, suggestionGroups]);

  const scoredWebsiteResults = useMemo(() => {
    if (!trimmedQuery || !shouldSearchWebsites) return [];
    return sortScoredResults(
      websiteResults.map((website) => {
        const id = getWebsiteId(website);
        const score =
          getTextMatchScore(
            trimmedQuery,
            [getWebsiteName(website)],
            [
              getWebsiteUrl(website),
              website?.description,
              website?.summary,
              website?.classify,
              website?.classifyName,
              website?.category,
              website?.categoryName,
              website?.tags,
            ],
          ) || BACKEND_WEAK_MATCH_SCORE;

        return withSearchResultSection({
          id: `website:${id}`,
          kind: "website",
          score,
          item: website,
        });
      }),
    );
  }, [shouldSearchWebsites, trimmedQuery, websiteResults]);

  const scoredAppResults = useMemo(() => {
    if (!trimmedQuery || !shouldSearchApps) return [];
    return sortScoredResults(
      (widgets ?? [])
        .filter(supportsAppMode)
        .map((widget) =>
          withSearchResultSection({
            id: `app:${widget._id}`,
            kind: "app",
            score: getTextMatchScore(
              trimmedQuery,
              [widget.name],
              [
                widget.description,
                widget.author,
                widget.version,
                widget.classify?.name,
                ...getWidgetTags(widget),
              ],
            ),
            item: widget,
          }),
        )
        .filter((result) => result.score > 0),
    );
  }, [shouldSearchApps, trimmedQuery, widgets]);

  const scoredRouteResults = useMemo(() => {
    if (!trimmedQuery || !shouldSearchPages) return [];
    return sortScoredResults(
      routeSearchItems
        .filter((item) => item.group === "page")
        .map((item) =>
          withSearchResultSection({
            id: `route:${item.key}`,
            kind: "route",
            score: getTextMatchScore(trimmedQuery, [item.title], [
              item.description,
              item.path,
              ...item.keywords,
            ]),
            item,
          }),
        )
        .filter((result) => result.score > 0),
    );
  }, [routeSearchItems, shouldSearchPages, trimmedQuery]);

  const scoredSettingResults = useMemo(() => {
    if (!trimmedQuery || !shouldSearchSettings) return [];
    return sortScoredResults(
      routeSearchItems
        .filter((item) => item.group === "setting")
        .map((item) =>
          withSearchResultSection({
            id: `setting:${item.key}`,
            kind: "setting",
            score: getTextMatchScore(trimmedQuery, [item.title], [
              item.description,
              item.path,
              ...item.keywords,
            ]),
            item,
          }),
        )
        .filter((result) => result.score > 0),
    );
  }, [routeSearchItems, shouldSearchSettings, trimmedQuery]);

  const websiteResultGroups = useMemo(
    () => splitInternalResults(scoredWebsiteResults),
    [scoredWebsiteResults],
  );
  const appResultGroups = useMemo(
    () => splitInternalResults(scoredAppResults),
    [scoredAppResults],
  );
  const routeResultGroups = useMemo(
    () => splitInternalResults(scoredRouteResults),
    [scoredRouteResults],
  );
  const settingResultGroups = useMemo(
    () => splitInternalResults(scoredSettingResults),
    [scoredSettingResults],
  );

  const strongInternalItems = useMemo<FocusableItem[]>(
    () => [
      ...websiteResultGroups.strong.map((result) => ({
        id: result.id,
        type: "website" as const,
        website: result.item,
      })),
      ...appResultGroups.strong.map((result) => ({
        id: result.id,
        type: "app" as const,
        widget: result.item,
      })),
      ...routeResultGroups.strong.map((result) => ({
        id: result.id,
        type: "route" as const,
        route: result.item,
      })),
      ...settingResultGroups.strong.map((result) => ({
        id: result.id,
        type: "setting" as const,
        setting: result.item,
      })),
    ],
    [
      appResultGroups.strong,
      routeResultGroups.strong,
      settingResultGroups.strong,
      websiteResultGroups.strong,
    ],
  );

  const weakInternalItems = useMemo<FocusableItem[]>(
    () => [
      ...websiteResultGroups.weak.map((result) => ({
        id: result.id,
        type: "website" as const,
        website: result.item,
      })),
      ...appResultGroups.weak.map((result) => ({
        id: result.id,
        type: "app" as const,
        widget: result.item,
      })),
      ...routeResultGroups.weak.map((result) => ({
        id: result.id,
        type: "route" as const,
        route: result.item,
      })),
      ...settingResultGroups.weak.map((result) => ({
        id: result.id,
        type: "setting" as const,
        setting: result.item,
      })),
    ],
    [
      appResultGroups.weak,
      routeResultGroups.weak,
      settingResultGroups.weak,
      websiteResultGroups.weak,
    ],
  );

  const focusableItems = useMemo<FocusableItem[]>(() => {
    const items: FocusableItem[] = [];
    for (const history of visibleHistoryItems) {
      items.push({
        id: `history:${history.id}`,
        type: "history",
        history,
      });
    }
    for (const shortcut of visibleShortcutItems) {
      items.push({
        id: `shortcut:${shortcut.code}`,
        type: "shortcut",
        shortcut,
      });
    }
    if (isSearchDebouncing) return items;
    items.push(...strongInternalItems);
    if (trimmedQuery && shouldSearchWeb && primaryEngines.length) {
      items.push({ id: "action:selected", type: "selected-search" });
      items.push({ id: "action:all", type: "all-search" });
    }
    for (const group of visibleSuggestionGroups) {
      for (const suggestion of group.suggestions) {
        items.push({
          id: `suggestion:${group.engine._id}:${suggestion}`,
          type: "suggestion",
          engine: group.engine,
          suggestion,
        });
      }
    }
    items.push(...weakInternalItems);
    return items;
  }, [
    primaryEngines.length,
    isSearchDebouncing,
    shouldSearchWeb,
    strongInternalItems,
    trimmedQuery,
    visibleHistoryItems,
    visibleShortcutItems,
    visibleSuggestionGroups,
    weakInternalItems,
  ]);

  const activeItem = useMemo(
    () => focusableItems.find((item) => item.id === activeItemId) ?? null,
    [activeItemId, focusableItems],
  );

  const navigationIndexById = useMemo(
    () => new Map(focusableItems.map((item, index) => [item.id, index])),
    [focusableItems],
  );

  useEffect(() => {
    if (!activeItemId || navigationIndexById.has(activeItemId)) return;
    setActiveItemId(null);
  }, [activeItemId, navigationIndexById]);

  useEffect(() => {
    if (!activeItemId) return;
    const activeElement = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>(
        "[data-search-item-id]",
      ) ?? [],
    ).find((element) => element.dataset.searchItemId === activeItemId);
    activeElement?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeItemId]);

  const getNavigationMeta = useCallback(
    (itemId: string) => {
      const index = navigationIndexById.get(itemId) ?? 0;
      return {
        itemId,
        navigationRow: Math.floor(index / 2),
        navigationCol: index % 2,
        onMouseEnter: () => setActiveItemId(itemId),
      };
    },
    [navigationIndexById],
  );

  const moveActiveItemLinear = useCallback(
    (direction: NavigationDirection) => {
      if (!focusableItems.length) return;
      const currentIndex = activeItemId
        ? focusableItems.findIndex((item) => item.id === activeItemId)
        : -1;

      if (currentIndex < 0) {
        setActiveItemId(
          direction === "up" || direction === "left"
            ? focusableItems[focusableItems.length - 1].id
            : focusableItems[0].id,
        );
        return;
      }

      const delta = direction === "down" || direction === "right" ? 1 : -1;
      const nextIndex = Math.min(
        Math.max(currentIndex + delta, 0),
        focusableItems.length - 1,
      );
      setActiveItemId(focusableItems[nextIndex].id);
    },
    [activeItemId, focusableItems],
  );

  const moveActiveItem = useCallback(
    (direction: NavigationDirection) => {
      const order = navigationIndexById;
      const elements = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>(
          "[data-search-item-id]",
        ) ?? [],
      )
        .map((element) => {
          const id = element.dataset.searchItemId;
          if (!id || !order.has(id)) return null;
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) return null;
          return {
            id,
            rect,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
            order: order.get(id) ?? 0,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => a.order - b.order);

      if (!elements.length) {
        moveActiveItemLinear(direction);
        return;
      }

      const current = activeItemId
        ? elements.find((item) => item.id === activeItemId)
        : null;
      if (!current) {
        setActiveItemId(
          direction === "up" || direction === "left"
            ? elements[elements.length - 1].id
            : elements[0].id,
        );
        return;
      }

      const overlapsCurrentRow = (rect: DOMRect) =>
        Math.min(rect.bottom, current.rect.bottom) -
          Math.max(rect.top, current.rect.top) >
        Math.min(rect.height, current.rect.height) * 0.35;

      if (direction === "left" || direction === "right") {
        const horizontalCandidates = elements
          .filter((item) => item.id !== current.id)
          .filter((item) => overlapsCurrentRow(item.rect))
          .filter((item) =>
            direction === "left"
              ? item.centerX < current.centerX - 1
              : item.centerX > current.centerX + 1,
          )
          .sort((a, b) => {
            const distanceA = Math.abs(a.centerX - current.centerX);
            const distanceB = Math.abs(b.centerX - current.centerX);
            return (
              distanceA - distanceB ||
              Math.abs(a.centerY - current.centerY) -
                Math.abs(b.centerY - current.centerY) ||
              a.order - b.order
            );
          });

        if (horizontalCandidates[0]) {
          setActiveItemId(horizontalCandidates[0].id);
        }
        return;
      }

      const verticalCandidates = elements
        .filter((item) => item.id !== current.id)
        .filter((item) =>
          direction === "up"
            ? item.centerY < current.centerY - 4 &&
              !overlapsCurrentRow(item.rect)
            : item.centerY > current.centerY + 4 &&
              !overlapsCurrentRow(item.rect),
        )
        .sort((a, b) => {
          const verticalDistanceA = Math.abs(a.centerY - current.centerY);
          const verticalDistanceB = Math.abs(b.centerY - current.centerY);
          const horizontalDistanceA = Math.abs(a.centerX - current.centerX);
          const horizontalDistanceB = Math.abs(b.centerX - current.centerX);
          return (
            verticalDistanceA - verticalDistanceB ||
            horizontalDistanceA - horizontalDistanceB ||
            a.order - b.order
          );
        });

      if (verticalCandidates[0]) {
        setActiveItemId(verticalCandidates[0].id);
      }
    },
    [
      activeItemId,
      moveActiveItemLinear,
      navigationIndexById,
    ],
  );

  const closeSpotlight = useCallback(() => {
    if (variant !== "spotlight") return;
    onClose?.();
    setActiveItemId(null);
  }, [onClose, variant]);

  const closeUnifiedSearch = useCallback(() => {
    setActiveItemId(null);
    setExpandedSuggestionEngineIds([]);

    if (variant === "spotlight") {
      onClose?.();
      return;
    }

    setDesktopPanelMounted(true);
    setDesktopClearAfterClose(true);
    setDesktopClosing(true);
    inputRef.current?.blur();
  }, [onClose, variant]);

  useEffect(() => {
    if (variant !== "desktop" || (!desktopFocused && !query.trim())) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      closeUnifiedSearch();
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      window.removeEventListener("pointerdown", handlePointerDown, true);
  }, [closeUnifiedSearch, desktopFocused, query, variant]);

  const recordHistory = useCallback((item: Omit<SearchHistoryItem, "updatedAt">) => {
    setSearchHistory((current) => {
      const nextItem = { ...item, updatedAt: Date.now() };
      const next = [
        nextItem,
        ...current.filter((history) => history.id !== nextItem.id),
      ].slice(0, SEARCH_HISTORY_LIMIT);
      writeSearchHistory(next);
      return next;
    });
  }, []);

  const openWithEngines = useCallback(
    (targetEngines: SearchEngineItem[], searchText: string) => {
      const text = searchText.trim();
      if (!text) {
        message.warning("请输入搜索内容");
        return false;
      }
      if (!targetEngines.length) {
        message.warning("暂无可用搜索引擎");
        return false;
      }

      targetEngines.forEach((engine) => {
        window.open(
          buildSearchEngineUrl(engine, text),
          "_blank",
          "noopener,noreferrer",
        );
      });
      return true;
    },
    [message],
  );

  const openWebsite = useCallback(
    (website: any) => {
      const url = resolveHttpUrl(getWebsiteUrl(website));
      if (!url) {
        message.warning("网站地址无效");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
      closeSpotlight();
    },
    [closeSpotlight, message],
  );

  const openApp = useCallback(
    (widget: WidgetApiItem) => {
      if (onOpenApp) {
        onOpenApp(widget);
      } else {
        navigate(storeRoute.path.app);
      }
      closeSpotlight();
    },
    [closeSpotlight, navigate, onOpenApp],
  );

  const openSetting = useCallback(
    (setting: RouteSearchItem) => {
      navigate(setting.path);
      closeSpotlight();
    },
    [closeSpotlight, navigate],
  );

  const applyShortcut = useCallback(
    (shortcut: SearchShortcutItem) => {
      const remainder =
        query.trim().match(/^@[^\s:：]+(?:[\s:：]+(.*))?$/)?.[1]?.trim() ??
        "";
      setQuery(`@${shortcut.code}${remainder ? ` ${remainder}` : " "}`);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    [query],
  );

  const runFocusableItem = useCallback(
    (item: FocusableItem | null) => {
      const targetItem =
        item ??
        (!showShortcutSuggestions && !shouldSearchWeb
          ? (focusableItems[0] ?? null)
          : null);
      const actionSearchText = currentQueryText || trimmedQuery;
      const currentShouldSearchWeb =
        currentSearchScope === "all" || currentSearchScope === "web-search";
      const defaultSearchText = actionSearchText || rawQuery;
      const primaryEngineNames = primaryEngines
        .map((engine) => engine.name)
        .join("、");

      if (!targetItem) {
        if (
          (currentShouldSearchWeb || !currentQueryText) &&
          openWithEngines(primaryEngines, defaultSearchText)
        ) {
          recordHistory({
            id: `search:selected:${defaultSearchText}`,
            kind: "search",
            title: defaultSearchText,
            description: primaryEngineNames
              ? `用 ${primaryEngineNames} 搜索`
              : "网页搜索",
            query: defaultSearchText,
          });
          closeSpotlight();
        }
        return;
      }

      if (targetItem.type === "history") {
        const history = targetItem.history;
        recordHistory(history);
        if (history.kind === "search") {
          if (openWithEngines(primaryEngines, history.query ?? history.title)) {
            closeSpotlight();
          }
          return;
        }
        if (history.kind === "shortcut") {
          const shortcut = SEARCH_SHORTCUTS.find(
            (item) => item.code === history.shortcutCode,
          );
          if (shortcut) applyShortcut(shortcut);
          return;
        }
        if (history.kind === "website") {
          const url = resolveHttpUrl(history.url);
          if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
            closeSpotlight();
          } else {
            message.warning("网站地址无效");
          }
          return;
        }
        if (history.kind === "app") {
          const widget = (widgets ?? []).find(
            (item) => item._id === history.widgetId,
          );
          if (widget) {
            openApp(widget);
          } else {
            navigate(storeRoute.path.app);
            closeSpotlight();
          }
          return;
        }
        if (history.kind === "route") {
          navigate(history.routePath ?? "/");
          closeSpotlight();
          return;
        }
        navigate(history.settingPath ?? settingsRoute.path.search);
        closeSpotlight();
        return;
      }
      if (targetItem.type === "shortcut") {
        recordHistory({
          id: `shortcut:${targetItem.shortcut.code}`,
          kind: "shortcut",
          title: `@${targetItem.shortcut.code} ${targetItem.shortcut.label}`,
          description: targetItem.shortcut.description,
          shortcutCode: targetItem.shortcut.code,
          shortcutScope: targetItem.shortcut.scope,
        });
        applyShortcut(targetItem.shortcut);
        return;
      }
      if (targetItem.type === "selected-search") {
        if (openWithEngines(primaryEngines, actionSearchText)) {
          recordHistory({
            id: `search:selected:${actionSearchText}`,
            kind: "search",
            title: actionSearchText,
            description: primaryEngineNames
              ? `用 ${primaryEngineNames} 搜索`
              : "网页搜索",
            query: actionSearchText,
          });
          closeSpotlight();
        }
        return;
      }
      if (targetItem.type === "all-search") {
        if (openWithEngines(engines, actionSearchText)) {
          recordHistory({
            id: `search:all:${actionSearchText}`,
            kind: "search",
            title: actionSearchText,
            description: "打开全部搜索引擎",
            query: actionSearchText,
          });
          closeSpotlight();
        }
        return;
      }
      if (targetItem.type === "engine-search") {
        if (openWithEngines([targetItem.engine], actionSearchText)) {
          recordHistory({
            id: `search:${targetItem.engine._id}:${actionSearchText}`,
            kind: "search",
            title: actionSearchText,
            description: `用 ${targetItem.engine.name} 搜索`,
            query: actionSearchText,
          });
          closeSpotlight();
        }
        return;
      }
      if (targetItem.type === "suggestion") {
        setQuery(targetItem.suggestion);
        if (openWithEngines(primaryEngines, targetItem.suggestion)) {
          recordHistory({
            id: `search:suggestion:${targetItem.suggestion}`,
            kind: "search",
            title: targetItem.suggestion,
            description: primaryEngineNames
              ? `用 ${primaryEngineNames} 搜索`
              : "网页搜索",
            query: targetItem.suggestion,
          });
          closeSpotlight();
        }
        return;
      }
      if (targetItem.type === "website") {
        recordHistory({
          id: `website:${getWebsiteId(targetItem.website)}`,
          kind: "website",
          title: getWebsiteName(targetItem.website),
          description: getWebsiteUrl(targetItem.website),
          url: getWebsiteUrl(targetItem.website),
        });
        openWebsite(targetItem.website);
        return;
      }
      if (targetItem.type === "app") {
        recordHistory({
          id: `app:${targetItem.widget._id}`,
          kind: "app",
          title: targetItem.widget.name,
          description: targetItem.widget.description || "应用",
          widgetId: targetItem.widget._id,
        });
        openApp(targetItem.widget);
        return;
      }
      if (targetItem.type === "route") {
        recordHistory({
          id: `route:${targetItem.route.key}`,
          kind: "route",
          title: targetItem.route.title,
          description: targetItem.route.description,
          routePath: targetItem.route.path,
        });
        navigate(targetItem.route.path);
        closeSpotlight();
        return;
      }
      recordHistory({
        id: `setting:${targetItem.setting.key}`,
        kind: "setting",
        title: targetItem.setting.title,
        description: targetItem.setting.description,
        settingPath: targetItem.setting.path,
      });
      openSetting(targetItem.setting);
    },
    [
      applyShortcut,
      closeSpotlight,
      engines,
      focusableItems,
      message,
      navigate,
      openApp,
      openSetting,
      openWebsite,
      openWithEngines,
      primaryEngines,
      currentQueryText,
      currentSearchScope,
      rawQuery,
      recordHistory,
      showShortcutSuggestions,
      trimmedQuery,
      widgets,
    ],
  );

  const toggleEngine = useCallback(
    (engineId: string) => {
      setSelectedEngineIds((current) => {
        const exists = current.includes(engineId);
        if (exists && current.length <= 1) {
          message.warning("请至少选择一个搜索引擎");
          return current;
        }
        const next = exists
          ? current.filter((id) => id !== engineId)
          : [...current, engineId];
        writeSelectedEngineIds(next);
        return next;
      });
    },
    [message],
  );

  const toggleSuggestionEngineExpanded = useCallback((engineId: string) => {
    setExpandedSuggestionEngineIds((current) =>
      current.includes(engineId)
        ? current.filter((id) => id !== engineId)
        : [...current, engineId],
    );
  }, []);

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeUnifiedSearch();
      return;
    }

    const directionByKey: Record<string, NavigationDirection> = {
      ArrowDown: "down",
      ArrowUp: "up",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const direction = directionByKey[event.key];
    if (direction) {
      if (!focusableItems.length) return;
      if ((direction === "left" || direction === "right") && !activeItemId) {
        return;
      }
      event.preventDefault();
      moveActiveItem(direction);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      runFocusableItem(activeItem);
    }
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeUnifiedSearch();
  };

  const renderSearchInput = () => (
    <div
      className={cx(
        unifiedSearchInputClassName,
        variant === "desktop"
          ? unifiedSearchDesktopInputClassName
          : unifiedSearchSpotlightInputClassName,
        desktopSearchActive ? unifiedSearchDesktopInputActiveClassName : null,
      )}
    >
      <RiSearchLine size={21} className="shrink-0 text-[#6e6e73]" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          if (desktopClosing) {
            setDesktopClosing(false);
            setDesktopClearAfterClose(false);
          }
          setDesktopPanelMounted(true);
          setQuery(event.target.value);
        }}
        onKeyDown={handleInputKeyDown}
        onFocus={() => {
          if (desktopClosing) {
            setDesktopClosing(false);
            setDesktopClearAfterClose(false);
          }
          setDesktopPanelMounted(true);
          setDesktopFocused(true);
        }}
        autoComplete="off"
        spellCheck={false}
        placeholder="搜索网页、网站、应用、设置，输入 @ 查看命令"
        className="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-semibold text-[#1d1d1f] outline-none placeholder:text-[#8e8e93] dark:text-[#f5f5f7]"
      />
      {query ? (
        <button
          type="button"
          aria-label="清空"
          className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#8e8e93] hover:bg-black/5 dark:hover:bg-white/10"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
        >
          <RiCloseLine size={18} />
        </button>
      ) : (
        <span className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            title="快捷搜索命令"
            className="h-6 cursor-pointer rounded-md border-0 bg-black/[0.06] px-2 text-[11px] font-bold text-[#6e6e73] hover:bg-black/[0.09] dark:bg-white/10 dark:text-[#aeaeb2] dark:hover:bg-white/[0.14]"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("@");
              inputRef.current?.focus();
            }}
          >
            @命令
          </button>
          {showShortcutHint ? (
            <span className="flex items-center gap-1">
              {getUnifiedSearchShortcutParts(shortcut).map((part, index) => (
                <kbd
                  key={`${part}-${index}`}
                  className="min-w-5 rounded-md bg-black/[0.06] px-1.5 py-0.5 text-center text-[11px] font-bold not-italic text-[#6e6e73] dark:bg-white/10 dark:text-[#aeaeb2]"
                >
                  {part}
                </kbd>
              ))}
            </span>
          ) : null}
        </span>
      )}
    </div>
  );

  const renderHistory = () => {
    if (!showStartPanel || !visibleHistoryItems.length) return null;

    return (
      <SearchSection title="最近使用">
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {visibleHistoryItems.map((history) => {
            const itemId = `history:${history.id}`;
            return (
              <SearchResultButton
                key={history.id}
                {...getNavigationMeta(itemId)}
                active={activeItemId === itemId}
                icon={renderHistoryIcon(history)}
                title={history.title}
                description={history.description}
                compact
                onClick={() =>
                  runFocusableItem({
                    id: itemId,
                    type: "history",
                    history,
                  })
                }
              />
            );
          })}
        </div>
      </SearchSection>
    );
  };

  const renderShortcutSuggestions = () => {
    if (!visibleShortcutItems.length) return null;

    return (
      <SearchSection title={showStartPanel ? "快捷命令" : "快捷搜索"}>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {visibleShortcutItems.map((shortcut) => {
            const itemId = `shortcut:${shortcut.code}`;
            return (
              <SearchResultButton
                key={shortcut.code}
                {...getNavigationMeta(itemId)}
                active={activeItemId === itemId}
                icon={renderShortcutIcon(shortcut.scope)}
                title={`@${shortcut.code} ${shortcut.label}`}
                description={`${shortcut.description} · ${shortcut.example}`}
                compact
                onClick={() =>
                  runFocusableItem({
                    id: itemId,
                    type: "shortcut",
                    shortcut,
                  })
                }
              />
            );
          })}
        </div>
      </SearchSection>
    );
  };

  const renderEnginePicker = () => {
    if (!enginesLoading && engines.length === 0) return null;

    return (
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {!enginesLoading && engines.length > 0 ? (
          <span className="mr-0.5 px-1 text-[11px] font-extrabold text-[#8e8e93]">
            使用
          </span>
        ) : null}
        {enginesLoading ? (
          <span className="px-2 text-xs font-semibold text-[#8e8e93]">
            读取中
          </span>
        ) : null}
        {engines.map((engine) => {
          const checked = selectedEngineIds.includes(engine._id);
          return (
            <button
              type="button"
              key={engine._id}
              onClick={() => toggleEngine(engine._id)}
              className={cx(
                "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold transition",
                checked
                  ? "border-[#007aff] bg-[#007aff] text-white shadow-[0_8px_18px_rgba(0,122,255,0.20)]"
                  : "border-black/10 bg-white/70 text-[#424245] hover:border-[#007aff]/40 dark:border-white/10 dark:bg-white/10 dark:text-[#f5f5f7]",
              )}
            >
              {renderInlineSvgIcon(
                engine.icon,
                <RiGlobalLine size={14} />,
                engine.name,
              )}
              <span className="max-w-[90px] truncate">{engine.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderActionSection = () => {
    const actionSearchText = currentQueryText || trimmedQuery;
    if (!actionSearchText || !shouldSearchWeb || !primaryEngines.length) {
      return null;
    }
    return (
      <SearchSection title="搜索">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SearchResultButton
            {...getNavigationMeta("action:selected")}
            active={activeItemId === "action:selected"}
            icon={<RiSearchLine size={17} />}
            title={`用 ${primaryEngines.map((engine) => engine.name).join("、")} 搜索`}
            description={actionSearchText}
            compact
            onClick={() =>
              runFocusableItem({ id: "action:selected", type: "selected-search" })
            }
          />
          <SearchResultButton
            {...getNavigationMeta("action:all")}
            active={activeItemId === "action:all"}
            icon={<RiArrowRightUpLine size={17} />}
            title="打开全部搜索引擎"
            description={`${engines.length} 个搜索页`}
            compact
            onClick={() =>
              runFocusableItem({ id: "action:all", type: "all-search" })
            }
          />
        </div>
      </SearchSection>
    );
  };

  const renderSuggestions = () => {
    if (!shouldSearchWeb) return null;
    if (!trimmedQuery && !suggestionsLoading) return null;
    if (suggestionsLoading && !suggestionGroups.length) {
      return (
        <SearchSection title="建议">
          <div className="flex h-12 items-center justify-center">
            <Spin size="small" />
          </div>
        </SearchSection>
      );
    }
    if (!visibleSuggestionGroups.length) return null;
    return (
      <SearchSection title="建议">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {visibleSuggestionGroups.map((group) => {
            const totalCount =
              suggestionCountByEngineId.get(group.engine._id) ?? 0;
            const expanded = expandedSuggestionEngineSet.has(group.engine._id);
            const canToggle = expanded || totalCount > group.suggestions.length;

            return (
              <div key={group.engine._id} className="min-w-0">
                <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-bold text-[#8e8e93]">
                  {renderInlineSvgIcon(
                    group.engine.icon,
                    <RiGlobalLine size={13} />,
                    group.engine.name,
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {group.engine.name}
                  </span>
                  {canToggle ? (
                    <button
                      type="button"
                      className="cursor-pointer rounded-full border-0 bg-transparent px-1.5 py-0.5 text-[11px] font-extrabold text-[#007aff] hover:bg-[#007aff]/10 dark:text-[#64a9ff]"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() =>
                        toggleSuggestionEngineExpanded(group.engine._id)
                      }
                    >
                      {expanded ? "收起" : "展开"}
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-1">
                  {group.suggestions.map((suggestion) => {
                    const itemId = `suggestion:${group.engine._id}:${suggestion}`;
                    return (
                      <SearchResultButton
                        key={`${group.engine._id}-${suggestion}`}
                        {...getNavigationMeta(itemId)}
                        active={activeItemId === itemId}
                        icon={<RiSearchLine size={16} />}
                        title={suggestion}
                        compact
                        onClick={() =>
                          runFocusableItem({
                            id: itemId,
                            type: "suggestion",
                            engine: group.engine,
                            suggestion,
                          })
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </SearchSection>
    );
  };

  const renderWebsites = (
    results: StandardizedSearchResult<any>[],
    options?: { title?: string; showLoading?: boolean },
  ) => {
    if (!trimmedQuery || !shouldSearchWebsites) return null;
    if (options?.showLoading && websiteLoading && !websiteResults.length) {
      return (
        <SearchSection title={options.title ?? "网站"}>
          <div className="flex h-14 items-center justify-center">
            <Spin size="small" />
          </div>
        </SearchSection>
      );
    }
    if (!results.length) return null;
    return (
      <SearchSection title={options?.title ?? "网站"}>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {results.map((result) => {
            const website = result.item;
            const name = getWebsiteName(website);
            const iconUrl = getWebsiteIconUrl(website);
            return (
              <SearchResultButton
                key={result.id}
                {...getNavigationMeta(result.id)}
                active={activeItemId === result.id}
                icon={
                  typeof iconUrl === "string" && iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={name}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <RiGlobalLine size={17} />
                  )
                }
                title={name}
                description={getWebsiteUrl(website)}
                onClick={() =>
                  runFocusableItem({
                    id: result.id,
                    type: "website",
                    website,
                  })
                }
              />
            );
          })}
        </div>
      </SearchSection>
    );
  };

  const renderApps = (
    results: StandardizedSearchResult<WidgetApiItem>[],
    options?: { title?: string; showLoading?: boolean },
  ) => {
    if (!trimmedQuery || !shouldSearchApps) return null;
    if (options?.showLoading && widgetsLoading && !scoredAppResults.length) {
      return (
        <SearchSection title={options.title ?? "应用"}>
          <div className="flex h-14 items-center justify-center">
            <Spin size="small" />
          </div>
        </SearchSection>
      );
    }
    if (!results.length) return null;
    return (
      <SearchSection title={options?.title ?? "应用"}>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {results.map((result) => {
            const widget = result.item;
            const iconUrl = getAppIconUrl(widget);
            return (
              <SearchResultButton
                key={result.id}
                {...getNavigationMeta(result.id)}
                active={activeItemId === result.id}
                icon={
                  iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={widget.name}
                      className="h-full w-full rounded-lg object-contain p-1"
                    />
                  ) : (
                    <RiApps2Line size={17} />
                  )
                }
                title={widget.name}
                description={widget.description || "应用"}
                tag={widget.version ? `v${widget.version}` : undefined}
                onClick={() =>
                  runFocusableItem({
                    id: result.id,
                    type: "app",
                    widget,
                  })
                }
              />
            );
          })}
        </div>
      </SearchSection>
    );
  };

  const renderRoutes = (
    results: StandardizedSearchResult<RouteSearchItem>[],
    title = "页面",
  ) => {
    if (!shouldSearchPages) return null;
    if (!results.length) return null;
    return (
      <SearchSection title={title}>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {results.map((result) => {
            const route = result.item;
            return (
              <SearchResultButton
                key={result.id}
                {...getNavigationMeta(result.id)}
                active={activeItemId === result.id}
                icon={route.icon ?? <RiApps2Line size={17} />}
                title={route.title}
                description={route.description}
                onClick={() =>
                  runFocusableItem({
                    id: result.id,
                    type: "route",
                    route,
                  })
                }
              />
            );
          })}
        </div>
      </SearchSection>
    );
  };

  const renderSettings = (
    results: StandardizedSearchResult<RouteSearchItem>[],
    title = "设置",
  ) => {
    if (!shouldSearchSettings) return null;
    if (!results.length) return null;
    return (
      <SearchSection title={title}>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {results.map((result) => {
            const setting = result.item;
            return (
              <SearchResultButton
                key={result.id}
                {...getNavigationMeta(result.id)}
                active={activeItemId === result.id}
                icon={<RiSettings3Line size={17} />}
                title={setting.title}
                description={setting.description}
                onClick={() =>
                  runFocusableItem({
                    id: result.id,
                    type: "setting",
                    setting,
                  })
                }
              />
            );
          })}
        </div>
      </SearchSection>
    );
  };

  const hasResults =
    ((showStartPanel || showShortcutSuggestions) &&
      (visibleHistoryItems.length > 0 || visibleShortcutItems.length > 0)) ||
    (Boolean(trimmedQuery) &&
      ((shouldSearchWeb && visibleSuggestionGroups.length > 0) ||
        scoredWebsiteResults.length > 0 ||
        scoredAppResults.length > 0 ||
        scoredRouteResults.length > 0 ||
        scoredSettingResults.length > 0 ||
        (shouldSearchWebsites && websiteLoading) ||
        (shouldSearchApps && widgetsLoading) ||
        (shouldSearchWeb && suggestionsLoading)));
  const desktopSearchActive =
    variant === "desktop" &&
    (desktopFocused ||
      desktopClosing ||
      desktopPanelMounted ||
      Boolean(query.trim()));
  const showPanel =
    variant === "desktop"
      ? desktopPanelShouldOpen || desktopPanelMounted || desktopClosing
      : desktopPanelShouldOpen;

  const renderPanel = () => {
    const enginePicker = renderEnginePicker();
    const showPanelHeader = Boolean(enginePicker) || variant === "spotlight";

    return (
      <div
        className={cx(
          unifiedSearchPanelClassName,
          variant === "desktop"
            ? unifiedSearchDesktopPanelClassName
            : unifiedSearchSpotlightPanelClassName,
          variant === "desktop" && desktopClosing
            ? unifiedSearchDesktopPanelClosingClassName
            : null,
        )}
      >
        <div className={unifiedSearchPanelContentClassName}>
          {showPanelHeader ? (
            <div className="flex items-center justify-between gap-3 px-1 pb-3">
              {enginePicker}
              {variant === "spotlight" ? (
                <Button
                  type="text"
                  size="small"
                  shape="circle"
                  aria-label="关闭"
                  icon={<RiCloseLine size={17} />}
                  onClick={closeUnifiedSearch}
                />
              ) : null}
            </div>
          ) : null}
          <div
            className={cx(
              unifiedSearchPanelBodyClassName,
              variant === "desktop"
                ? unifiedSearchDesktopPanelBodyClassName
                : unifiedSearchSpotlightPanelBodyClassName,
            )}
          >
            {renderHistory()}
            {renderShortcutSuggestions()}
            {isSearchDebouncing ? (
              <SearchSection title="搜索">
                <div className="flex h-14 items-center justify-center">
                  <Spin size="small" />
                </div>
              </SearchSection>
            ) : (
              <>
                {renderWebsites(websiteResultGroups.strong, {
                  title: "网站",
                  showLoading: true,
                })}
                {renderApps(appResultGroups.strong, {
                  title: "应用",
                  showLoading: true,
                })}
                {renderRoutes(routeResultGroups.strong, "页面")}
                {renderSettings(settingResultGroups.strong, "设置")}
                {renderActionSection()}
                {renderSuggestions()}
                {renderWebsites(websiteResultGroups.weak, { title: "更多网站" })}
                {renderApps(appResultGroups.weak, { title: "更多应用" })}
                {renderRoutes(routeResultGroups.weak, "更多页面")}
                {renderSettings(settingResultGroups.weak, "更多设置")}
              </>
            )}
            {currentQueryText && !isSearchDebouncing && !hasResults ? (
              <div className="py-8">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="没有匹配内容"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const shouldRender = variant === "spotlight" ? spotlightMounted : open;
  if (!shouldRender) return null;

  if (variant === "spotlight") {
    return (
      <div
        className={cx(
          unifiedSearchOverlayClassName,
          spotlightClosing ? unifiedSearchOverlayClosingClassName : null,
        )}
        onMouseDown={closeUnifiedSearch}
      >
        <div
          ref={rootRef}
          role="dialog"
          aria-modal="true"
          className={cx(
            unifiedSearchIntegratedSurfaceClassName,
            unifiedSearchSpotlightClassName,
            spotlightClosing ? unifiedSearchSpotlightClosingClassName : null,
            className,
          )}
          onKeyDown={handleDialogKeyDown}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {renderSearchInput()}
          {renderPanel()}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cx(unifiedSearchDesktopClassName, className)}
      onKeyDown={handleDialogKeyDown}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
          setDesktopFocused(false);
        }
      }}
    >
      <div className={unifiedSearchDesktopPlaceholderClassName} aria-hidden />
      <div
        className={cx(
          unifiedSearchDesktopShellClassName,
          desktopSearchActive ? unifiedSearchIntegratedSurfaceClassName : null,
          desktopSearchActive ? unifiedSearchDesktopShellActiveClassName : null,
        )}
      >
        {renderSearchInput()}
        {showPanel ? renderPanel() : null}
      </div>
    </div>
  );
};

const SearchSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section>
    <div className="mb-2 px-1 text-[12px] font-extrabold text-[#6e6e73] dark:text-[#aeaeb2]">
      {title}
    </div>
    {children}
  </section>
);

const SearchResultButton = ({
  itemId,
  navigationRow,
  navigationCol,
  icon,
  title,
  description,
  tag,
  active,
  compact,
  onMouseEnter,
  onClick,
}: {
  itemId?: string;
  navigationRow?: number;
  navigationCol?: number;
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tag?: ReactNode;
  active?: boolean;
  compact?: boolean;
  onMouseEnter?: () => void;
  onClick: () => void;
}) => (
  <button
    type="button"
    data-search-item-id={itemId}
    data-search-active={active ? "true" : undefined}
    data-search-row={navigationRow}
    data-search-col={navigationCol}
    onMouseEnter={onMouseEnter}
    onClick={onClick}
    className={cx(
      "grid w-full cursor-pointer grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 text-left transition",
      compact ? "min-h-10 py-1.5" : "min-h-[54px] py-2",
      active
        ? "border-[#007aff]/45 bg-[#e8f2ff] shadow-[0_8px_18px_rgba(0,122,255,0.10)] dark:bg-[#0a84ff]/20"
        : "border-transparent bg-white/65 hover:bg-white/95 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
    )}
  >
    <span className="grid h-[34px] w-[34px] place-items-center overflow-hidden rounded-[10px] bg-[#f2f2f7] text-[#007aff] dark:bg-white/10">
      {icon}
    </span>
    <span className="min-w-0">
      <span className="block truncate text-[13px] font-extrabold text-[#1d1d1f] dark:text-[#f5f5f7]">
        {title}
      </span>
      {description ? (
        <span className="mt-0.5 block truncate text-[12px] font-medium text-[#6e6e73] dark:text-[#aeaeb2]">
          {description}
        </span>
      ) : null}
    </span>
    {tag ? (
      <Tag className="m-0! rounded-full! border-0! bg-[#f2f2f7]! text-[11px]! font-bold! text-[#6e6e73]! dark:bg-white/10! dark:text-[#aeaeb2]!">
        {tag}
      </Tag>
    ) : (
      <RiArrowRightUpLine size={16} className="text-[#8e8e93]" />
    )}
  </button>
);

export const DesktopSearchBar = (
  props: Omit<UnifiedSearchProps, "variant" | "open">,
) => <UnifiedSearch {...props} variant="desktop" open />;

export const SearchSpotlight = (
  props: Omit<UnifiedSearchProps, "variant">,
) => <UnifiedSearch {...props} variant="spotlight" autoFocus />;

export default UnifiedSearch;

const unifiedSearchDesktopClassName = css`
  position: relative;
  z-index: 80;
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px 12px;
`;

const unifiedSearchDesktopPlaceholderClassName = css`
  width: min(520px, calc(100vw - 48px));
  height: 44px;
  margin: 0 auto;
  pointer-events: none;
`;

const unifiedSearchDesktopShellClassName = css`
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1;
  box-sizing: border-box;
  width: min(520px, calc(100vw - 48px));
  transform: translateX(-50%);
  transition: width 220ms ease;
`;

const unifiedSearchDesktopShellActiveClassName = css`
  width: min(760px, calc(100vw - 48px));
`;

const unifiedSearchIntegratedSurfaceClassName = css`
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.68);
  background: rgba(245, 245, 247, 0.94);
  box-shadow:
    0 18px 56px rgba(15, 23, 42, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(34px) saturate(1.22);

  [data-search-item-id] > span:first-of-type {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.62);
  }

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(28, 28, 30, 0.94);
    box-shadow:
      0 20px 64px rgba(0, 0, 0, 0.38),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  [data-theme="dark"] & [data-search-item-id] > span:first-of-type {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const unifiedSearchSpotlightClassName = css`
  width: min(760px, calc(100vw - 28px));
  display: grid;
  gap: 0;
  padding: 0;
  transform-origin: top center;
  animation: unified-search-spotlight-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1)
    both;

  @keyframes unified-search-spotlight-in {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.985);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const unifiedSearchOverlayClassName = css`
  position: fixed;
  z-index: 2200;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: min(10vh, 84px);
  background: rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(6px) saturate(1.04);
  animation: unified-search-overlay-in 160ms ease-out both;

  @keyframes unified-search-overlay-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;

const unifiedSearchOverlayClosingClassName = css`
  pointer-events: none;
  animation: unified-search-overlay-out ${SPOTLIGHT_CLOSE_ANIMATION_MS}ms ease
    both;

  @keyframes unified-search-overlay-out {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }
`;

const unifiedSearchSpotlightClosingClassName = css`
  animation: unified-search-spotlight-out ${SPOTLIGHT_CLOSE_ANIMATION_MS}ms
    cubic-bezier(0.4, 0, 1, 1) both;

  @keyframes unified-search-spotlight-out {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    to {
      opacity: 0;
      transform: translateY(-8px) scale(0.985);
    }
  }
`;

const unifiedSearchInputClassName = css`
  display: flex;
  min-height: 46px;
  width: 100%;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 0 12px 0 16px;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
  backdrop-filter: blur(24px) saturate(1.16);
`;

const unifiedSearchDesktopInputClassName = css`
  min-height: 44px;
  border-color: rgba(255, 255, 255, 0.58);
  background: rgba(255, 255, 255, 0.68);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 5px 16px rgba(15, 23, 42, 0.06);

  &:focus-within {
    border-color: rgba(95, 151, 225, 0.34);
    background: rgba(255, 255, 255, 0.82);
    box-shadow:
      0 0 0 3px rgba(95, 151, 225, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      0 11px 30px rgba(46, 84, 128, 0.1);
  }

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(44, 44, 46, 0.68);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 7px 20px rgba(0, 0, 0, 0.18);
  }

  [data-theme="dark"] &:focus-within {
    border-color: rgba(137, 185, 238, 0.26);
    background: rgba(54, 58, 62, 0.76);
    box-shadow:
      0 0 0 3px rgba(137, 185, 238, 0.12),
      0 12px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
`;

const unifiedSearchDesktopInputActiveClassName = css`
  min-height: 56px;
  border-width: 0 0 1px;
  border-color: rgba(0, 0, 0, 0.08);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;

  &:focus-within {
    border-color: rgba(0, 0, 0, 0.1);
    background: transparent;
    box-shadow: none;
  }

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.1);
    background: transparent;
    box-shadow: none;
  }

  [data-theme="dark"] &:focus-within {
    border-color: rgba(255, 255, 255, 0.13);
    background: transparent;
    box-shadow: none;
  }
`;

const unifiedSearchSpotlightInputClassName = css`
  min-height: 56px;
  border-width: 0 0 1px;
  border-color: rgba(0, 0, 0, 0.08);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;

  &:focus-within {
    border-color: rgba(0, 0, 0, 0.1);
    background: transparent;
    box-shadow: none;
  }

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.1);
    background: transparent;
    box-shadow: none;
  }

  [data-theme="dark"] &:focus-within {
    border-color: rgba(255, 255, 255, 0.13);
    background: transparent;
    box-shadow: none;
  }
`;

const unifiedSearchPanelClassName = css`
  display: grid;
  grid-template-rows: 1fr;
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  padding: 14px;
  backdrop-filter: blur(30px) saturate(1.18);
`;

const unifiedSearchPanelContentClassName = css`
  min-height: 0;
  overflow: hidden;
`;

const unifiedSearchDesktopPanelClassName = css`
  border: 0;
  border-radius: 0;
  padding: 12px 14px 14px;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;

  [data-theme="dark"] & {
    border-color: transparent;
    background: transparent;
    box-shadow: none;
  }
`;

const unifiedSearchDesktopPanelClosingClassName = css`
  pointer-events: none;
  overflow: hidden;
  transform-origin: top center;
  animation: unified-search-desktop-panel-out ${DESKTOP_CLOSE_ANIMATION_MS}ms
    cubic-bezier(0.4, 0, 0.2, 1) both;

  @keyframes unified-search-desktop-panel-out {
    from {
      grid-template-rows: 1fr;
      opacity: 1;
      transform: translateY(0);
    }

    to {
      grid-template-rows: 0fr;
      opacity: 0;
      transform: translateY(-8px);
      padding-top: 0;
      padding-bottom: 0;
    }
  }
`;

const unifiedSearchSpotlightPanelClassName = css`
  border: 0;
  border-radius: 0;
  padding: 12px 14px 14px;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;

  [data-theme="dark"] & {
    border-color: transparent;
    background: transparent;
    box-shadow: none;
  }
`;

const unifiedSearchPanelBodyClassName = css`
  display: grid;
  gap: 14px;
  overflow-y: auto;
  padding-right: 4px;
`;

const unifiedSearchDesktopPanelBodyClassName = css`
  max-height: min(52vh, 430px);
`;

const unifiedSearchSpotlightPanelBodyClassName = css`
  max-height: min(66vh, 620px);
`;

const unifiedSearchSvgIconClassName = css`
  display: inline-flex;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;
