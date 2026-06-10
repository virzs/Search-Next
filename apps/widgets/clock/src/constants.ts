import type { ClockSettings, TimezoneOption } from "./types";

export const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
export const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export const TIMEZONES: TimezoneOption[] = [
  { city: "本地", value: "" },
  { city: "UTC", value: "UTC" },
  { city: "北京", value: "Asia/Shanghai" },
  { city: "东京", value: "Asia/Tokyo" },
  { city: "伦敦", value: "Europe/London" },
  { city: "纽约", value: "America/New_York" },
  { city: "洛杉矶", value: "America/Los_Angeles" },
  { city: "悉尼", value: "Australia/Sydney" },
  { city: "巴黎", value: "Europe/Paris" },
  { city: "迪拜", value: "Asia/Dubai" },
  { city: "莫斯科", value: "Europe/Moscow" },
  { city: "新加坡", value: "Asia/Singapore" },
];

export const DEFAULT_WORLD_TIMEZONES = [
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
];

export const DEFAULT_SETTINGS: ClockSettings = {
  timezone: "",
  timeFormat: "24h",
  showSeconds: true,
  showProgress: true,
  worldTimezones: DEFAULT_WORLD_TIMEZONES,
};
