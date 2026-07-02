import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { APP_LANGUAGE_STORAGE_KEY } from "@/utils/storage";
import {
  DEFAULT_APP_LANGUAGE,
  normalizeAppLanguage,
  type AppLanguage,
} from "./languages";
import { resources } from "./resources";

const readStoredLanguage = (): AppLanguage => {
  if (typeof window === "undefined") return DEFAULT_APP_LANGUAGE;
  return normalizeAppLanguage(localStorage.getItem(APP_LANGUAGE_STORAGE_KEY));
};

void i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_APP_LANGUAGE,
  defaultNS: "translation",
  ns: ["translation"],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  initImmediate: false,
});

i18n.on("languageChanged", (language) => {
  if (typeof window === "undefined") return;
  const nextLanguage = normalizeAppLanguage(language);
  localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, nextLanguage);
  document.documentElement.lang = nextLanguage;
});

if (typeof document !== "undefined") {
  document.documentElement.lang = normalizeAppLanguage(i18n.language);
}

export default i18n;
