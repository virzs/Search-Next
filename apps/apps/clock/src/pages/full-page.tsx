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

const frameClassName = "tw:flex tw:h-full tw:w-full tw:flex-col tw:overflow-hidden tw:rounded-[inherit] tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-app)] tw:text-[var(--clock-fg)]";
const bodyClassName = "tw:min-h-0 tw:flex-1 tw:overflow-auto tw:p-6 tw:[@container(max-width:860px)]:p-[18px] tw:[@container(max-width:700px)]:p-4 tw:max-[520px]:p-[18px]";
const panelClassName = "tw:min-w-0 tw:rounded-3xl tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card)] tw:p-4 tw:shadow-[0_18px_36px_rgba(0,0,0,0.26)]";
const tabBarClassName = "tw:grid tw:grid-cols-3 tw:gap-2 tw:border-t tw:border-[var(--clock-divider)] tw:bg-[var(--clock-sidebar)] tw:px-4 tw:pb-3.5 tw:pt-2.5";
const tabButtonClassName = (active = false) => cn(
  "tw:cursor-pointer tw:rounded-2xl tw:border-0 tw:bg-transparent tw:px-2 tw:py-2.5 tw:text-[12px] tw:font-[780] tw:text-[var(--clock-fg-2)] tw:transition-colors",
  active && "tw:bg-[var(--clock-card-soft)] tw:text-[var(--clock-accent)]",
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
      <main className={bodyClassName}>
        {activeView === "world" && <WorldClockView now={now} settings={settings} title={title} language={language} t={t} />}
        {activeView === "stopwatch" && <StopwatchView t={t} />}
        {activeView === "timer" && <TimerView presetMinutes={settings.timerPresetMinutes} t={t} />}
      </main>
      <nav className={tabBarClassName} aria-label={t("tool.aria")}>
        <button className={tabButtonClassName(activeView === "world")} type="button" onClick={() => setActiveView("world")}>{t("tab.world")}</button>
        <button className={tabButtonClassName(activeView === "stopwatch")} type="button" onClick={() => setActiveView("stopwatch")}>{t("tab.stopwatch")}</button>
        <button className={tabButtonClassName(activeView === "timer")} type="button" onClick={() => setActiveView("timer")}>{t("tab.timer")}</button>
      </nav>
    </div>
  );
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
      <div className="tw:mb-[18px] tw:flex tw:items-end tw:justify-between tw:gap-[18px] tw:[@container(max-width:700px)]:flex-col tw:[@container(max-width:700px)]:items-start tw:[@container(max-width:700px)]:gap-1.5 tw:max-[520px]:flex-col tw:max-[520px]:items-start">
        <div><span className="tw:text-[13px] tw:font-[760] tw:text-[var(--clock-accent)]">{title}</span><h1 className="tw:m-0 tw:mt-1 tw:text-[34px] tw:font-[780] tw:leading-[1.08] tw:tracking-[0] tw:text-[var(--clock-fg)] tw:[@container(max-width:700px)]:text-[28px]">{t("tab.world")}</h1></div>
        <strong className="tw:text-[13px] tw:font-bold tw:text-[var(--clock-fg-2)]">{formatDate(displayNow, language)}</strong>
      </div>
      <section className="tw:grid tw:grid-cols-[220px_minmax(0,1fr)] tw:items-center tw:gap-6 tw:rounded-3xl tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card)] tw:p-6 tw:shadow-[0_18px_36px_rgba(0,0,0,0.26)] tw:[@container(max-width:700px)]:grid-cols-[150px_minmax(0,1fr)] tw:[@container(max-width:520px)]:grid-cols-1 tw:max-[760px]:grid-cols-1">
        <AnalogClock now={displayNow} showSeconds={settings.showSeconds} showProgress={settings.showProgress} label={`${h}:${m}`} className="tw:w-[210px] tw:[@container(max-width:700px)]:w-[148px] tw:[@container(max-width:520px)]:w-[138px] tw:max-[760px]:w-[170px]" showNumbers />
        <div className="tw:min-w-0">
          <div className="tw:flex tw:justify-between tw:gap-4 tw:text-sm tw:font-[740] tw:text-[var(--clock-fg-2)]"><span>{greet(displayNow.getHours(), t)}</span><span>{timezoneLabel}</span></div>
          <TimeText h={h} m={m} s={s} showSeconds={settings.showSeconds} className="tw:mt-3.5 tw:text-[80px] tw:[@container(max-width:700px)]:text-[52px] tw:max-[760px]:text-[58px]" />
          <div className="tw:mt-[18px] tw:grid tw:grid-cols-3 tw:gap-2.5 tw:[@container(max-width:520px)]:grid-cols-1 tw:max-[760px]:grid-cols-1">
            <Metric label={t("metric.nextHour")} value={t("unit.minute", { count: minutesToNextHour })} />
            <Metric label={t("metric.day")} value={`${dayPct.toFixed(1)}%`} />
            <Metric label={t("metric.year")} value={`${yearPct.toFixed(1)}%`} />
          </div>
        </div>
      </section>
      <section className="tw:mt-3.5 tw:grid tw:grid-cols-2 tw:gap-3.5 tw:[@container(max-width:700px)]:grid-cols-1 tw:max-[760px]:grid-cols-1">
        {settings.showProgress && <div className={panelClassName}><h2 className="tw:m-0 tw:mb-3 tw:text-base tw:font-[780] tw:text-[var(--clock-fg)]">{t("section.progress")}</h2><ProgressRows dayPct={dayPct} yearPct={yearPct} t={t} /></div>}
        <div className={panelClassName}><h2 className="tw:m-0 tw:mb-3 tw:text-base tw:font-[780] tw:text-[var(--clock-fg)]">{t("metric.week")}</h2><WeekStrip days={weekDays} /></div>
        <div className={cn(panelClassName, "tw:col-span-full")}><h2 className="tw:m-0 tw:mb-3 tw:text-base tw:font-[780] tw:text-[var(--clock-fg)]">{t("section.cities")}</h2><WorldTimes items={worldTimes} dayPct={dayPct} showProgress={settings.showProgress} wide /></div>
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
    <ToolShell accent={t("tab.stopwatch")} title={formatDuration(elapsed, true)} subtitle={running ? t("watch.running") : elapsed > 0 ? t("watch.paused") : t("watch.ready")}>
      <div className="tw:grid tw:grid-cols-[minmax(0,1fr)_280px] tw:gap-3.5 tw:[@container(max-width:760px)]:grid-cols-1 tw:max-[760px]:grid-cols-1">
        <div className={cn(panelClassName, "tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-6 tw:py-10")}>
          <div className="tw:text-[76px] tw:font-[780] tw:leading-none tw:tracking-[0] tw:text-[var(--clock-fg)] tw:[@container(max-width:620px)]:text-[48px]">{formatDuration(elapsed, true)}</div>
          <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-3">
            <ActionButton muted type="button" onClick={lap}>{t("action.lap")}</ActionButton>
            <ActionButton type="button" onClick={running ? pause : start}>{running ? t("action.pause") : t("action.start")}</ActionButton>
            <ActionButton muted type="button" onClick={reset}>{t("action.reset")}</ActionButton>
          </div>
        </div>
        <div className={panelClassName}>
          <h2 className="tw:m-0 tw:mb-3 tw:text-base tw:font-[780]">{t("action.lap")}</h2>
          <div className="tw:flex tw:flex-col tw:gap-2">
            {(laps.length ? laps : [0]).map((lapMs, index) => (
              <div className="tw:flex tw:items-center tw:justify-between tw:rounded-[14px] tw:bg-[var(--clock-card-soft)] tw:px-3 tw:py-2.5 tw:text-sm tw:font-[740]" key={`${lapMs}-${index}`}>
                <span className="tw:text-[var(--clock-fg-2)]">{laps.length ? t("watch.lapName", { count: laps.length - index }) : t("watch.emptyLap")}</span>
                <strong>{laps.length ? formatDuration(lapMs, true) : "--:--.--"}</strong>
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
    <ToolShell accent={t("tab.timer")} title={complete ? t("timer.done") : formatDuration(remaining)} subtitle={complete ? t("timer.doneSubtitle") : running ? t("timer.running") : t("timer.ready")}>
      <div className="tw:grid tw:grid-cols-[minmax(0,1fr)_280px] tw:gap-3.5 tw:[@container(max-width:760px)]:grid-cols-1 tw:max-[760px]:grid-cols-1">
        <div className={cn(panelClassName, "tw:flex tw:flex-col tw:items-center tw:gap-6 tw:py-8")}>
          <div className="tw:grid tw:aspect-square tw:w-[240px] tw:place-items-center tw:rounded-full tw:[background:conic-gradient(var(--clock-accent)_var(--timer-angle),var(--clock-card-soft)_0)]" style={{ "--timer-angle": `${(1 - progress) * 360}deg` } as CSSProperties}>
            <div className="tw:grid tw:aspect-square tw:w-[178px] tw:place-items-center tw:rounded-full tw:bg-[var(--clock-card)] tw:text-center">
              <div><div className="tw:text-[38px] tw:font-[780] tw:leading-none">{complete ? t("timer.done") : formatDuration(remaining)}</div><div className="tw:mt-2 tw:text-xs tw:font-bold tw:text-[var(--clock-fg-2)]">{t("timer.minutes", { count: Math.round(duration / 60000) })}</div></div>
            </div>
          </div>
          <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-3">
            <ActionButton type="button" onClick={running ? pause : start} disabled={complete}>{running ? t("action.pause") : t("action.start")}</ActionButton>
            <ActionButton muted type="button" onClick={reset}>{t("action.reset")}</ActionButton>
          </div>
        </div>
        <div className={cn(panelClassName, "tw:flex tw:flex-col tw:gap-3")}>
          <h2 className="tw:m-0 tw:text-base tw:font-[780]">{t("timer.presets")}</h2>
          {[5, 15, 25, 45].map((minutes) => (
            <button className={cn("tw:cursor-pointer tw:rounded-[14px] tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card-soft)] tw:px-3 tw:py-3 tw:text-left tw:text-sm tw:font-[780] tw:text-[var(--clock-fg)]", Math.round(duration / 60000) === minutes && "tw:border-[var(--clock-accent)] tw:text-[var(--clock-accent)]")} key={minutes} type="button" onClick={() => applyPreset(minutes)}>{t("timer.minutes", { count: minutes })}</button>
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
      <header className="tw:mb-[18px]">
        <span className="tw:text-[13px] tw:font-[760] tw:text-[var(--clock-accent)]">{accent}</span>
        <h1 className="tw:m-0 tw:mt-1 tw:text-[34px] tw:font-[780] tw:leading-[1.08] tw:tracking-[0] tw:text-[var(--clock-fg)] tw:[@container(max-width:700px)]:text-[28px]">{title}</h1>
        <p className="tw:m-0 tw:mt-1.5 tw:text-sm tw:font-[650] tw:text-[var(--clock-fg-2)]">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="tw:min-w-0 tw:rounded-[14px] tw:bg-[var(--clock-card-soft)] tw:p-3"><span className="tw:block tw:text-[11px] tw:font-[760] tw:text-[var(--clock-fg-3)]">{label}</span><strong className="tw:mt-[5px] tw:block tw:truncate tw:text-[17px] tw:font-[760] tw:text-[var(--clock-fg)]">{value}</strong></div>;
}

function ActionButton({ muted, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { muted?: boolean }) {
  return <button {...props} className={cn("tw:cursor-pointer tw:rounded-full tw:border-0 tw:px-5 tw:py-3 tw:text-sm tw:font-[780] tw:disabled:cursor-not-allowed tw:disabled:opacity-45", muted ? "tw:bg-[var(--clock-card-soft)] tw:text-[var(--clock-fg)]" : "tw:bg-[var(--clock-accent)] tw:text-[var(--clock-active-fg)]", props.className)} />;
}
