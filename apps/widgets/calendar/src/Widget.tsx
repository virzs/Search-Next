import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import {
  addDays,
  compareAsc,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  set as setDateParts,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { zhCN } from "date-fns/locale/zh-CN";
import { cn } from "@/lib/utils";
import { resources, useWidgetI18n } from "./i18n";
import type { WidgetLanguage, WidgetTranslationFn } from "./i18n";
import type {
  CalendarEvent,
  CalendarSettings,
  EventDensity,
  StorageChangedPayload,
  WeekStart,
  WidgetProps,
} from "./types";

const DEFAULT_SETTINGS: CalendarSettings = {
  weekStart: "sun",
  accentColor: "#0071e3",
  eventDensity: "normal",
};

const SETTINGS_STORAGE_KEYS = ["weekStart", "accentColor", "eventDensity"] as const;
const EVENTS_STORAGE_KEY = "calendarEvents";

const ACCENT_OPTIONS = [
  { labelKey: "color.blue", value: "#0071e3" },
  { labelKey: "color.green", value: "#16a34a" },
  { labelKey: "color.red", value: "#dc2626" },
  { labelKey: "color.amber", value: "#f59e0b" },
  { labelKey: "color.purple", value: "#8b5cf6" },
  { labelKey: "color.cyan", value: "#06b6d4" },
];

const DENSITY_OPTIONS: Array<{ labelKey: string; value: EventDensity; descriptionKey: string }> = [
  { labelKey: "density.compact.label", value: "compact", descriptionKey: "density.compact.desc" },
  { labelKey: "density.normal.label", value: "normal", descriptionKey: "density.normal.desc" },
  { labelKey: "density.detailed.label", value: "detailed", descriptionKey: "density.detailed.desc" },
];

type NormalizedCalendarEvent = Omit<CalendarEvent, "startsAt" | "endsAt"> & {
  id: string;
  title: string;
  startsAt: Date;
  endsAt?: Date;
  color: string;
  local: boolean;
};

type CalendarDay = {
  date: Date;
  day: number;
  currentMonth: boolean;
  today: boolean;
  selected?: boolean;
  hasEvent: boolean;
};

type AddEventInput = {
  date: Date;
  title: string;
  time: string;
  location: string;
  allDay: boolean;
};

const isWeekStart = (value: unknown): value is WeekStart => value === "sun" || value === "mon";
const isEventDensity = (value: unknown): value is EventDensity =>
  value === "compact" || value === "normal" || value === "detailed";

const parseColor = (value: unknown) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : DEFAULT_SETTINGS.accentColor;

const parseDateValue = (value: unknown) => {
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === "number") {
    const next = new Date(value);
    return isValid(next) ? next : null;
  }
  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (isValid(parsed)) return parsed;
    const fallback = new Date(value);
    return isValid(fallback) ? fallback : null;
  }
  return null;
};

const dateLocale = (language: WidgetLanguage) => language === "en-US" ? enUS : zhCN;

const monthLabel = (date: Date, language: WidgetLanguage) =>
  format(date, language === "en-US" ? "MMMM yyyy" : "yyyy年 M月", { locale: dateLocale(language) });
const shortMonthLabel = (date: Date, language: WidgetLanguage) =>
  format(date, language === "en-US" ? "MMM" : "M月", { locale: dateLocale(language) });
const weekdayLabel = (date: Date, language: WidgetLanguage) =>
  format(date, "EEE", { locale: dateLocale(language) });
const fullDateLabel = (date: Date, language: WidgetLanguage) =>
  format(date, language === "en-US" ? "EEE, MMM d" : "M月d日 EEE", { locale: dateLocale(language) });

const formatEventTime = (
  date: Date,
  allDay: boolean | undefined,
  language: WidgetLanguage,
  t: WidgetTranslationFn,
) => {
  if (allDay) return t("allDay");
  return format(date, language === "en-US" ? "h:mm a" : "HH:mm", { locale: dateLocale(language) });
};

const weekLabels = (weekStart: WeekStart, language: WidgetLanguage) => {
  const sunday = new Date(2024, 0, 7);
  const offsets = weekStart === "mon" ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];
  return offsets.map((offset) => new Intl.DateTimeFormat(language, { weekday: "short" }).format(addDays(sunday, offset)));
};

const isCalendarEventLike = (value: unknown): value is CalendarEvent => {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;
  return typeof event.title === "string" && Boolean(parseDateValue(event.startsAt));
};

const parseEventList = (value: unknown): CalendarEvent[] => {
  let source: unknown = value;
  if (typeof value === "string") {
    try {
      source = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(source) ? source.filter(isCalendarEventLike) : [];
};

const serializeEvents = (events: CalendarEvent[]) =>
  events.map((event) => ({
    id: event.id,
    title: event.title,
    startsAt: (parseDateValue(event.startsAt) || new Date()).toISOString(),
    endsAt: event.endsAt ? parseDateValue(event.endsAt)?.toISOString() : undefined,
    location: event.location,
    color: event.color,
    allDay: Boolean(event.allDay),
  }));

const normalizeEvents = (events: CalendarEvent[] | undefined, local = false): NormalizedCalendarEvent[] => {
  const normalized: NormalizedCalendarEvent[] = [];

  (Array.isArray(events) ? events : []).forEach((event, index) => {
    const startsAt = parseDateValue(event.startsAt);
    const title = event.title.trim();
    if (!startsAt || !title) return;

    const endsAt = parseDateValue(event.endsAt);
    normalized.push({
      id: event.id || `event-${startsAt.getTime()}-${index}`,
      title,
      startsAt,
      ...(endsAt ? { endsAt } : {}),
      location: event.location,
      color: event.color || DEFAULT_SETTINGS.accentColor,
      allDay: event.allDay,
      local,
    });
  });

  return normalized.sort((a, b) => compareAsc(a.startsAt, b.startsAt));
};

const weekStartsOn = (weekStart: WeekStart) => (weekStart === "mon" ? 1 : 0);

const getMonthDays = (
  viewDate: Date,
  weekStart: WeekStart,
  events: NormalizedCalendarEvent[],
  selectedDate?: Date,
) => {
  const firstVisibleDay = startOfWeek(startOfMonth(viewDate), { weekStartsOn: weekStartsOn(weekStart) });
  const lastMonthDay = endOfMonth(viewDate);

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = addDays(firstVisibleDay, index);
    return {
      date,
      day: Number(format(date, "d")),
      currentMonth: isSameMonth(date, lastMonthDay),
      today: isSameDay(date, new Date()),
      selected: selectedDate ? isSameDay(date, selectedDate) : false,
      hasEvent: events.some((event) => isSameDay(event.startsAt, date)),
    };
  });
};

const createStartsAt = ({ date, time, allDay }: Pick<AddEventInput, "date" | "time" | "allDay">) => {
  if (allDay) return startOfDay(date);
  const [hourRaw, minuteRaw] = time.split(":").map((part) => Number(part));
  const hours = Number.isFinite(hourRaw) ? hourRaw : 9;
  const minutes = Number.isFinite(minuteRaw) ? minuteRaw : 0;
  return setDateParts(date, { hours, minutes, seconds: 0, milliseconds: 0 });
};

const getThemeVars = (themeId: string, accentColor: string) =>
  ({
    "--calendar-bg": themeId === "dark" ? "#000000" : "#ffffff",
    "--calendar-card": themeId === "dark" ? "#1d1d1f" : "#f5f5f7",
    "--calendar-card-2": themeId === "dark" ? "#272729" : "#fbfbfd",
    "--calendar-fg": themeId === "dark" ? "#f5f5f7" : "#1d1d1f",
    "--calendar-fg-2": themeId === "dark" ? "#d2d2d7" : "#424245",
    "--calendar-muted": themeId === "dark" ? "#86868b" : "#6e6e73",
    "--calendar-meta": themeId === "dark" ? "#6e6e73" : "#86868b",
    "--calendar-border": themeId === "dark" ? "#424245" : "#d2d2d7",
    "--calendar-border-soft": themeId === "dark" ? "#272729" : "#e8e8ed",
    "--calendar-accent": accentColor,
    "--calendar-shadow": themeId === "dark" ? "0 16px 34px rgba(0,0,0,0.42)" : "0 12px 28px rgba(0,0,0,0.10)",
  }) as CSSProperties;

const useCalendarState = ({
  sdk,
  initialDate,
  events,
  language,
  t,
}: Pick<WidgetProps, "sdk" | "initialDate" | "events"> & {
  language: WidgetLanguage;
  t: WidgetTranslationFn;
}) => {
  const [now, setNow] = useState(() => parseDateValue(initialDate) || new Date());
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);
  const [storedEvents, setStoredEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (initialDate) return undefined;
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, [initialDate]);

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.storage) return;
    Promise.all([...SETTINGS_STORAGE_KEYS.map((key) => sdk.storage?.get(key)), sdk.storage.get(EVENTS_STORAGE_KEY)])
      .then(([weekStart, accentColor, eventDensity, calendarEvents]) => {
        setSettings({
          weekStart: isWeekStart(weekStart) ? weekStart : DEFAULT_SETTINGS.weekStart,
          accentColor: parseColor(accentColor),
          eventDensity: isEventDensity(eventDensity) ? eventDensity : DEFAULT_SETTINGS.eventDensity,
        });
        setStoredEvents(parseEventList(calendarEvents));
      })
      .catch(() => undefined);
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.events) return undefined;
    const handler = (payload: StorageChangedPayload) => {
      if (payload.widgetId && sdk.widgetId && payload.widgetId !== sdk.widgetId) return;
      if (payload.key === EVENTS_STORAGE_KEY) {
        setStoredEvents(parseEventList(payload.value));
        return;
      }
      setSettings((prev) => {
        if (payload.key === "weekStart") return { ...prev, weekStart: isWeekStart(payload.value) ? payload.value : prev.weekStart };
        if (payload.key === "accentColor") return { ...prev, accentColor: parseColor(payload.value) };
        if (payload.key === "eventDensity") return { ...prev, eventDensity: isEventDensity(payload.value) ? payload.value : prev.eventDensity };
        return prev;
      });
    };
    const unsubscribe = sdk.events.on("storage:changed", handler);
    if (typeof unsubscribe === "function") return unsubscribe;
    return () => sdk.events?.off?.("storage:changed", handler);
  }, [sdk]);

  const persistEvents = async (nextEvents: CalendarEvent[]) => {
    setStoredEvents(nextEvents);
    try {
      await sdk?.storage?.set(EVENTS_STORAGE_KEY, JSON.stringify(serializeEvents(nextEvents)));
    } catch (error) {
      sdk?.toast?.error(t("toast.saveEventFailed"), error instanceof Error ? error.message : t("toast.retry"));
    }
  };

  const saveSetting = async <K extends keyof CalendarSettings>(key: K, value: CalendarSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await sdk?.storage?.set(key, String(value));
    } catch (error) {
      sdk?.toast?.error(t("toast.saveFailed"), error instanceof Error ? error.message : t("toast.retry"));
    }
  };

  const addEvent = async (input: AddEventInput) => {
    const title = input.title.trim();
    if (!title) return false;

    const startsAt = createStartsAt(input);
    const nextEvent: CalendarEvent = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      startsAt: startsAt.toISOString(),
      location: input.location.trim() || undefined,
      color: settings.accentColor,
      allDay: input.allDay,
    };
    await persistEvents([...storedEvents, nextEvent]);
    sdk?.toast?.success(
      t("toast.added"),
      `${format(startsAt, language === "en-US" ? "MMM d h:mm a" : "M月d日 HH:mm", { locale: dateLocale(language) })} ${title}`,
    );
    return true;
  };

  const removeEvent = async (id: string) => {
    const nextEvents = storedEvents.filter((event) => event.id !== id);
    await persistEvents(nextEvents);
    sdk?.toast?.success(t("toast.deleted"));
  };

  const propEvents = useMemo(() => normalizeEvents(events, false), [events]);
  const localEvents = useMemo(() => normalizeEvents(storedEvents, true), [storedEvents]);
  const normalizedEvents = useMemo(
    () => [...localEvents, ...propEvents].sort((a, b) => compareAsc(a.startsAt, b.startsAt)),
    [localEvents, propEvents],
  );
  const todayEvents = useMemo(
    () => normalizedEvents.filter((event) => isSameDay(event.startsAt, now)),
    [normalizedEvents, now],
  );
  const upcomingEvents = useMemo(
    () => normalizedEvents.filter((event) => !isBefore(event.startsAt, startOfDay(now))).slice(0, 6),
    [normalizedEvents, now],
  );

  return {
    now,
    themeId,
    settings,
    saveSetting,
    addEvent,
    removeEvent,
    events: normalizedEvents,
    todayEvents,
    upcomingEvents,
  };
};

const Widget = ({ mode = "icon", sdk, initialDate, events }: WidgetProps) => {
  const { language, t } = useWidgetI18n(sdk, resources);
  const {
    now,
    themeId,
    settings,
    saveSetting,
    addEvent,
    removeEvent,
    events: normalizedEvents,
    todayEvents,
    upcomingEvents,
  } = useCalendarState({ sdk, initialDate, events, language, t });
  const isIcon = mode === "icon" || mode === "appIcon";
  const sizeId = sdk?.sizeId || "2x2";
  const themeVars = getThemeVars(themeId === "dark" ? "dark" : "light", settings.accentColor);
  const shellClassName = cn(
    "tw:h-full tw:w-full tw:box-border tw:text-[var(--calendar-fg)] tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,Helvetica_Neue,system-ui,sans-serif] tw:tracking-[0] tw:antialiased tw:[container-type:size] tw:[&_*]:box-border",
    isIcon ? "tw:flex tw:items-center tw:justify-center tw:overflow-hidden" : "tw:overflow-hidden tw:rounded-[18px] tw:bg-[var(--calendar-bg)]",
  );

  return (
    <div className={shellClassName} style={themeVars}>
      {mode === "settings" ? (
        <SettingsPanel settings={settings} onSave={saveSetting} t={t} />
      ) : isIcon ? (
        <IconCalendar date={now} sizeId={sizeId} settings={settings} todayEvents={todayEvents} upcomingEvents={upcomingEvents} language={language} t={t} />
      ) : (
        <FullPanel
          date={now}
          settings={settings}
          events={normalizedEvents}
          onAddEvent={addEvent}
          onRemoveEvent={removeEvent}
          language={language}
          t={t}
        />
      )}
    </div>
  );
};

const iconFrameClassName =
  "tw:relative tw:h-full tw:w-full tw:overflow-hidden tw:border tw:border-[var(--calendar-border-soft)] tw:bg-[var(--calendar-card)] tw:text-[var(--calendar-fg)] tw:shadow-[var(--calendar-shadow)]";

const IconCalendar = ({
  date,
  sizeId,
  settings,
  todayEvents,
  upcomingEvents,
  language,
  t,
}: {
  date: Date;
  sizeId: string;
  settings: CalendarSettings;
  todayEvents: NormalizedCalendarEvent[];
  upcomingEvents: NormalizedCalendarEvent[];
  language: WidgetLanguage;
  t: WidgetTranslationFn;
}) => {
  const days = getMonthDays(date, settings.weekStart, upcomingEvents);
  const nextEvent = todayEvents[0] || upcomingEvents[0];

  if (sizeId === "1x1") {
    return (
      <div className={cn(iconFrameClassName, "tw:flex tw:items-center tw:justify-center tw:rounded-[14px] tw:p-1")} aria-label={`${shortMonthLabel(date, language)} ${format(date, "d")}`}>
        <div className="tw:text-center">
          <div className="tw:text-[25px] tw:font-[760] tw:leading-none tw:tracking-[0]">{format(date, "d")}</div>
          <div className="tw:mt-1 tw:text-[9px] tw:font-[720] tw:leading-none tw:text-[var(--calendar-muted)]">{shortMonthLabel(date, language)}</div>
        </div>
      </div>
    );
  }

  if (sizeId === "2x1") {
    return (
      <div className={cn(iconFrameClassName, "tw:flex tw:items-center tw:rounded-[16px] tw:px-2.5 tw:py-2")} aria-label={`${weekdayLabel(date, language)} ${format(date, "d")}`}>
        <div className="tw:flex tw:w-[48px] tw:flex-none tw:flex-col tw:items-center tw:justify-center tw:border-r tw:border-[var(--calendar-border)] tw:pr-2">
          <div className="tw:text-[22px] tw:font-[780] tw:leading-none">{format(date, "d")}</div>
          <div className="tw:mt-0.5 tw:text-[10px] tw:font-[720] tw:text-[var(--calendar-muted)]">{weekdayLabel(date, language)}</div>
        </div>
        <div className="tw:min-w-0 tw:flex-1 tw:pl-2.5">
          <div className="tw:truncate tw:text-[11px] tw:font-[760] tw:leading-tight">{nextEvent ? nextEvent.title : t("empty.noTodayEvent")}</div>
          <div className="tw:mt-1 tw:truncate tw:text-[10px] tw:font-[620] tw:leading-tight tw:text-[var(--calendar-muted)]">
            {nextEvent ? `${formatEventTime(nextEvent.startsAt, nextEvent.allDay, language, t)} ${nextEvent.location || ""}` : monthLabel(date, language)}
          </div>
        </div>
      </div>
    );
  }

  if (sizeId === "3x2" || sizeId === "4x2") {
    const isWide = sizeId === "4x2";
    return (
      <div className={cn(iconFrameClassName, "tw:grid tw:rounded-[18px] tw:p-2.5", isWide ? "tw:grid-cols-[164px_minmax(0,1fr)] tw:gap-3" : "tw:grid-cols-[1.08fr_.92fr] tw:gap-2.5")}>
        <div className="tw:min-w-0">
          <MonthGrid date={date} days={days} weekStart={settings.weekStart} language={language} compact={!isWide} />
        </div>
        <AgendaList events={upcomingEvents} density={settings.eventDensity} limit={isWide ? 4 : 3} compact emptyText={t("empty.noEvent")} language={language} t={t} />
      </div>
    );
  }

  return (
    <div className={cn(iconFrameClassName, "tw:rounded-[18px] tw:p-2.5")}>
      <MonthGrid date={date} days={days} weekStart={settings.weekStart} language={language} compact />
    </div>
  );
};

const MonthGrid = ({ date, days, weekStart, language, compact = false }: { date: Date; days: CalendarDay[]; weekStart: WeekStart; language: WidgetLanguage; compact?: boolean }) => (
  <div className="tw:flex tw:h-full tw:min-w-0 tw:flex-col">
    <div className={cn("tw:mb-1.5 tw:text-center tw:font-[760] tw:leading-none", compact ? "tw:text-[11px]" : "tw:text-[13px]")}>{monthLabel(date, language)}</div>
    <div className={cn("tw:grid tw:grid-cols-7 tw:gap-[2px] tw:text-center tw:text-[8px] tw:font-[680] tw:text-[var(--calendar-muted)]", !compact && "tw:text-[9px]")}>
      {weekLabels(weekStart, language).map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
    <div className="tw:mt-1 tw:grid tw:flex-1 tw:grid-cols-7 tw:grid-rows-6 tw:gap-[2px]">
      {days.map((day) => (
        <span
          key={format(day.date, "yyyy-MM-dd")}
          className={cn(
            "tw:relative tw:flex tw:min-h-0 tw:items-center tw:justify-center tw:rounded-[5px] tw:text-[10px] tw:font-[650] tw:leading-none",
            !day.currentMonth && "tw:text-[var(--calendar-meta)] tw:opacity-45",
            day.today && "tw:bg-[var(--calendar-accent)] tw:text-white tw:font-[780]",
          )}
        >
          {day.day}
          {day.hasEvent && !day.today && <i className="tw:absolute tw:bottom-[2px] tw:h-[2px] tw:w-[2px] tw:rounded-full tw:bg-[var(--calendar-accent)]" />}
        </span>
      ))}
    </div>
  </div>
);

const AgendaList = ({
  events,
  density,
  limit,
  compact = false,
  emptyText,
  onDelete,
  language,
  t,
}: {
  events: NormalizedCalendarEvent[];
  density: EventDensity;
  limit: number;
  compact?: boolean;
  emptyText?: string;
  onDelete?: (id: string) => void;
  language: WidgetLanguage;
  t: WidgetTranslationFn;
}) => {
  const visibleEvents = events.slice(0, limit);

  return (
    <div className="tw:flex tw:min-w-0 tw:flex-col tw:gap-1.5">
      <div className={cn("tw:text-[10px] tw:font-[760] tw:leading-none tw:text-[var(--calendar-muted)]", !compact && "tw:text-xs")}>{t("view.agenda")}</div>
      {visibleEvents.length ? (
        <div className="tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:gap-1.5">
          {visibleEvents.map((event) => (
            <EventRow event={event} density={density} compact={compact} key={event.id} onDelete={onDelete} language={language} t={t} />
          ))}
        </div>
      ) : (
        <div className="tw:flex tw:flex-1 tw:items-center tw:justify-center tw:rounded-[10px] tw:border tw:border-dashed tw:border-[var(--calendar-border)] tw:px-2 tw:text-center tw:text-[11px] tw:font-[650] tw:leading-tight tw:text-[var(--calendar-muted)]">
          {emptyText ?? t("empty.noTodayEvent")}
        </div>
      )}
    </div>
  );
};

const EventRow = ({
  event,
  density,
  compact = false,
  onDelete,
  language,
  t,
}: {
  event: NormalizedCalendarEvent;
  density: EventDensity;
  compact?: boolean;
  onDelete?: (id: string) => void;
  language: WidgetLanguage;
  t: WidgetTranslationFn;
}) => (
  <div className={cn("tw:min-w-0 tw:rounded-[9px] tw:bg-[var(--calendar-bg)] tw:px-2 tw:py-1.5 tw:shadow-[inset_0_0_0_1px_var(--calendar-border-soft)]", compact && "tw:px-1.5 tw:py-1")}>
    <div className="tw:flex tw:min-w-0 tw:items-center tw:gap-1.5">
      <i className="tw:h-1.5 tw:w-1.5 tw:flex-none tw:rounded-full tw:bg-[var(--calendar-accent)]" />
      <time className={cn("tw:flex-none tw:text-[10px] tw:font-[760] tw:text-[var(--calendar-accent)]", compact && "tw:text-[9px]")}>{formatEventTime(event.startsAt, event.allDay, language, t)}</time>
      <span className={cn("tw:min-w-0 tw:flex-1 tw:truncate tw:text-[11px] tw:font-[720] tw:leading-tight", compact && "tw:text-[10px]")}>{event.title}</span>
      {onDelete && event.local && !compact && (
        <button
          className="tw:h-5 tw:flex-none tw:cursor-pointer tw:rounded-full tw:border-0 tw:bg-[var(--calendar-card)] tw:px-2 tw:text-[10px] tw:font-[760] tw:text-[var(--calendar-muted)]"
          onClick={() => onDelete(event.id)}
          type="button"
        >
          {t("action.delete")}
        </button>
      )}
    </div>
    {density === "detailed" && event.location && !compact && <div className="tw:mt-1 tw:truncate tw:pl-3 tw:text-[11px] tw:font-[600] tw:text-[var(--calendar-muted)]">{event.location}</div>}
  </div>
);

const FullPanel = ({
  date,
  settings,
  events,
  onAddEvent,
  onRemoveEvent,
  language,
  t,
}: {
  date: Date;
  settings: CalendarSettings;
  events: NormalizedCalendarEvent[];
  onAddEvent: (input: AddEventInput) => Promise<boolean>;
  onRemoveEvent: (id: string) => Promise<void>;
  language: WidgetLanguage;
  t: WidgetTranslationFn;
}) => {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(date));
  const [title, setTitle] = useState("");
  const [time, setTime] = useState(() => format(date, "HH:mm"));
  const [location, setLocation] = useState("");
  const [allDay, setAllDay] = useState(false);
  const days = getMonthDays(date, settings.weekStart, events, selectedDate);
  const selectedEvents = events.filter((event) => isSameDay(event.startsAt, selectedDate));

  const submitEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const saved = await onAddEvent({ date: selectedDate, title, time, location, allDay });
    if (!saved) return;
    setTitle("");
    setLocation("");
    setAllDay(false);
  };

  return (
    <div className="tw:flex tw:h-full tw:w-full tw:flex-col tw:overflow-hidden tw:bg-[var(--calendar-card)] tw:p-5 tw:[@container(max-width:680px)]:p-3 tw:[@container(max-width:500px)]:p-2.5">
      <header className="tw:flex tw:flex-none tw:items-center tw:justify-between tw:gap-4 tw:border-b tw:border-[var(--calendar-border-soft)] tw:pb-4 tw:[@container(max-width:680px)]:gap-2 tw:[@container(max-width:680px)]:pb-2">
        <div className="tw:min-w-0">
          <h1 className="tw:m-0 tw:text-[32px] tw:font-[720] tw:leading-none tw:tracking-[0] tw:[@container(max-width:680px)]:text-[26px] tw:[@container(max-width:500px)]:text-[23px]">{monthLabel(date, language)}</h1>
          <p className="tw:m-0 tw:mt-1 tw:text-sm tw:font-[650] tw:text-[var(--calendar-muted)] tw:[@container(max-width:680px)]:text-xs">{fullDateLabel(selectedDate, language)}</p>
        </div>
        <button className="tw:inline-flex tw:h-9 tw:cursor-pointer tw:items-center tw:rounded-full tw:border-0 tw:bg-[var(--calendar-accent)] tw:px-4 tw:text-sm tw:font-[760] tw:text-white tw:[@container(max-width:680px)]:h-8 tw:[@container(max-width:680px)]:px-3 tw:[@container(max-width:680px)]:text-xs" onClick={() => setSelectedDate(startOfDay(date))} type="button">
          {t("action.today")}
        </button>
      </header>
      <main className="tw:grid tw:min-h-0 tw:flex-1 tw:grid-cols-[minmax(0,1fr)_280px] tw:gap-5 tw:overflow-hidden tw:pt-5 tw:[@container(max-width:680px)]:grid-cols-[minmax(0,1fr)_190px] tw:[@container(max-width:680px)]:gap-3 tw:[@container(max-width:680px)]:pt-2 tw:[@container(max-width:500px)]:grid-cols-1 tw:[@container(max-width:500px)]:overflow-auto">
        <section className="tw:flex tw:min-h-0 tw:min-w-0 tw:flex-col tw:[@container(max-width:500px)]:min-h-[260px]">
          <div className="tw:grid tw:grid-cols-7 tw:gap-1.5 tw:[@container(max-width:680px)]:gap-1">
            {weekLabels(settings.weekStart, language).map((label) => (
              <div className="tw:py-2 tw:text-center tw:text-xs tw:font-[760] tw:text-[var(--calendar-muted)] tw:[@container(max-width:680px)]:py-1" key={label}>{label}</div>
            ))}
          </div>
          <div className="tw:mt-2 tw:grid tw:grid-cols-7 tw:gap-1.5 tw:[@container(max-width:680px)]:mt-1 tw:[@container(max-width:680px)]:min-h-0 tw:[@container(max-width:680px)]:flex-1 tw:[@container(max-width:680px)]:grid-rows-6 tw:[@container(max-width:680px)]:gap-1">
            {days.map((day) => (
              <button
                aria-pressed={day.selected}
                className={cn(
                  "tw:relative tw:flex tw:aspect-square tw:min-h-0 tw:cursor-pointer tw:items-center tw:justify-center tw:rounded-[12px] tw:border tw:border-transparent tw:bg-transparent tw:text-sm tw:font-[650] tw:text-[var(--calendar-fg)] tw:outline-none tw:transition-colors tw:duration-150 tw:hover:bg-[var(--calendar-card-2)] tw:focus-visible:border-[var(--calendar-accent)] tw:[@container(max-width:680px)]:h-full tw:[@container(max-width:680px)]:[aspect-ratio:auto] tw:[@container(max-width:680px)]:rounded-[10px] tw:[@container(max-width:680px)]:text-xs",
                  !day.currentMonth && "tw:text-[var(--calendar-meta)] tw:opacity-45",
                  day.selected && "tw:border-[var(--calendar-accent)] tw:bg-[var(--calendar-bg)]",
                  day.today && "tw:bg-[var(--calendar-accent)] tw:text-white tw:hover:bg-[var(--calendar-accent)] tw:font-[780]",
                )}
                key={format(day.date, "yyyy-MM-dd")}
                onClick={() => setSelectedDate(startOfDay(day.date))}
                type="button"
              >
                {day.day}
                {day.hasEvent && !day.today && <i className="tw:absolute tw:bottom-2 tw:left-1/2 tw:h-1 tw:w-1 tw:-translate-x-1/2 tw:rounded-full tw:bg-[var(--calendar-accent)]" />}
              </button>
            ))}
          </div>
        </section>
        <aside className="tw:flex tw:min-h-0 tw:min-w-0 tw:flex-col tw:overflow-hidden tw:border-l tw:border-[var(--calendar-border-soft)] tw:pl-5 tw:[@container(max-width:680px)]:pl-3 tw:[@container(max-width:500px)]:border-l-0 tw:[@container(max-width:500px)]:border-t tw:[@container(max-width:500px)]:pl-0 tw:[@container(max-width:500px)]:pt-3">
          <div className="tw:mb-3 tw:text-sm tw:font-[760] tw:text-[var(--calendar-muted)] tw:[@container(max-width:680px)]:mb-1.5 tw:[@container(max-width:680px)]:text-xs">{fullDateLabel(selectedDate, language)}</div>
          <div className="tw:min-h-0 tw:flex-1">
            <AgendaList
              events={selectedEvents}
              density={settings.eventDensity}
              limit={4}
              emptyText={t("empty.noDayEvent")}
              onDelete={(id) => void onRemoveEvent(id)}
              language={language}
              t={t}
            />
          </div>
          <form className="tw:mt-4 tw:flex tw:flex-none tw:flex-col tw:gap-2 tw:rounded-[14px] tw:bg-[var(--calendar-bg)] tw:p-3 tw:shadow-[inset_0_0_0_1px_var(--calendar-border-soft)] tw:[@container(max-width:680px)]:mt-2 tw:[@container(max-width:680px)]:gap-1 tw:[@container(max-width:680px)]:rounded-[12px] tw:[@container(max-width:680px)]:p-1.5" onSubmit={submitEvent}>
            <input
              className="tw:h-9 tw:min-w-0 tw:rounded-[10px] tw:border tw:border-[var(--calendar-border-soft)] tw:bg-[var(--calendar-card)] tw:px-3 tw:text-sm tw:font-[650] tw:text-[var(--calendar-fg)] tw:outline-none tw:focus:border-[var(--calendar-accent)] tw:[@container(max-width:680px)]:h-7 tw:[@container(max-width:680px)]:px-2 tw:[@container(max-width:680px)]:text-xs"
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("field.title")}
              value={title}
            />
            <div className="tw:grid tw:grid-cols-[1fr_auto] tw:gap-2">
              <input
                className="tw:h-9 tw:min-w-0 tw:rounded-[10px] tw:border tw:border-[var(--calendar-border-soft)] tw:bg-[var(--calendar-card)] tw:px-3 tw:text-sm tw:font-[650] tw:text-[var(--calendar-fg)] tw:outline-none tw:disabled:opacity-45 tw:focus:border-[var(--calendar-accent)] tw:[@container(max-width:680px)]:h-7 tw:[@container(max-width:680px)]:px-2 tw:[@container(max-width:680px)]:text-xs"
                disabled={allDay}
                onChange={(event) => setTime(event.target.value)}
                type="time"
                value={time}
              />
              <label className="tw:flex tw:h-9 tw:items-center tw:gap-1.5 tw:rounded-[10px] tw:bg-[var(--calendar-card)] tw:px-2 tw:text-xs tw:font-[720] tw:text-[var(--calendar-muted)] tw:[@container(max-width:680px)]:h-7">
                <input checked={allDay} onChange={(event) => setAllDay(event.target.checked)} type="checkbox" />
                {t("allDay")}
              </label>
            </div>
            <input
              className="tw:h-9 tw:min-w-0 tw:rounded-[10px] tw:border tw:border-[var(--calendar-border-soft)] tw:bg-[var(--calendar-card)] tw:px-3 tw:text-sm tw:font-[650] tw:text-[var(--calendar-fg)] tw:outline-none tw:focus:border-[var(--calendar-accent)] tw:[@container(max-width:680px)]:h-7 tw:[@container(max-width:680px)]:px-2 tw:[@container(max-width:680px)]:text-xs"
              onChange={(event) => setLocation(event.target.value)}
              placeholder={t("field.location")}
              value={location}
            />
            <button className="tw:h-9 tw:cursor-pointer tw:rounded-[10px] tw:border-0 tw:bg-[var(--calendar-accent)] tw:text-sm tw:font-[780] tw:text-white tw:disabled:cursor-not-allowed tw:disabled:opacity-45 tw:[@container(max-width:680px)]:h-7 tw:[@container(max-width:680px)]:text-xs" disabled={!title.trim()} type="submit">
              {t("action.add")}
            </button>
          </form>
        </aside>
      </main>
    </div>
  );
};

const SettingsPanel = ({
  settings,
  onSave,
  t,
}: {
  settings: CalendarSettings;
  onSave: <K extends keyof CalendarSettings>(key: K, value: CalendarSettings[K]) => Promise<void>;
  t: WidgetTranslationFn;
}) => (
  <div className="tw:h-full tw:w-full tw:overflow-auto tw:bg-[var(--calendar-card)] tw:p-5">
    <header className="tw:mb-5 tw:border-b tw:border-[var(--calendar-border-soft)] tw:pb-4">
      <h1 className="tw:m-0 tw:text-[30px] tw:font-[720] tw:leading-none">{t("settings.title")}</h1>
      <p className="tw:m-0 tw:mt-2 tw:text-sm tw:font-[650] tw:text-[var(--calendar-muted)]">{t("settings.subtitle")}</p>
    </header>
    <div className="tw:flex tw:flex-col tw:gap-4">
      <SettingsGroup title={t("settings.weekStart")}>
        <SegmentedControl
          value={settings.weekStart}
          options={[
            { label: t("week.sun"), value: "sun" },
            { label: t("week.mon"), value: "mon" },
          ]}
          onChange={(value) => onSave("weekStart", value)}
        />
      </SettingsGroup>

      <SettingsGroup title={t("settings.accent")}>
        <div className="tw:flex tw:flex-wrap tw:gap-3" role="group" aria-label={t("settings.accentAria")}>
          {ACCENT_OPTIONS.map((option) => (
            <button
              aria-label={t(option.labelKey)}
              className={cn(
                "tw:h-8 tw:w-8 tw:cursor-pointer tw:rounded-full tw:border-2 tw:border-transparent tw:outline-none tw:ring-offset-2 tw:ring-offset-[var(--calendar-card)] tw:transition tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--calendar-accent)]",
                option.value === settings.accentColor && "tw:border-[var(--calendar-fg)] tw:shadow-[0_0_0_2px_var(--calendar-card),0_0_0_4px_var(--calendar-fg)]",
              )}
              key={option.value}
              onClick={() => onSave("accentColor", option.value)}
              style={{ backgroundColor: option.value }}
              type="button"
            />
          ))}
        </div>
      </SettingsGroup>

      <SettingsGroup title={t("settings.density")}>
        <div className="tw:flex tw:flex-col">
          {DENSITY_OPTIONS.map((option) => (
            <button
              className="tw:flex tw:cursor-pointer tw:items-center tw:justify-between tw:gap-4 tw:border-0 tw:border-b tw:border-solid tw:border-[var(--calendar-border-soft)] tw:bg-transparent tw:px-0 tw:py-3 tw:text-left tw:last:border-b-0"
              key={option.value}
              onClick={() => onSave("eventDensity", option.value)}
              type="button"
            >
              <span className="tw:min-w-0">
                <span className="tw:block tw:text-[16px] tw:font-[720] tw:text-[var(--calendar-fg)]">{t(option.labelKey)}</span>
                <span className="tw:mt-0.5 tw:block tw:text-xs tw:font-[600] tw:text-[var(--calendar-muted)]">{t(option.descriptionKey)}</span>
              </span>
              <span className={cn("tw:h-5 tw:w-5 tw:flex-none tw:rounded-full tw:border-2 tw:border-[var(--calendar-border)]", settings.eventDensity === option.value && "tw:border-[var(--calendar-accent)] tw:bg-[var(--calendar-accent)] tw:shadow-[inset_0_0_0_4px_var(--calendar-bg)]")} />
            </button>
          ))}
        </div>
      </SettingsGroup>
    </div>
  </div>
);

const SettingsGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="tw:rounded-[18px] tw:border tw:border-[var(--calendar-border-soft)] tw:bg-[var(--calendar-bg)] tw:p-4">
    <h2 className="tw:m-0 tw:mb-3 tw:text-[17px] tw:font-[760] tw:leading-tight">{title}</h2>
    {children}
  </section>
);

const SegmentedControl = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) => (
  <div className="tw:grid tw:grid-cols-2 tw:gap-1 tw:rounded-[13px] tw:bg-[var(--calendar-card)] tw:p-1" role="group">
    {options.map((option) => (
      <button
        className={cn(
          "tw:cursor-pointer tw:rounded-[10px] tw:border-0 tw:bg-transparent tw:px-3 tw:py-2 tw:text-sm tw:font-[760] tw:text-[var(--calendar-muted)] tw:transition-colors",
          value === option.value && "tw:bg-[var(--calendar-bg)] tw:text-[var(--calendar-fg)] tw:shadow-[0_1px_3px_rgba(0,0,0,0.12)]",
        )}
        key={option.value}
        onClick={() => onChange(option.value)}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default Widget;
