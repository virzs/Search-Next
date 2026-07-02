import type {
  LocalizedStringList,
  LocalizedText,
  WidgetApiItem,
  WidgetConfig,
} from "@/types";
import {
  DEFAULT_APP_LANGUAGE,
  normalizeAppLanguage,
  type AppLanguage,
} from "./languages";

const CJK_RE = /[\u3400-\u9fff]/;
const PACKAGE_NAME_RE = /^[a-z][a-z0-9_-]*$/i;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const firstText = (...values: unknown[]) =>
  values.find(isNonEmptyString)?.trim();

const isLocalizedRecord = (value: unknown): value is LocalizedText =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

export const resolveLocalizedText = (
  value: unknown,
  language: AppLanguage,
  fallback?: unknown,
): string | undefined => {
  if (isNonEmptyString(value)) return value.trim();
  if (isLocalizedRecord(value)) {
    const normalizedLanguage = normalizeAppLanguage(language);
    return firstText(
      value[normalizedLanguage],
      value[DEFAULT_APP_LANGUAGE],
      value["en-US"],
      fallback,
    );
  }
  return firstText(fallback);
};

export const resolveLocalizedStringList = (
  value: unknown,
  language: AppLanguage,
  fallback?: unknown,
): string[] => {
  if (Array.isArray(value)) return value.filter(isNonEmptyString);
  if (value && typeof value === "object") {
    const record = value as LocalizedStringList;
    const normalizedLanguage = normalizeAppLanguage(language);
    const list =
      record[normalizedLanguage] ??
      record[DEFAULT_APP_LANGUAGE] ??
      record["en-US"];
    if (Array.isArray(list)) return list.filter(isNonEmptyString);
  }
  return Array.isArray(fallback) ? fallback.filter(isNonEmptyString) : [];
};

const toDisplayCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const packageNameToTitle = (value: unknown) => {
  if (!isNonEmptyString(value)) return undefined;
  const normalized = value.trim();
  if (!PACKAGE_NAME_RE.test(normalized) || CJK_RE.test(normalized)) {
    return undefined;
  }
  return toDisplayCase(normalized);
};

const englishText = (...values: unknown[]) => {
  for (const value of values) {
    if (isNonEmptyString(value) && !CJK_RE.test(value)) {
      return value.trim();
    }
  }
  return undefined;
};

export const resolveWidgetDisplayName = (
  widget: WidgetApiItem,
  language: AppLanguage,
  fallback?: WidgetConfig,
): string => {
  const snapshot = widget.configSnapshot;
  const localizedName = resolveLocalizedText(
    snapshot?.displayNameI18n ??
      widget.displayNameI18n ??
      fallback?.displayNameI18n,
    language,
  );
  if (localizedName) return localizedName;

  if (language === "en-US") {
    return (
      englishText(
        snapshot?.displayName,
        widget.displayName,
        widget.name,
        fallback?.displayName,
        fallback?.name,
      ) ??
      packageNameToTitle(snapshot?.name) ??
      packageNameToTitle(widget.packageName) ??
      firstText(
        snapshot?.displayName,
        widget.displayName,
        widget.name,
        fallback?.name,
      ) ??
      "Widget"
    );
  }

  return (
    firstText(
      snapshot?.displayName,
      widget.displayName,
      widget.name,
      fallback?.displayName,
      fallback?.name,
    ) ??
    packageNameToTitle(snapshot?.name) ??
    packageNameToTitle(widget.packageName) ??
    "小组件"
  );
};

export const resolveWidgetDescription = (
  widget: WidgetApiItem,
  language: AppLanguage,
  fallback?: WidgetConfig,
): string | undefined => {
  const snapshot = widget.configSnapshot;
  return resolveLocalizedText(
    snapshot?.descriptionI18n ??
      widget.descriptionI18n ??
      fallback?.descriptionI18n,
    language,
    firstText(snapshot?.description, widget.description, fallback?.description),
  );
};

export const resolveWidgetTags = (
  widget: WidgetApiItem,
  language: AppLanguage,
  fallback?: WidgetConfig,
): string[] => {
  const snapshot = widget.configSnapshot;
  const localizedTags = resolveLocalizedStringList(
    snapshot?.tagsI18n ?? widget.tagsI18n ?? fallback?.tagsI18n,
    language,
  );
  if (localizedTags.length) return localizedTags;
  return resolveLocalizedStringList(
    snapshot?.tags ?? widget.tags,
    language,
    fallback?.tags,
  );
};
