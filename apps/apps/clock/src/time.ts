import {
  addYears,
  differenceInCalendarDays,
  differenceInMilliseconds,
  format,
  startOfDay,
  startOfYear,
} from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { zhCN } from "date-fns/locale/zh-CN";
import { TIMEZONES, DEFAULT_WORLD_TIMEZONES } from "./constants";
import type { AppLanguage, AppTranslationFn } from "./i18n";

export function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function dateFnsLocale(language: AppLanguage) {
  return language === "en-US" ? enUS : zhCN;
}

export function greet(hour: number, t: AppTranslationFn) {
  if (hour < 6) return t("greet.late");
  if (hour < 12) return t("greet.morning");
  if (hour < 14) return t("greet.noon");
  if (hour < 18) return t("greet.afternoon");
  return t("greet.evening");
}

export function formatDate(date: Date, language: AppLanguage) {
  return format(
    date,
    language === "en-US" ? "EEEE, MMM d, yyyy" : "yyyy年M月d日 EEEE",
    { locale: dateFnsLocale(language) },
  );
}

export function formatCompactDate(date: Date, language: AppLanguage) {
  return format(
    date,
    language === "en-US" ? "MMM d, EEE" : "M月d日 EEE",
    { locale: dateFnsLocale(language) },
  );
}

export function getTimeInZone(timezone: string, source = new Date()) {
  if (!timezone) return new Date(source);
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hourCycle: "h23",
    }).formatToParts(source);
    const getPart = (type: Intl.DateTimeFormatPartTypes) => {
      const part = parts.find((item) => item.type === type);
      return part ? Number(part.value) : 0;
    };
    return new Date(
      getPart("year"),
      getPart("month") - 1,
      getPart("day"),
      getPart("hour") % 24,
      getPart("minute"),
      getPart("second"),
      source.getMilliseconds(),
    );
  } catch {
    return new Date(source);
  }
}

export function dayProgress(date: Date) {
  return (differenceInMilliseconds(date, startOfDay(date)) / 86400000) * 100;
}

export function yearProgress(date: Date) {
  const start = startOfYear(date);
  const end = addYears(start, 1);
  return (differenceInMilliseconds(date, start) / differenceInMilliseconds(end, start)) * 100;
}

export function parseBoolean(value: unknown, fallback: boolean) {
  if (value === null || value === undefined) return fallback;
  return value !== "false" && value !== false;
}

export function parseWorldTimezones(value: unknown) {
  if (typeof value !== "string") return DEFAULT_WORLD_TIMEZONES;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return DEFAULT_WORLD_TIMEZONES;
    const validValues = new Set(TIMEZONES.map((item) => item.value).filter(Boolean));
    const list = parsed.filter((item): item is string => typeof item === "string" && validValues.has(item));
    return list.length ? list.slice(0, 6) : DEFAULT_WORLD_TIMEZONES;
  } catch {
    return DEFAULT_WORLD_TIMEZONES;
  }
}

export function calendarDayDiff(date: Date, base: Date) {
  return differenceInCalendarDays(date, base);
}

export function dayOffsetLabel(diff: number, t: AppTranslationFn) {
  if (diff === 0) return t("date.today");
  if (diff === 1) return t("date.tomorrow");
  if (diff === -1) return t("date.yesterday");
  return diff > 0
    ? t("date.futureDay", { count: diff })
    : t("date.day", { count: diff });
}

export function formatClockTime(
  date: Date,
  timeFormat: "12h" | "24h",
  language: AppLanguage,
) {
  return format(date, timeFormat === "12h" ? "hh:mm a" : "HH:mm", {
    locale: dateFnsLocale(language),
  });
}

export function timezoneOffsetLabel(timezone: string, source = new Date()) {
  if (!timezone) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(source);
    const value = parts.find((item) => item.type === "timeZoneName")?.value;
    return value ? value.replace("GMT", "UTC") : "";
  } catch {
    return "";
  }
}

export function timezoneName(
  timezone: string,
  t: AppTranslationFn,
  fallback?: string,
) {
  const keyByTimezone: Record<string, string> = {
    "": "timezone.local",
    UTC: "timezone.utc",
    "Asia/Shanghai": "timezone.beijing",
    "Asia/Tokyo": "timezone.tokyo",
    "Europe/London": "timezone.london",
    "America/New_York": "timezone.newYork",
    "America/Los_Angeles": "timezone.losAngeles",
    "Australia/Sydney": "timezone.sydney",
    "Europe/Paris": "timezone.paris",
    "Asia/Dubai": "timezone.dubai",
    "Europe/Moscow": "timezone.moscow",
    "Asia/Singapore": "timezone.singapore",
  };
  const key = keyByTimezone[timezone];
  if (key) return t(key);
  return fallback ?? timezone.replace(/_/g, " ").split("/").pop() ?? timezone;
}
