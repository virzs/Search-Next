import { AnalogClock, ProgressRows, TimeText, WorldTimes } from "../components/ClockPrimitives";
import { cn } from "../styles";
import { dayProgress, formatCompactDate, getTimeInZone, greet, pad, yearProgress } from "../time";
import { useWorldTimes } from "../hooks";
import type { ClockSettings } from "../types";
import type { AppLanguage, AppTranslationFn } from "../i18n";

type IconSizeClasses = {
  card: string;
  content: string;
  main: string;
  copy: string;
  analog: string;
  greeting: string;
  time: string;
  date: string;
  compactMarks?: boolean;
  hideMinorTicks?: boolean;
  largeSecondHand?: boolean;
  largePin?: boolean;
  compactProgress?: boolean;
  compactWorld?: boolean;
};

const ICON_SIZE_CLASSES: Record<string, IconSizeClasses> = {
  "2x1": {
    card: "tw:rounded-2xl",
    content: "tw:flex tw:items-center tw:px-3 tw:py-2",
    main: "clock-compact-main tw:w-full tw:justify-start",
    copy: "clock-widget-copy clock-widget-copy--compact tw:flex-1",
    analog: "tw:w-[44px]",
    greeting: "tw:text-[9px]",
    time: "clock-time-compact tw:text-[24px]",
    date: "tw:max-w-[95px] tw:text-[9px]",
    compactMarks: true,
    largeSecondHand: true,
    largePin: true,
  },
  "2x2": {
    card: "tw:rounded-[20px]",
    content: "tw:flex tw:flex-col tw:justify-center tw:gap-3 tw:p-3",
    main: "clock-standard-main tw:w-full tw:items-center tw:justify-start",
    copy: "clock-widget-copy clock-widget-copy--standard tw:flex-1",
    analog: "tw:w-[56px]",
    greeting: "tw:text-[9px]",
    time: "clock-time-compact tw:text-[25px]",
    date: "tw:max-w-[82px] tw:text-[9px]",
    compactMarks: true,
    compactProgress: true,
  },
  "4x2": {
    card: "tw:rounded-[20px]",
    content: "tw:grid tw:grid-cols-[126px_minmax(0,1fr)] tw:items-stretch tw:gap-3 tw:p-3.5",
    main: "clock-wide-main tw:flex-col tw:items-center tw:justify-center tw:border-r tw:border-[var(--clock-divider)] tw:pr-3",
    copy: "clock-widget-copy clock-widget-copy--wide tw:w-full",
    analog: "tw:w-[66px]",
    greeting: "tw:text-[9px]",
    time: "clock-time-compact tw:justify-center tw:text-[26px]",
    date: "tw:max-w-full tw:text-[9px]",
    compactMarks: true,
    compactWorld: true,
  },
};

export function IconPage({ now, settings, sizeId, language, t }: { now: Date; settings: ClockSettings; sizeId: string; language: AppLanguage; t: AppTranslationFn }) {
  const displayNow = getTimeInZone(settings.timezone, now);
  const h24 = displayNow.getHours();
  const h = settings.timeFormat === "12h" ? pad(((h24 + 11) % 12) + 1) : pad(h24);
  const m = pad(displayNow.getMinutes());
  const s = pad(displayNow.getSeconds());
  const dayPct = dayProgress(displayNow);
  const yearPct = yearProgress(displayNow);
  const worldTimes = useWorldTimes(now, settings, language, t);
  const compactDate = formatCompactDate(displayNow, language);
  const dateText = compactDate;
  const showAnalogSeconds = settings.showSeconds;
  const sizeClasses = ICON_SIZE_CLASSES[sizeId] ?? ICON_SIZE_CLASSES["2x2"];

  return (
    <div className={cn("clock-material tw:relative tw:h-full tw:w-full tw:overflow-hidden tw:border tw:border-[var(--clock-border)] tw:[background:var(--clock-card-bg)] tw:shadow-[var(--clock-shadow)]", sizeClasses.card)} aria-label={`${h}:${m}:${s}`}>
      <div className="tw:pointer-events-none tw:absolute tw:inset-0 tw:rounded-[inherit] tw:[background:var(--clock-card-highlight)]" aria-hidden="true" />
      <div className={cn("tw:relative tw:z-[1] tw:h-full tw:w-full tw:min-w-0 tw:gap-[9px]", sizeClasses.content)}>
        <div className={cn("tw:flex tw:min-w-0 tw:items-center tw:gap-3", sizeClasses.main)}>
          <AnalogClock
            now={displayNow}
            showSeconds={showAnalogSeconds}
            showProgress={settings.showProgress}
            label={`${h}:${m}`}
            className={sizeClasses.analog}
            compactMarks={sizeClasses.compactMarks}
            hideMinorTicks={sizeClasses.hideMinorTicks}
            largeSecondHand={sizeClasses.largeSecondHand}
            largePin={sizeClasses.largePin}
          />
          <div className={cn("tw:min-w-0", sizeClasses.copy)}>
            <div className={cn("clock-widget-greeting tw:truncate tw:text-xs tw:font-[650] tw:text-[var(--clock-time)]", sizeClasses.greeting)}>{greet(displayNow.getHours(), t)}</div>
            <TimeText h={h} m={m} s={s} showSeconds={false} className={sizeClasses.time} />
            <div className={cn("clock-widget-date tw:min-w-0 tw:truncate tw:text-xs tw:font-[650] tw:text-[var(--clock-fg-2)]", sizeClasses.date)}>{dateText}</div>
          </div>
        </div>
        {settings.showProgress && sizeId === "2x2" && <ProgressRows dayPct={dayPct} yearPct={yearPct} t={t} compact={sizeClasses.compactProgress} className="clock-progress-inline" />}
        {sizeId === "4x2" && <WorldTimes items={worldTimes.slice(0, 4)} dayPct={dayPct} showProgress={settings.showProgress} compact={sizeClasses.compactWorld} />}
      </div>
    </div>
  );
}
