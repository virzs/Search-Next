import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TOptions } from "i18next";
import type { RouteTextResolver } from "@/pages/index/components/default-apps/route-config";
import i18n from "./instance";
import {
  APP_LANGUAGES,
  getAppLocaleInfo,
  normalizeAppLanguage,
  type AppLanguage,
} from "./languages";

export {
  APP_LANGUAGES,
  DEFAULT_APP_LANGUAGE,
  getAppLocaleInfo,
  isAppLanguage,
  normalizeAppLanguage,
  type AppLanguage,
  type AppLocaleInfo,
} from "./languages";
export { default as i18n } from "./instance";
export {
  resolveLocalizedStringList,
  resolveLocalizedText,
  resolveAppDescription,
  resolveAppDisplayName,
  resolveAppTags,
} from "./app-metadata";

type TranslationParams = TOptions & Record<string, unknown>;

export const useI18n = () => {
  const { t: translate, i18n: i18nInstance } = useTranslation();
  const language = normalizeAppLanguage(
    i18nInstance.resolvedLanguage ?? i18nInstance.language,
  );

  const t = useCallback(
    (key: string, params?: TranslationParams) =>
      translate(key, {
        defaultValue: key,
        ...(params ?? {}),
      }),
    [translate],
  );

  const setLanguage = useCallback(
    async (nextLanguage: AppLanguage) => {
      const normalizedLanguage = normalizeAppLanguage(nextLanguage);
      if (normalizedLanguage === language) return;
      await i18nInstance.changeLanguage(normalizedLanguage);
    },
    [i18nInstance, language],
  );

  const routeTextResolver = useCallback<RouteTextResolver>(
    (text, context) => {
      if (context.field === "keyword") return text;
      return t(`routes.${context.route.key}.${context.field}`, {
        defaultValue: text,
      });
    },
    [t],
  );

  const locale = useMemo(() => getAppLocaleInfo(language), [language]);

  return {
    language,
    setLanguage,
    languages: APP_LANGUAGES,
    locale,
    t,
    routeTextResolver,
  };
};

export const getCurrentAppLanguage = () =>
  normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);

export const getCurrentAppLocale = () =>
  getAppLocaleInfo(getCurrentAppLanguage());
