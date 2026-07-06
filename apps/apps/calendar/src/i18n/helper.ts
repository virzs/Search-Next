import { useCallback, useEffect, useMemo, useState } from "react";
import { createInstance, type i18n as I18nInstance } from "i18next";

export type AppLanguage = "zh-CN" | "en-US";
export type AppResources = Record<AppLanguage, Record<string, string>>;
export type AppTranslationParams = Record<string, unknown>;
export type AppTranslationFn = (
  key: string,
  params?: AppTranslationParams,
) => string;

export interface AppLocaleInfo {
  language: AppLanguage;
  direction: "ltr";
}

type LocaleSdk = {
  locale?: Partial<AppLocaleInfo>;
  getLocale?: () => Partial<AppLocaleInfo> | undefined;
  onLocaleChange?: (
    handler: (locale: AppLocaleInfo) => void,
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

export const APP_LANGUAGE_STORAGE_KEY = "search-next-app-language";
export const APP_LOCALE_EVENT = "app:locale-change";

const DEFAULT_LANGUAGE: AppLanguage = "zh-CN";
const DEFAULT_LOCALE: AppLocaleInfo = {
  language: DEFAULT_LANGUAGE,
  direction: "ltr",
};

export const normalizeLanguage = (value: unknown): AppLanguage => {
  const language = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (language === "en-us" || language.startsWith("en")) return "en-US";
  if (language === "zh-cn" || language.startsWith("zh")) return "zh-CN";
  return DEFAULT_LANGUAGE;
};

const toAppLocale = (language: unknown): AppLocaleInfo => ({
  language: normalizeLanguage(language),
  direction: "ltr",
});

const normalizeLocale = (value: unknown): AppLocaleInfo => {
  if (!value || typeof value !== "object") return DEFAULT_LOCALE;
  return toAppLocale((value as Partial<AppLocaleInfo>).language);
};

const readStandaloneLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const params = new URL(window.location.href).searchParams;
    return normalizeLanguage(
      params.get("lang") ||
        params.get("locale") ||
        window.localStorage?.getItem(APP_LANGUAGE_STORAGE_KEY) ||
        document.documentElement.lang ||
        navigator.language,
    );
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const getStandaloneLocale = () => toAppLocale(readStandaloneLanguage());

const getLocale = (sdk?: LocaleSdk) => {
  try {
    const sdkLocale = sdk?.getLocale?.() ?? sdk?.locale;
    if (sdkLocale) return normalizeLocale(sdkLocale);
  } catch {
    return getStandaloneLocale();
  }
  return getStandaloneLocale();
};

const toI18nextResources = (resources: AppResources) => ({
  "zh-CN": { translation: resources["zh-CN"] },
  "en-US": { translation: resources["en-US"] },
});

const createAppI18n = (resources: AppResources) => {
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
  resources: AppResources,
  language: AppLanguage,
  key: string,
  params?: AppTranslationParams,
) =>
  i18n.t(key, {
    ...(params ?? {}),
    lng: language,
    defaultValue: resources[language]?.[key] ?? resources["zh-CN"][key] ?? key,
  });

export const createAppTranslator =
  (resources: AppResources, language: AppLanguage): AppTranslationFn => {
    const i18n = createAppI18n(resources);
    return (key, params) => translateWith(i18n, resources, language, key, params);
  };

export const setStandaloneAppLanguage = (language: AppLanguage) => {
  const locale = toAppLocale(language);
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(APP_LANGUAGE_STORAGE_KEY, locale.language);
    } catch {
      // Ignore storage failures in sandboxed standalone deployments.
    }
    window.dispatchEvent(new CustomEvent(APP_LOCALE_EVENT, { detail: locale }));
  }
  return locale;
};

export function useAppI18n(
  sdk: LocaleSdk | undefined,
  resources: AppResources,
) {
  const i18n = useMemo(() => createAppI18n(resources), [resources]);
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
      if (event.key === APP_LANGUAGE_STORAGE_KEY) {
        updateLocale(toAppLocale(event.newValue));
      }
    };
    window.addEventListener(APP_LOCALE_EVENT, handleLocaleEvent);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(APP_LOCALE_EVENT, handleLocaleEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [sdk]);

  const setLanguage = useCallback(
    (language: AppLanguage) => {
      const nextLocale = sdk
        ? toAppLocale(language)
        : setStandaloneAppLanguage(language);
      setLocale(nextLocale);
      void i18n.changeLanguage(nextLocale.language);
    },
    [i18n, sdk],
  );

  const t = useCallback<AppTranslationFn>(
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
