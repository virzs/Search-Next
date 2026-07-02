import { useCallback, useEffect, useMemo, useState } from "react";
import { createInstance, type i18n as I18nInstance } from "i18next";

export type WidgetLanguage = "zh-CN" | "en-US";
export type WidgetResources = Record<WidgetLanguage, Record<string, string>>;
export type WidgetTranslationParams = Record<string, unknown>;
export type WidgetTranslationFn = (
  key: string,
  params?: WidgetTranslationParams,
) => string;

export interface WidgetLocaleInfo {
  language: WidgetLanguage;
  direction: "ltr";
}

type LocaleSdk = {
  locale?: Partial<WidgetLocaleInfo>;
  getLocale?: () => Partial<WidgetLocaleInfo> | undefined;
  onLocaleChange?: (
    handler: (locale: WidgetLocaleInfo) => void,
  ) => (() => void) | void;
  events?: {
    on?: (
      event: string,
      handler: (payload: unknown) => void,
    ) => (() => void) | void;
    off?: (
      event: string,
      handler: (payload: unknown) => void,
    ) => void;
  };
};

export const WIDGET_LANGUAGE_STORAGE_KEY = "search-next-widget-language";
export const WIDGET_LOCALE_EVENT = "widget:locale-change";

const DEFAULT_LANGUAGE: WidgetLanguage = "zh-CN";
const DEFAULT_LOCALE: WidgetLocaleInfo = {
  language: DEFAULT_LANGUAGE,
  direction: "ltr",
};

export const normalizeLanguage = (value: unknown): WidgetLanguage => {
  const language = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (language === "en-us" || language.startsWith("en")) return "en-US";
  if (language === "zh-cn" || language.startsWith("zh")) return "zh-CN";
  return DEFAULT_LANGUAGE;
};

const toWidgetLocale = (language: unknown): WidgetLocaleInfo => ({
  language: normalizeLanguage(language),
  direction: "ltr",
});

const normalizeLocale = (value: unknown): WidgetLocaleInfo => {
  if (!value || typeof value !== "object") return DEFAULT_LOCALE;
  return toWidgetLocale((value as Partial<WidgetLocaleInfo>).language);
};

const readStandaloneLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const params = new URL(window.location.href).searchParams;
    return normalizeLanguage(
      params.get("lang") ||
        params.get("locale") ||
        window.localStorage?.getItem(WIDGET_LANGUAGE_STORAGE_KEY) ||
        document.documentElement.lang ||
        navigator.language,
    );
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const getStandaloneLocale = () => toWidgetLocale(readStandaloneLanguage());

const getLocale = (sdk?: LocaleSdk) => {
  try {
    const sdkLocale = sdk?.getLocale?.() ?? sdk?.locale;
    if (sdkLocale) return normalizeLocale(sdkLocale);
  } catch {
    return getStandaloneLocale();
  }
  return getStandaloneLocale();
};

const toI18nextResources = (resources: WidgetResources) => ({
  "zh-CN": { translation: resources["zh-CN"] },
  "en-US": { translation: resources["en-US"] },
});

const createWidgetI18n = (resources: WidgetResources) => {
  const instance = createInstance();
  void instance.init({
    resources: toI18nextResources(resources),
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    keySeparator: false,
    nsSeparator: false,
    returnNull: false,
    initImmediate: false,
  });
  return instance;
};

const translateWith = (
  i18n: I18nInstance,
  resources: WidgetResources,
  language: WidgetLanguage,
  key: string,
  params?: WidgetTranslationParams,
) =>
  i18n.t(key, {
    ...(params ?? {}),
    lng: language,
    defaultValue: resources[language]?.[key] ?? resources["zh-CN"][key] ?? key,
  });

export const createWidgetTranslator =
  (resources: WidgetResources, language: WidgetLanguage): WidgetTranslationFn => {
    const i18n = createWidgetI18n(resources);
    return (key, params) => translateWith(i18n, resources, language, key, params);
  };

export const setStandaloneWidgetLanguage = (language: WidgetLanguage) => {
  const locale = toWidgetLocale(language);
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(WIDGET_LANGUAGE_STORAGE_KEY, locale.language);
    } catch {
      // Ignore storage failures in sandboxed standalone deployments.
    }
    window.dispatchEvent(new CustomEvent(WIDGET_LOCALE_EVENT, { detail: locale }));
  }
  return locale;
};

export function useWidgetI18n(
  sdk: LocaleSdk | undefined,
  resources: WidgetResources,
) {
  const i18n = useMemo(() => createWidgetI18n(resources), [resources]);
  const [locale, setLocale] = useState(() => getLocale(sdk));

  useEffect(() => {
    void i18n.changeLanguage(locale.language);
  }, [i18n, locale.language]);

  useEffect(() => {
    setLocale(getLocale(sdk));
    const updateLocale = (nextLocale: unknown) =>
      setLocale(normalizeLocale(nextLocale));

    const unsubscribe = sdk?.onLocaleChange?.(updateLocale);
    if (typeof unsubscribe === "function") return unsubscribe;
    if (sdk?.onLocaleChange) return undefined;

    const eventUnsubscribe = sdk?.events?.on?.("locale:change", updateLocale);
    if (typeof eventUnsubscribe === "function") return eventUnsubscribe;
    if (sdk?.events?.on) {
      return () => sdk.events?.off?.("locale:change", updateLocale);
    }

    if (typeof window === "undefined") return undefined;
    const handleLocaleEvent = (event: Event) =>
      updateLocale((event as CustomEvent<unknown>).detail);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === WIDGET_LANGUAGE_STORAGE_KEY) {
        updateLocale(toWidgetLocale(event.newValue));
      }
    };
    window.addEventListener(WIDGET_LOCALE_EVENT, handleLocaleEvent);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(WIDGET_LOCALE_EVENT, handleLocaleEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [sdk]);

  const setLanguage = useCallback(
    (language: WidgetLanguage) => {
      const nextLocale = sdk
        ? toWidgetLocale(language)
        : setStandaloneWidgetLanguage(language);
      setLocale(nextLocale);
      void i18n.changeLanguage(nextLocale.language);
    },
    [i18n, sdk],
  );

  const t = useCallback<WidgetTranslationFn>(
    (key, params) => translateWith(i18n, resources, locale.language, key, params),
    [i18n, locale.language, resources],
  );

  return {
    language: locale.language,
    locale,
    setLanguage,
    t,
  };
}
