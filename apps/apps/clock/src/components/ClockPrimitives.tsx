import { cn } from "../styles";
import { dayProgress } from "../time";
import type { AppLanguage, AppTranslationFn } from "../i18n";

const CLOCK_CENTER = 50;
const toPoint = (angle: number, radius: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CLOCK_CENTER + Math.cos(radians) * radius,
    y: CLOCK_CENTER + Math.sin(radians) * radius,
  };
};

const TICK_MARKS = Array.from({ length: 60 }, (_, index) => {
  const major = index % 5 === 0;
  const angle = index * 6;
  const outer = toPoint(angle, 42);
  const inner = toPoint(angle, major ? 35 : 38.5);
  return { index, major, inner, outer };
});

export const TimeText = ({ h, m, s, showSeconds, className }: { h: string; m: string; s: string; showSeconds: boolean; className?: string }) => (
  <div
    className={cn(
      "tw:flex tw:items-baseline tw:whitespace-nowrap tw:text-[var(--clock-fg)] tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Display,Helvetica_Neue,system-ui,sans-serif] tw:font-[760] tw:leading-none tw:tracking-[0] tw:[font-variant-numeric:tabular-nums]",
      className,
    )}
  >
    <span>{h}</span><span className="tw:animate-pulse">:</span><span>{m}</span>{showSeconds && <span className="tw:ml-[0.25em] tw:text-[0.42em] tw:font-[650] tw:text-[var(--clock-fg-2)]">{s}</span>}
  </div>
);

export const AnalogClock = ({
  now,
  showSeconds,
  showProgress,
  label,
  className,
  compactMarks,
  hideMinorTicks,
  largeSecondHand,
  largePin,
  showNumbers,
}: {
  now: Date;
  showSeconds?: boolean;
  showProgress?: boolean;
  label?: string;
  className?: string;
  compactMarks?: boolean;
  hideMinorTicks?: boolean;
  largeSecondHand?: boolean;
  largePin?: boolean;
  showNumbers?: boolean;
}) => {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  const hourEnd = toPoint(hours * 30, 21);
  const minuteEnd = toPoint(minutes * 6, 30);
  const secondEnd = toPoint(seconds * 6, 35);
  const secondTail = toPoint(seconds * 6 + 180, 8);
  const progress = Math.max(0, Math.min(100, dayProgress(now)));

  return (
    <div className={cn("tw:relative tw:aspect-square tw:flex-none tw:rounded-full", className)} aria-label={label}>
      <svg className="tw:block tw:h-full tw:w-full tw:overflow-visible" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="tw:fill-[var(--clock-track)]" cx={CLOCK_CENTER} cy={CLOCK_CENTER} r="47" />
        {showProgress && (
          <circle
            className="tw:origin-center tw:-rotate-90 tw:fill-none tw:stroke-[var(--clock-accent)] tw:[stroke-linecap:round] tw:[stroke-width:4] tw:[transform-origin:50px_50px]"
            cx={CLOCK_CENTER}
            cy={CLOCK_CENTER}
            r="45"
            pathLength="100"
            strokeDasharray={`${progress} 100`}
          />
        )}
        <circle className="tw:fill-[var(--clock-face)] tw:stroke-[var(--clock-border)] tw:[stroke-width:1]" cx={CLOCK_CENTER} cy={CLOCK_CENTER} r="40" />
        <g>
          {TICK_MARKS.map((tick) => (
            <line
              className={cn(
                "tw:[stroke-linecap:round]",
                tick.major
                  ? cn("tw:stroke-[var(--clock-tick-major)]", compactMarks ? "tw:[stroke-width:2.1]" : "tw:[stroke-width:1.8]")
                  : cn("tw:stroke-[var(--clock-tick)] tw:[stroke-width:1.15]", hideMinorTicks && "tw:hidden"),
              )}
              key={tick.index}
              x1={tick.inner.x}
              y1={tick.inner.y}
              x2={tick.outer.x}
              y2={tick.outer.y}
            />
          ))}
        </g>
        <text className={cn("tw:fill-[var(--clock-fg-2)] tw:text-[9px] tw:font-[750] tw:[dominant-baseline:middle] tw:[font-variant-numeric:tabular-nums] tw:[text-anchor:middle]", !showNumbers && "tw:hidden")} x="50" y="21">12</text>
        <text className={cn("tw:fill-[var(--clock-fg-2)] tw:text-[9px] tw:font-[750] tw:[dominant-baseline:middle] tw:[font-variant-numeric:tabular-nums] tw:[text-anchor:middle]", !showNumbers && "tw:hidden")} x="78" y="53">3</text>
        <text className={cn("tw:fill-[var(--clock-fg-2)] tw:text-[9px] tw:font-[750] tw:[dominant-baseline:middle] tw:[font-variant-numeric:tabular-nums] tw:[text-anchor:middle]", !showNumbers && "tw:hidden")} x="50" y="82">6</text>
        <text className={cn("tw:fill-[var(--clock-fg-2)] tw:text-[9px] tw:font-[750] tw:[dominant-baseline:middle] tw:[font-variant-numeric:tabular-nums] tw:[text-anchor:middle]", !showNumbers && "tw:hidden")} x="22" y="53">9</text>
        <line className={cn("tw:stroke-[var(--clock-fg)] tw:[stroke-linecap:round]", compactMarks ? "tw:[stroke-width:5.6]" : "tw:[stroke-width:5]")} x1={CLOCK_CENTER} y1={CLOCK_CENTER} x2={hourEnd.x} y2={hourEnd.y} />
        <line className={cn("tw:stroke-[var(--clock-fg)] tw:[stroke-linecap:round]", compactMarks ? "tw:[stroke-width:4]" : "tw:[stroke-width:3.5]")} x1={CLOCK_CENTER} y1={CLOCK_CENTER} x2={minuteEnd.x} y2={minuteEnd.y} />
        {showSeconds && (
          <line className={cn("tw:stroke-[var(--clock-red)] tw:[stroke-linecap:round]", largeSecondHand ? "tw:[stroke-width:2.2]" : "tw:[stroke-width:1.7]")} x1={secondTail.x} y1={secondTail.y} x2={secondEnd.x} y2={secondEnd.y} />
        )}
        <circle className="tw:fill-[var(--clock-face)] tw:stroke-[var(--clock-red)] tw:[stroke-width:2.2]" cx={CLOCK_CENTER} cy={CLOCK_CENTER} r={largePin ? 4 : 3.4} />
      </svg>
    </div>
  );
};

export const ProgressRows = ({ dayPct, yearPct, t, compact, className }: { dayPct: number; yearPct: number; t: AppTranslationFn; compact?: boolean; className?: string }) => (
  <div className={cn("tw:mt-auto tw:flex tw:min-w-0 tw:flex-col tw:gap-[7px]", compact && "tw:gap-2", className)}>
    <ProgressRow label={t("metric.day")} value={dayPct} compact={compact} />
    <ProgressRow label={t("metric.year")} value={yearPct} compact={compact} />
  </div>
);

const ProgressRow = ({ label, value, compact }: { label: string; value: number; compact?: boolean }) => (
  <div className="tw:min-w-0">
    <div className="tw:flex tw:items-center tw:justify-between tw:gap-2.5"><span className={cn("tw:text-[10px] tw:font-[760] tw:text-[var(--clock-fg-3)]", compact && "tw:text-[9px]")}>{label}</span><strong className={cn("tw:text-xs tw:font-[760] tw:text-[var(--clock-fg)] tw:[font-variant-numeric:tabular-nums]", compact && "tw:text-[11px]")}>{value.toFixed(1)}%</strong></div>
    <div className="tw:mt-[5px] tw:h-[5px] tw:overflow-hidden tw:rounded-full tw:bg-[var(--clock-track)]"><i className="tw:block tw:h-full tw:rounded-[inherit] tw:bg-[linear-gradient(90deg,var(--clock-accent),var(--clock-cyan))] tw:transition-[width] tw:duration-[800ms] tw:ease-out" style={{ width: `${value}%` }} /></div>
  </div>
);

export const WeekStrip = ({ days, responsiveCompact }: { days: Array<{ key: string; label: string; date: number; active: boolean }>; responsiveCompact?: boolean }) => (
  <div className={cn("tw:mt-auto tw:grid tw:grid-cols-7 tw:gap-[5px]", responsiveCompact && "tw:[@container(max-width:220px)]:gap-[3px]")}>
    {days.map((day) => (
      <div
        className={cn(
          "tw:flex tw:min-w-0 tw:flex-col tw:items-center tw:gap-[3px] tw:rounded-[10px] tw:bg-[var(--clock-elevated)] tw:py-[7px]",
          responsiveCompact && "tw:[@container(max-width:220px)]:py-[5px]",
          day.active && "tw:bg-[var(--clock-accent)]",
        )}
        key={day.key}
      >
        <span className={cn("tw:text-[10px] tw:font-[760] tw:text-[var(--clock-fg-3)]", day.active && "tw:text-[var(--clock-active-fg)]")}>{day.label}</span>
        <strong className={cn("tw:text-[13px] tw:font-[760] tw:text-[var(--clock-fg-2)] tw:[font-variant-numeric:tabular-nums]", day.active && "tw:text-[var(--clock-active-fg)]")}>{day.date}</strong>
      </div>
    ))}
  </div>
);

export const WorldTimes = ({ items, dayPct, showProgress, compact, wide }: { items: Array<{ city: string; time: string; dayLabel?: string; offsetLabel?: string }>; dayPct: number; showProgress: boolean; compact?: boolean; wide?: boolean }) => (
  <div className={cn("tw:mt-auto tw:min-w-0", compact && "tw:mt-0 tw:self-center")}>
    <div className={cn("tw:grid tw:grid-cols-3 tw:gap-[7px]", wide && "tw:grid-cols-[repeat(auto-fit,minmax(138px,1fr))]")}>
      {items.map((item) => (
        <div className={cn("tw:flex tw:min-w-0 tw:flex-col tw:gap-[3px] tw:overflow-hidden tw:rounded-xl tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-elevated)] tw:p-2", compact && "tw:min-h-[58px] tw:p-[7px]")} key={item.city}>
          <div className="tw:flex tw:min-w-0 tw:items-center tw:justify-between tw:gap-1.5"><span className={cn("tw:truncate tw:text-[10px] tw:font-[720] tw:text-[var(--clock-fg-3)]", compact && "tw:text-[9px]")}>{item.city}</span><small className={cn("tw:truncate tw:text-[10px] tw:font-[720] tw:text-[var(--clock-fg-3)]", compact && "tw:text-[9px]")}>{item.dayLabel}</small></div>
          <strong className={cn("tw:truncate tw:text-base tw:font-[760] tw:text-[var(--clock-fg)] tw:[font-variant-numeric:tabular-nums]", compact && "tw:text-[13px]")}>{item.time}</strong>
          {item.offsetLabel && <em className={cn("tw:truncate tw:text-[10px] tw:not-italic tw:font-[720] tw:text-[var(--clock-fg-3)]", compact && "tw:text-[9px]")}>{item.offsetLabel}</em>}
        </div>
      ))}
    </div>
    {showProgress && <div className="tw:mt-2.5 tw:h-[5px] tw:overflow-hidden tw:rounded-full tw:bg-[var(--clock-track)]"><span className="tw:block tw:h-full tw:rounded-[inherit] tw:bg-[linear-gradient(90deg,var(--clock-accent),var(--clock-cyan))] tw:transition-[width] tw:duration-[800ms] tw:ease-out" style={{ width: `${dayPct}%` }} /></div>}
  </div>
);

export const MiniCalendar = ({ now, language }: { now: Date; language: AppLanguage }) => (
  <div className="tw:mt-auto tw:overflow-hidden tw:rounded-[18px] tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-calendar-bg)] tw:text-center tw:shadow-[0_14px_28px_rgba(0,0,0,0.28)]">
    <div className="tw:bg-[var(--clock-red)] tw:py-[7px] tw:text-[13px] tw:font-[780] tw:text-white">{new Intl.DateTimeFormat(language, { month: "short" }).format(now)}</div>
    <div className="tw:pt-3 tw:text-[56px] tw:font-[780] tw:leading-none tw:text-[var(--clock-calendar-fg)] tw:[@container(max-width:860px)]:text-[46px]">{now.getDate()}</div>
    <div className="tw:pb-[13px] tw:pt-1 tw:text-[13px] tw:font-bold tw:text-[#6e6e73]">{new Intl.DateTimeFormat(language, { weekday: "long" }).format(now)}</div>
  </div>
);
