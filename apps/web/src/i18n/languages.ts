export const APP_LANGUAGES = [
  {
    code: "zh-CN",
    nativeName: "简体中文",
    englishName: "Simplified Chinese",
  },
  {
    code: "en-US",
    nativeName: "English",
    englishName: "English",
  },
] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number]["code"];

export const DEFAULT_APP_LANGUAGE: AppLanguage = "zh-CN";

export interface WidgetLocaleInfo {
  language: AppLanguage;
  direction: "ltr";
}

const appLanguageSet = new Set<string>(APP_LANGUAGES.map((item) => item.code));

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  typeof value === "string" && appLanguageSet.has(value);

export const normalizeAppLanguage = (value: unknown): AppLanguage => {
  if (isAppLanguage(value)) return value;
  return DEFAULT_APP_LANGUAGE;
};

export const getWidgetLocaleInfo = (
  language: AppLanguage,
): WidgetLocaleInfo => ({
  language,
  direction: "ltr",
});
