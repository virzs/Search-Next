import { createInstance } from "i18next";

export const languageStorageKey = "search-next-widget-language";
export const localeEventName = "widget:locale-change";

export const defaultLocale = {
  language: "zh-CN",
  direction: "ltr",
};

export const normalizeLanguage = (value) => {
  const language = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (language === "en-us" || language.startsWith("en")) return "en-US";
  if (language === "zh-cn" || language.startsWith("zh")) return "zh-CN";
  return defaultLocale.language;
};

export const normalizeLocale = (value) => {
  if (!value || typeof value !== "object") return defaultLocale;
  return {
    language: normalizeLanguage(value.language),
    direction: "ltr",
  };
};

const getStandaloneLocale = () => {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const params = new URL(window.location.href).searchParams;
    return {
      language: normalizeLanguage(
        params.get("lang") ||
          params.get("locale") ||
          window.localStorage?.getItem(languageStorageKey) ||
          document.documentElement.lang ||
          navigator.language,
      ),
      direction: "ltr",
    };
  } catch {
    return defaultLocale;
  }
};

export const getWidgetLocale = (sdk) => {
  try {
    const sdkLocale = sdk?.getLocale?.() ?? sdk?.locale;
    if (sdkLocale) return normalizeLocale(sdkLocale);
  } catch {
    return getStandaloneLocale();
  }
  return getStandaloneLocale();
};

const toI18nextResources = (resources) => ({
  "zh-CN": { translation: resources["zh-CN"] },
  "en-US": { translation: resources["en-US"] },
});

export const createWidgetI18n = (resources) => {
  const instance = createInstance();
  instance.init({
    resources: toI18nextResources(resources),
    lng: defaultLocale.language,
    fallbackLng: defaultLocale.language,
    interpolation: { escapeValue: false },
    keySeparator: false,
    nsSeparator: false,
    returnNull: false,
    initImmediate: false,
  });
  return instance;
};

export const createWidgetTranslator = (resources, language) => {
  const i18n = createWidgetI18n(resources);
  return (key, params) =>
    i18n.t(key, {
      ...(params ?? {}),
      lng: language,
      defaultValue: resources[language]?.[key] ?? resources["zh-CN"][key] ?? key,
    });
};

export const setStandaloneWidgetLanguage = (language) => {
  const locale = {
    language: normalizeLanguage(language),
    direction: "ltr",
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(languageStorageKey, locale.language);
    } catch {
      // Ignore storage failures in sandboxed standalone deployments.
    }
    window.dispatchEvent(new CustomEvent(localeEventName, { detail: locale }));
  }
  return locale;
};
