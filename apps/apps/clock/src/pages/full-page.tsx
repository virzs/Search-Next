import { useEffect, useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { addHours, differenceInMilliseconds, startOfHour } from "date-fns";
import { TIMEZONES } from "../constants";
import { AnalogClock, MiniCalendar, ProgressRows, TimeText, WeekStrip, WorldTimes } from "../components/ClockPrimitives";
import { cn } from "../styles";
import { dayProgress, formatDate, getTimeInZone, greet, pad, timezoneName, yearProgress } from "../time";
import { useWeekDays, useWorldTimes } from "../hooks";
import type { ClockSettings, ClockView } from "../types";
import type { AppLanguage, AppTranslationFn } from "../i18n";

const frameClassName = "tw:grid tw:h-full tw:w-full tw:grid-cols-[190px_minmax(0,1fr)] tw:overflow-hidden tw:rounded-[inherit] tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-app)] tw:text-[var(--clock-fg)] tw:[@container(max-width:720px)]:grid-cols-1 tw:[@container(max-width:720px)]:grid-rows-[minmax(0,1fr)_auto]";
const bodyClassName = "tw:min-h-0 tw:min-w-0 tw:overflow-auto tw:p-7 tw:[@container(max-width:960px)]:p-5 tw:[@container(max-width:720px)]:p-4 tw:[@container(max-width:520px)]:p-3.5";
const panelClassName = "clock-material tw:min-w-0 tw:rounded-[22px] tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card)] tw:p-[18px] tw:shadow-[var(--clock-shadow-soft)]";
const tabBarClassName = "clock-material tw:flex tw:min-w-0 tw:flex-col tw:border-r tw:border-[var(--clock-divider)] tw:bg-[var(--clock-sidebar)] tw:p-3 tw:[@container(max-width:720px)]:row-start-2 tw:[@container(max-width:720px)]:flex-row tw:[@container(max-width:720px)]:border-r-0 tw:[@container(max-width:720px)]:border-t tw:[@container(max-width:720px)]:px-3 tw:[@container(max-width:720px)]:pb-3 tw:[@container(max-width:720px)]:pt-2";
const tabButtonClassName = (active = false) => cn(
  "tw:flex tw:cursor-pointer tw:items-center tw:gap-2.5 tw:rounded-xl tw:border-0 tw:bg-transparent tw:px-3 tw:py-2.5 tw:text-left tw:text-[13px] tw:font-[650] tw:text-[var(--clock-fg-2)] tw:transition-[transform,background-color,color] tw:duration-150 tw:ease-out tw:active:scale-[0.97] tw:[@container(max-width:720px)]:flex-1 tw:[@container(max-width:720px)]:flex-col tw:[@container(max-width:720px)]:gap-1 tw:[@container(max-width:720px)]:px-1 tw:[@container(max-width:720px)]:py-1.5 tw:[@container(max-width:720px)]:text-center tw:[@container(max-width:720px)]:text-[10px]",
  active && "tw:bg-[var(--clock-accent)] tw:text-[var(--clock-active-fg)] tw:shadow-[0_6px_18px_color-mix(in_srgb,var(--clock-accent)_28%,transparent)]",
);

const formatDuration = (ms: number, includeCentiseconds = false) => {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((safe % 1000) / 10);
  const base = hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
  return includeCentiseconds ? `${base}.${pad(centiseconds)}` : base;
};

export function FullPage({ now, settings, title, language, t }: { now: Date; settings: ClockSettings; title: string; language: AppLanguage; t: AppTranslationFn }) {
  const [activeView, setActiveView] = useState<ClockView>(settings.defaultView);

  useEffect(() => {
    setActiveView(settings.defaultView);
  }, [settings.defaultView]);

  return (
    <div className={frameClassName}>
      <nav className={tabBarClassName} aria-label={t("tool.aria")}>
        <div className="tw:mb-5 tw:flex tw:items-center tw:gap-2.5 tw:px-2 tw:pt-2 tw:[@container(max-width:720px)]:hidden">
          <span className="tw:grid tw:h-9 tw:w-9 tw:place-items-center tw:rounded-[11px] tw:bg-[var(--clock-time)] tw:text-lg tw:text-white tw:shadow-[0_8px_20px_rgba(255,159,10,0.28)]" aria-hidden="true">◷</span>
          <div className="tw:min-w-0"><strong className="tw:block tw:truncate tw:text-[15px] tw:font-[680]">{title}</strong><span className="tw:block tw:text-[10px] tw:font-[620] tw:text-[var(--clock-fg-3)]">{formatDate(now, language)}</span></div>
        </div>
        <div className="tw:flex tw:flex-col tw:gap-1 tw:[@container(max-width:720px)]:w-full tw:[@container(max-width:720px)]:flex-row tw:[@container(max-width:720px)]:gap-2">
          <button className={tabButtonClassName(activeView === "world")} type="button" aria-current={activeView === "world" ? "page" : undefined} onClick={() => setActiveView("world")}><TabIcon view="world" />{t("tab.world")}</button>
          <button className={tabButtonClassName(activeView === "stopwatch")} type="button" aria-current={activeView === "stopwatch" ? "page" : undefined} onClick={() => setActiveView("stopwatch")}><TabIcon view="stopwatch" />{t("tab.stopwatch")}</button>
          <button className={tabButtonClassName(activeView === "timer")} type="button" aria-current={activeView === "timer" ? "page" : undefined} onClick={() => setActiveView("timer")}><TabIcon view="timer" />{t("tab.timer")}</button>
        </div>
        <div className="tw:mt-auto tw:px-2 tw:pb-2 tw:[@container(max-width:720px)]:hidden">
          <span className="tw:block tw:text-[10px] tw:font-[650] tw:uppercase tw:tracking-[0.08em] tw:text-[var(--clock-fg-3)]">{t("timezone.local")}</span>
          <strong className="tw:mt-1 tw:block tw:text-[24px] tw:font-[560] tw:tracking-[-0.035em] tw:[font-variant-numeric:tabular-nums]">{pad(now.getHours())}:{pad(now.getMinutes())}</strong>
        </div>
      </nav>
      <main className={bodyClassName}>
        {activeView === "world" && <WorldClockView now={now} settings={settings} title={title} language={language} t={t} />}
        {activeView === "stopwatch" && <StopwatchView t={t} />}
        {activeView === "timer" && <TimerView presetMinutes={settings.timerPresetMinutes} t={t} />}
      </main>
    </div>
  );
}

function TabIcon({ view }: { view: ClockView }) {
  if (view === "world") return <svg className="tw:h-[18px] tw:w-[18px] tw:flex-none" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  if (view === "stopwatch") return <svg className="tw:h-[18px] tw:w-[18px] tw:flex-none" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.8" /><path d="M9.5 3h5M12 5.5V3M17.5 7.4l1.4-1.4M12 13V8.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  return <svg className="tw:h-[18px] tw:w-[18px] tw:flex-none" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.5V12l3.1 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function WorldClockView({ now, settings, title, language, t }: { now: Date; settings: ClockSettings; title: string; language: AppLanguage; t: AppTranslationFn }) {
  const displayNow = getTimeInZone(settings.timezone, now);
  const h24 = displayNow.getHours();
  const h = settings.timeFormat === "12h" ? pad(((h24 + 11) % 12) + 1) : pad(h24);
  const m = pad(displayNow.getMinutes());
  const s = pad(displayNow.getSeconds());
  const dayPct = dayProgress(displayNow);
  const yearPct = yearProgress(displayNow);
  const timezoneLabel = timezoneName(settings.timezone, t, TIMEZONES.find((item) => item.value === settings.timezone)?.city);
  const weekDays = useWeekDays(displayNow, language);
  const worldTimes = useWorldTimes(now, settings, language, t);
  const nextHour = startOfHour(addHours(displayNow, 1));
  const minutesToNextHour = Math.max(0, Math.ceil(differenceInMilliseconds(nextHour, displayNow) / 60000));

  return (
    <>
      <header className="tw:mb-5 tw:flex tw:items-end tw:justify-between tw:gap-4 tw:[@container(max-width:600px)]:items-start">
        <div className="tw:min-w-0"><span className="tw:block tw:truncate tw:text-[12px] tw:font-[650] tw:text-[var(--clock-time)]">{title} · {formatDate(displayNow, language)}</span><h1 className="tw:m-0 tw:mt-1 tw:text-[36px] tw:font-[720] tw:leading-[1.08] tw:tracking-[-0.035em] tw:text-[var(--clock-fg)] tw:[@container(max-width:600px)]:text-[30px]">{t("tab.world")}</h1></div>
        <span className="tw:flex-none tw:rounded-full tw:bg-[var(--clock-card-soft)] tw:px-3 tw:py-1.5 tw:text-[11px] tw:font-[650] tw:text-[var(--clock-fg-2)]">{timezoneLabel}</span>
      </header>
      <section className={cn(panelClassName, "tw:grid tw:grid-cols-[210px_minmax(0,1fr)] tw:items-center tw:gap-5 tw:p-7 tw:[@container(max-width:900px)]:grid-cols-[166px_minmax(0,1fr)] tw:[@container(max-width:900px)]:gap-4 tw:[@container(max-width:600px)]:grid-cols-1 tw:[@container(max-width:600px)]:gap-5 tw:[@container(max-width:600px)]:justify-items-center tw:[@container(max-width:600px)]:p-5")}>
        <AnalogClock now={displayNow} showSeconds={settings.showSeconds} showProgress={settings.showProgress} label={`${h}:${m}`} className="tw:w-[204px] tw:[@container(max-width:900px)]:w-[160px] tw:[@container(max-width:600px)]:w-[154px]" showNumbers />
        <div className="tw:min-w-0 tw:w-full">
          <div className="tw:flex tw:items-center tw:justify-between tw:gap-4 tw:text-[13px] tw:font-[620] tw:text-[var(--clock-fg-2)]"><span>{greet(displayNow.getHours(), t)}</span><span>{t("metric.nextHour")} · {t("unit.minute", { count: minutesToNextHour })}</span></div>
          <TimeText h={h} m={m} s={s} showSeconds={settings.showSeconds} className="tw:mt-3 tw:text-[clamp(3.5rem,8cqw,6.5rem)] tw:[@container(max-width:600px)]:justify-center tw:[@container(max-width:600px)]:text-[58px]" />
          <div className="tw:mt-6 tw:grid tw:grid-cols-3 tw:gap-2.5 tw:[@container(max-width:480px)]:grid-cols-1">
            <Metric label={t("metric.day")} value={`${dayPct.toFixed(1)}%`} />
            <Metric label={t("metric.year")} value={`${yearPct.toFixed(1)}%`} />
            <Metric label={t("metric.week")} value={weekDays.find((day) => day.active)?.label ?? "—"} />
          </div>
        </div>
      </section>
      <section className="tw:mt-4 tw:grid tw:grid-cols-[minmax(0,1.5fr)_minmax(230px,0.7fr)] tw:gap-4 tw:[@container(max-width:820px)]:grid-cols-1">
        <div className={panelClassName}><div className="tw:mb-1 tw:flex tw:items-center tw:justify-between tw:gap-3"><h2 className="tw:m-0 tw:text-[18px] tw:font-[680] tw:tracking-[-0.015em] tw:text-[var(--clock-fg)]">{t("section.cities")}</h2><span className="tw:text-[11px] tw:font-[620] tw:text-[var(--clock-fg-3)]">{worldTimes.length}</span></div><WorldTimes items={worldTimes} dayPct={dayPct} showProgress={false} wide /></div>
        <div className="tw:grid tw:min-w-0 tw:gap-4">
          <div className={panelClassName}><h2 className="tw:m-0 tw:mb-3 tw:text-[17px] tw:font-[680] tw:text-[var(--clock-fg)]">{t("metric.week")}</h2><WeekStrip days={weekDays} /></div>
          {settings.showProgress && <div className={panelClassName}><h2 className="tw:m-0 tw:mb-3 tw:text-[17px] tw:font-[680] tw:text-[var(--clock-fg)]">{t("section.progress")}</h2><ProgressRows dayPct={dayPct} yearPct={yearPct} t={t} /></div>}
        </div>
        <div className="tw:hidden"><MiniCalendar now={displayNow} language={language} /></div>
      </section>
    </>
  );
}

function StopwatchView({ t }: { t: AppTranslationFn }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    if (!running || startedAt === null) return undefined;
    const timer = setInterval(() => setElapsed(Date.now() - startedAt), 50);
    return () => clearInterval(timer);
  }, [running, startedAt]);

  const start = () => {
    setStartedAt(Date.now() - elapsed);
    setRunning(true);
  };
  const pause = () => {
    setRunning(false);
    setStartedAt(null);
  };
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setStartedAt(null);
    setLaps([]);
  };
  const lap = () => elapsed > 0 && setLaps((items) => [elapsed, ...items].slice(0, 8));

  return (
    <ToolShell accent={running ? t("watch.running") : elapsed > 0 ? t("watch.paused") : t("watch.ready")} title={t("tab.stopwatch")} subtitle={t("action.lap")}>
      <div className="tw:grid tw:grid-cols-[minmax(0,1fr)_300px] tw:gap-4 tw:[@container(max-width:840px)]:grid-cols-1">
        <div className={cn(panelClassName, "tw:flex tw:min-h-[380px] tw:flex-col tw:items-center tw:justify-center tw:gap-10 tw:py-12 tw:[@container(max-width:560px)]:min-h-[300px] tw:[@container(max-width:560px)]:gap-8")}>
          <div className="tw:text-[clamp(3.2rem,8cqw,6rem)] tw:font-[520] tw:leading-none tw:tracking-[-0.045em] tw:text-[var(--clock-fg)] tw:[font-variant-numeric:tabular-nums]">{formatDuration(elapsed, true)}</div>
          <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-4">
            <ActionButton muted type="button" onClick={lap}>{t("action.lap")}</ActionButton>
            <ActionButton type="button" onClick={running ? pause : start}>{running ? t("action.pause") : t("action.start")}</ActionButton>
            <ActionButton muted type="button" onClick={reset}>{t("action.reset")}</ActionButton>
          </div>
        </div>
        <div className={cn(panelClassName, "tw:min-h-[380px]")}>
          <div className="tw:mb-2 tw:flex tw:items-center tw:justify-between"><h2 className="tw:m-0 tw:text-[17px] tw:font-[680]">{t("action.lap")}</h2><span className="tw:text-[11px] tw:font-[620] tw:text-[var(--clock-fg-3)]">{laps.length}</span></div>
          <div className="tw:flex tw:flex-col">
            {(laps.length ? laps : [0]).map((lapMs, index) => (
              <div className="tw:flex tw:items-center tw:justify-between tw:border-b tw:border-[var(--clock-divider)] tw:px-1 tw:py-3 tw:text-sm tw:font-[620] tw:last:border-b-0" key={`${lapMs}-${index}`}>
                <span className="tw:text-[var(--clock-fg-2)]">{laps.length ? t("watch.lapName", { count: laps.length - index }) : t("watch.emptyLap")}</span>
                <strong className="tw:font-[620] tw:[font-variant-numeric:tabular-nums]">{laps.length ? formatDuration(lapMs, true) : "--:--.--"}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}

function TimerView({ presetMinutes, t }: { presetMinutes: number; t: AppTranslationFn }) {
  const [duration, setDuration] = useState(presetMinutes * 60_000);
  const [remaining, setRemaining] = useState(presetMinutes * 60_000);
  const [running, setRunning] = useState(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const complete = remaining <= 0;
  const progress = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;

  useEffect(() => {
    const next = presetMinutes * 60_000;
    setDuration(next);
    setRemaining(next);
    setRunning(false);
    setEndsAt(null);
  }, [presetMinutes]);

  useEffect(() => {
    if (!running || endsAt === null) return undefined;
    const timer = setInterval(() => {
      const next = Math.max(0, endsAt - Date.now());
      setRemaining(next);
      if (next <= 0) {
        setRunning(false);
        setEndsAt(null);
      }
    }, 250);
    return () => clearInterval(timer);
  }, [endsAt, running]);

  const applyPreset = (minutes: number) => {
    const next = minutes * 60_000;
    setDuration(next);
    setRemaining(next);
    setRunning(false);
    setEndsAt(null);
  };
  const start = () => {
    setEndsAt(Date.now() + remaining);
    setRunning(true);
  };
  const pause = () => {
    setRunning(false);
    setEndsAt(null);
  };
  const reset = () => applyPreset(Math.max(1, Math.round(duration / 60_000)));

  return (
    <ToolShell accent={complete ? t("timer.doneSubtitle") : running ? t("timer.running") : t("timer.ready")} title={t("tab.timer")} subtitle={t("timer.presets")}>
      <div className="tw:grid tw:grid-cols-[minmax(0,1fr)_300px] tw:gap-4 tw:[@container(max-width:840px)]:grid-cols-1">
        <div className={cn(panelClassName, "tw:flex tw:min-h-[430px] tw:flex-col tw:items-center tw:justify-center tw:gap-8 tw:py-10")}>
          <div className="tw:grid tw:aspect-square tw:w-[270px] tw:place-items-center tw:rounded-full tw:p-[7px] tw:shadow-[0_18px_42px_rgba(0,0,0,0.12)] tw:transition-[background] tw:duration-200 tw:[background:conic-gradient(var(--clock-time)_var(--timer-angle),var(--clock-card-soft)_0)] tw:[@container(max-width:520px)]:w-[230px]" style={{ "--timer-angle": `${(1 - progress) * 360}deg` } as CSSProperties}>
            <div className="tw:grid tw:h-full tw:w-full tw:place-items-center tw:rounded-full tw:bg-[var(--clock-material-strong)] tw:text-center">
              <div><div className="tw:text-[44px] tw:font-[560] tw:leading-none tw:tracking-[-0.04em] tw:[font-variant-numeric:tabular-nums]">{complete ? t("timer.done") : formatDuration(remaining)}</div><div className="tw:mt-2 tw:text-xs tw:font-[620] tw:text-[var(--clock-fg-2)]">{t("timer.minutes", { count: Math.round(duration / 60000) })}</div></div>
            </div>
          </div>
          <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-3">
            <ActionButton type="button" onClick={running ? pause : start} disabled={complete}>{running ? t("action.pause") : t("action.start")}</ActionButton>
            <ActionButton muted type="button" onClick={reset}>{t("action.reset")}</ActionButton>
          </div>
        </div>
        <div className={cn(panelClassName, "tw:flex tw:flex-col tw:gap-1")}>
          <h2 className="tw:m-0 tw:mb-2 tw:text-[17px] tw:font-[680]">{t("timer.presets")}</h2>
          {[5, 15, 25, 45].map((minutes) => (
            <button className={cn("tw:flex tw:cursor-pointer tw:items-center tw:justify-between tw:rounded-xl tw:border-0 tw:bg-transparent tw:px-3 tw:py-3 tw:text-left tw:text-sm tw:font-[650] tw:text-[var(--clock-fg)] tw:transition-[transform,background-color,color] tw:duration-150 tw:active:scale-[0.98]", Math.round(duration / 60000) === minutes && "tw:bg-[var(--clock-card-soft)] tw:text-[var(--clock-time)]")} key={minutes} type="button" onClick={() => applyPreset(minutes)}><span>{t("timer.minutes", { count: minutes })}</span><span className="tw:text-lg" aria-hidden="true">›</span></button>
          ))}
          {complete && <div className="tw:rounded-[16px] tw:bg-[rgba(255,159,10,0.18)] tw:p-3 tw:text-sm tw:font-[720] tw:text-[var(--clock-accent)]">{t("timer.doneNote")}</div>}
        </div>
      </div>
    </ToolShell>
  );
}

function ToolShell({ accent, title, subtitle, children }: { accent: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <div>
      <header className="tw:mb-5">
        <span className="tw:text-[12px] tw:font-[650] tw:text-[var(--clock-time)]">{accent}</span>
        <h1 className="tw:m-0 tw:mt-1 tw:text-[36px] tw:font-[720] tw:leading-[1.08] tw:tracking-[-0.035em] tw:text-[var(--clock-fg)] tw:[@container(max-width:700px)]:text-[30px]">{title}</h1>
        <p className="tw:m-0 tw:mt-1.5 tw:text-[13px] tw:font-[580] tw:text-[var(--clock-fg-2)]">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="tw:min-w-0 tw:rounded-[14px] tw:bg-[var(--clock-card-soft)] tw:p-3"><span className="tw:block tw:text-[10px] tw:font-[650] tw:text-[var(--clock-fg-3)]">{label}</span><strong className="tw:mt-[5px] tw:block tw:truncate tw:text-[17px] tw:font-[650] tw:text-[var(--clock-fg)] tw:[font-variant-numeric:tabular-nums]">{value}</strong></div>;
}

function ActionButton({ muted, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { muted?: boolean }) {
  return <button {...props} className={cn("tw:h-[68px] tw:w-[68px] tw:cursor-pointer tw:rounded-full tw:border tw:border-transparent tw:px-2 tw:text-[12px] tw:font-[680] tw:transition-[transform,box-shadow,background-color] tw:duration-150 tw:ease-out tw:active:scale-[0.94] tw:disabled:cursor-not-allowed tw:disabled:opacity-45", muted ? "tw:border-[var(--clock-border)] tw:bg-[var(--clock-card-soft)] tw:text-[var(--clock-fg)]" : "tw:bg-[var(--clock-accent)] tw:text-[var(--clock-active-fg)] tw:shadow-[0_8px_24px_color-mix(in_srgb,var(--clock-accent)_26%,transparent)]", props.className)} />;
}
