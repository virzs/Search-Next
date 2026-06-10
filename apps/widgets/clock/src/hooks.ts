import { useMemo } from "react";
import { addDays, isSameDay, startOfWeek } from "date-fns";
import { TIMEZONES, WEEK_LABELS } from "./constants";
import { calendarDayDiff, dayOffsetLabel, formatClockTime, getTimeInZone, timezoneOffsetLabel } from "./time";
import type { ClockSettings } from "./types";

export function useWeekDays(now: Date) {
  return useMemo(() => {
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(monday, index);
      return {
        key: day.toDateString(),
        label: WEEK_LABELS[day.getDay()],
        date: day.getDate(),
        active: isSameDay(day, now),
      };
    });
  }, [now]);
}

export function useWorldTimes(now: Date, settings: ClockSettings) {
  return useMemo(
    () => settings.worldTimezones.map((timezone) => {
      const item = TIMEZONES.find((candidate) => candidate.value === timezone);
      const baseDate = getTimeInZone(settings.timezone, now);
      const zonedDate = getTimeInZone(timezone, now);
      const dayDiff = calendarDayDiff(zonedDate, baseDate);
      return {
        city: item?.city ?? timezone.split("/").pop() ?? timezone,
        time: formatClockTime(zonedDate, settings.timeFormat),
        dayLabel: dayOffsetLabel(dayDiff),
        offsetLabel: timezoneOffsetLabel(timezone, now),
      };
    }),
    [settings.timeFormat, settings.timezone, settings.worldTimezones, now],
  );
}
