import { useMemo } from "react";
import { addDays, isSameDay, startOfWeek } from "date-fns";
import { TIMEZONES } from "./constants";
import { calendarDayDiff, dayOffsetLabel, formatClockTime, getTimeInZone, timezoneName, timezoneOffsetLabel } from "./time";
import type { ClockSettings } from "./types";
import type { AppLanguage, AppTranslationFn } from "./i18n";

export function useWeekDays(now: Date, language: AppLanguage) {
  return useMemo(() => {
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(monday, index);
      return {
        key: day.toDateString(),
        label: new Intl.DateTimeFormat(language, { weekday: "short" }).format(day),
        date: day.getDate(),
        active: isSameDay(day, now),
      };
    });
  }, [language, now]);
}

export function useWorldTimes(
  now: Date,
  settings: ClockSettings,
  language: AppLanguage,
  t: AppTranslationFn,
) {
  return useMemo(
    () => settings.worldTimezones.map((timezone) => {
      const item = TIMEZONES.find((candidate) => candidate.value === timezone);
      const baseDate = getTimeInZone(settings.timezone, now);
      const zonedDate = getTimeInZone(timezone, now);
      const dayDiff = calendarDayDiff(zonedDate, baseDate);
      return {
        city: timezoneName(timezone, t, item?.city),
        time: formatClockTime(zonedDate, settings.timeFormat, language),
        dayLabel: dayOffsetLabel(dayDiff, t),
        offsetLabel: timezoneOffsetLabel(timezone, now),
      };
    }),
    [language, settings.timeFormat, settings.timezone, settings.worldTimezones, now, t],
  );
}
