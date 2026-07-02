import type { SearchEngineItem } from "@/services/search-engine";

let jsonpCounter = 0;

const SUGGESTION_LIMIT = 8;
const JSONP_TIMEOUT_MS = 7000;

const normalizeSuggestionText = (value: unknown) =>
  String(value ?? "").replace(/\s+/g, " ").trim();

const collectSuggestionStrings = (value: unknown, output: string[]) => {
  if (output.length >= SUGGESTION_LIMIT) return;

  if (typeof value === "string" || typeof value === "number") {
    const text = normalizeSuggestionText(value);
    if (text) output.push(text);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectSuggestionStrings(item, output));
    return;
  }

  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  const likelyText =
    record.query ??
    record.q ??
    record.phrase ??
    record.value ??
    record.word ??
    record.title ??
    record.text ??
    record.name;
  if (likelyText !== undefined) {
    collectSuggestionStrings(likelyText, output);
  }

  const likelyList =
    record.s ??
    record.suggestions ??
    record.result ??
    record.results ??
    record.items ??
    record.data;
  if (likelyList !== undefined) {
    collectSuggestionStrings(likelyList, output);
  }
};

const normalizeSuggestions = (value: unknown, query: string) => {
  const output: string[] = [];
  collectSuggestionStrings(value, output);

  const normalizedQuery = normalizeSuggestionText(query).toLowerCase();
  const seen = new Set<string>();
  return output
    .map(normalizeSuggestionText)
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (key === normalizedQuery || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, SUGGESTION_LIMIT);
};

const runSuggestionTransform = (
  engine: SearchEngineItem,
  response: unknown,
  query: string,
) => {
  const code = engine.jsonpCode?.trim() || "(function(data){ return data; })";
  try {
    const transformer = new Function(`return (${code});`)();
    if (typeof transformer === "function") {
      return transformer(response, query, engine);
    }
    return transformer;
  } catch (error) {
    console.warn("Search suggestion transform failed", error);
    return response;
  }
};

const requestJsonp = (url: string, callbackName: string) =>
  new Promise<unknown>((resolve, reject) => {
    let settled = false;
    const script = document.createElement("script");

    const cleanup = () => {
      window.clearTimeout(timer);
      try {
        delete (window as any)[callbackName];
      } catch {
        (window as any)[callbackName] = undefined;
      }
      script.remove();
    };

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    (window as any)[callbackName] = (payload: unknown) => {
      settle(() => resolve(payload));
    };

    script.async = true;
    script.src = url;
    script.onerror = () => {
      settle(() => reject(new Error("JSONP load failed")));
    };

    const timer = window.setTimeout(() => {
      settle(() => reject(new Error("JSONP timeout")));
    }, JSONP_TIMEOUT_MS);

    document.body.appendChild(script);
  });

export const fetchSearchEngineSuggestions = async (
  engine: SearchEngineItem,
  query: string,
) => {
  if (!engine.suggestUrl || !query.trim()) return [];
  if (
    !engine.suggestUrl.includes("{keyword}") ||
    !engine.suggestUrl.includes("{jsonp}")
  ) {
    return [];
  }

  const callbackName = `__sn_search_suggest_${Date.now()}_${++jsonpCounter}`;
  const url = engine.suggestUrl
    .replace(/\{keyword\}/g, encodeURIComponent(query))
    .replace(/\{jsonp\}/g, callbackName);

  try {
    const response = await requestJsonp(url, callbackName);
    const transformed = await runSuggestionTransform(engine, response, query);
    return normalizeSuggestions(transformed, query);
  } catch (error) {
    console.warn(`Search suggestions failed for ${engine.name}`, error);
    return [];
  }
};
