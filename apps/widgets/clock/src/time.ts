import {
  addYears,
  differenceInCalendarDays,
  differenceInMilliseconds,
  format,
  startOfDay,
  startOfYear,
} from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { TIMEZONES, DEFAULT_WORLD_TIMEZONES } from "./constants";

export function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function greet(hour: number) {
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export function formatDate(date: Date) {
  return format(date, "yyyy年M月d日 EEEE", { locale: zhCN });
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

export function dayOffsetLabel(diff: number) {
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  if (diff === -1) return "昨天";
  return diff > 0 ? `+${diff}天` : `${diff}天`;
}

export function formatClockTime(date: Date, timeFormat: "12h" | "24h") {
  return format(date, timeFormat === "12h" ? "hh:mm a" : "HH:mm");
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
