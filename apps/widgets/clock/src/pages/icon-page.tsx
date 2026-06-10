import { WEEK_LABELS } from "../constants";
import { AnalogClock, ProgressRows, TimeText, WeekStrip, WorldTimes } from "../components/ClockPrimitives";
import { cn } from "../styles";
import { dayProgress, formatDate, getTimeInZone, greet, pad, yearProgress } from "../time";
import { useWeekDays, useWorldTimes } from "../hooks";
import type { ClockSettings } from "../types";

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
  showNumbers?: boolean;
  compactProgress?: boolean;
  compactWorld?: boolean;
};

const ICON_SIZE_CLASSES: Record<string, IconSizeClasses> = {
  "1x1": {
    card: "tw:rounded-[15px]",
    content: "tw:flex tw:flex-col tw:items-center tw:justify-center tw:p-[7px]",
    main: "tw:h-full tw:w-full tw:justify-center",
    copy: "tw:hidden",
    analog: "tw:w-full tw:max-w-[50px]",
    greeting: "",
    time: "",
    date: "",
    compactMarks: true,
    hideMinorTicks: true,
    largeSecondHand: true,
    largePin: true,
  },
  "2x1": {
    card: "tw:rounded-2xl",
    content: "tw:flex tw:flex-col tw:justify-center tw:px-2.5 tw:py-2",
    main: "tw:gap-[9px]",
    copy: "",
    analog: "tw:w-[48px]",
    greeting: "tw:text-[10px]",
    time: "tw:text-[27px]",
    date: "tw:max-w-[92px] tw:text-[10px]",
    compactMarks: true,
    largeSecondHand: true,
    largePin: true,
  },
  "2x2": {
    card: "tw:rounded-[20px]",
    content: "tw:flex tw:flex-col tw:p-3",
    main: "tw:items-start tw:justify-between tw:gap-2",
    copy: "",
    analog: "tw:w-[62px]",
    greeting: "tw:text-[11px]",
    time: "tw:mt-[3px] tw:text-[28px]",
    date: "tw:max-w-20 tw:text-[10px]",
    compactMarks: true,
    compactProgress: true,
  },
  "3x2": {
    card: "tw:rounded-[20px]",
    content: "tw:flex tw:flex-col tw:p-3",
    main: "tw:justify-between tw:gap-3",
    copy: "",
    analog: "tw:w-[70px]",
    greeting: "",
    time: "tw:mt-[5px] tw:text-[38px]",
    date: "tw:text-xs",
    showNumbers: true,
  },
  "4x2": {
    card: "tw:rounded-[20px]",
    content: "tw:grid tw:grid-cols-[124px_minmax(0,1fr)] tw:items-stretch tw:gap-[11px] tw:p-3",
    main: "tw:flex-col tw:items-start tw:justify-center tw:gap-2",
    copy: "",
    analog: "tw:w-[62px]",
    greeting: "",
    time: "tw:text-[30px]",
    date: "tw:max-w-[118px] tw:text-[10px]",
    compactMarks: true,
    compactWorld: true,
  },
};

export function IconPage({ now, settings, sizeId }: { now: Date; settings: ClockSettings; sizeId: string }) {
  const displayNow = getTimeInZone(settings.timezone, now);
  const h24 = displayNow.getHours();
  const h = settings.timeFormat === "12h" ? pad(((h24 + 11) % 12) + 1) : pad(h24);
  const m = pad(displayNow.getMinutes());
  const s = pad(displayNow.getSeconds());
  const dayPct = dayProgress(displayNow);
  const yearPct = yearProgress(displayNow);
  const weekDays = useWeekDays(displayNow);
  const worldTimes = useWorldTimes(now, settings);
  const compactDate = `${displayNow.getMonth() + 1}月${displayNow.getDate()}日 周${WEEK_LABELS[displayNow.getDay()]}`;
  const dateText = sizeId === "1x1" || sizeId === "2x1" || sizeId === "2x2" ? compactDate : formatDate(displayNow);
  const showTextSeconds = settings.showSeconds && (sizeId === "3x2" || sizeId === "4x2");
  const showAnalogSeconds = settings.showSeconds;
  const sizeClasses = ICON_SIZE_CLASSES[sizeId] ?? ICON_SIZE_CLASSES["2x2"];

  return (
    <div className={cn("tw:relative tw:h-full tw:w-full tw:overflow-hidden tw:border tw:border-[var(--clock-border)] tw:[background:var(--clock-card-bg)] tw:shadow-[var(--clock-shadow)]", sizeClasses.card)} aria-label={`${h}:${m}:${s}`}>
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
            showNumbers={sizeClasses.showNumbers}
          />
          <div className={cn("tw:min-w-0", sizeClasses.copy)}>
            <div className={cn("tw:truncate tw:text-xs tw:font-[750] tw:leading-[1.2] tw:text-[var(--clock-accent)]", sizeClasses.greeting)}>{greet(displayNow.getHours())}</div>
            <TimeText h={h} m={m} s={s} showSeconds={showTextSeconds} className={sizeClasses.time} />
            <div className={cn("tw:min-w-0 tw:truncate tw:text-xs tw:font-[650] tw:leading-tight tw:text-[var(--clock-fg-2)]", sizeClasses.date)}>{dateText}</div>
          </div>
        </div>
        {settings.showProgress && sizeId === "2x2" && <ProgressRows dayPct={dayPct} yearPct={yearPct} compact={sizeClasses.compactProgress} />}
        {sizeId === "3x2" && <WeekStrip days={weekDays} responsiveCompact />}
        {sizeId === "4x2" && <WorldTimes items={worldTimes} dayPct={dayPct} showProgress={settings.showProgress} compact={sizeClasses.compactWorld} />}
      </div>
    </div>
  );
}
