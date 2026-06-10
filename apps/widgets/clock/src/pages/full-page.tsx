import { addHours, differenceInMilliseconds, startOfHour } from "date-fns";
import { TIMEZONES } from "../constants";
import { AnalogClock, MiniCalendar, ProgressRows, TimeText, WeekStrip, WorldTimes } from "../components/ClockPrimitives";
import { dayProgress, formatDate, getTimeInZone, greet, pad, yearProgress } from "../time";
import { useWeekDays, useWorldTimes } from "../hooks";
import type { ClockSettings } from "../types";

export function FullPage({ now, settings, title }: { now: Date; settings: ClockSettings; title: string }) {
  const displayNow = getTimeInZone(settings.timezone, now);
  const h24 = displayNow.getHours();
  const h = settings.timeFormat === "12h" ? pad(((h24 + 11) % 12) + 1) : pad(h24);
  const m = pad(displayNow.getMinutes());
  const s = pad(displayNow.getSeconds());
  const dayPct = dayProgress(displayNow);
  const yearPct = yearProgress(displayNow);
  const timezoneLabel = TIMEZONES.find((item) => item.value === settings.timezone)?.city ?? (settings.timezone ? settings.timezone.replace(/_/g, " ").split("/").pop() : "本地");
  const weekDays = useWeekDays(displayNow);
  const worldTimes = useWorldTimes(now, settings);
  const nextHour = startOfHour(addHours(displayNow, 1));
  const minutesToNextHour = Math.max(0, Math.ceil(differenceInMilliseconds(nextHour, displayNow) / 60000));

  return (
    <div className="clock-ipados-page">
      <aside className="clock-ipados-sidebar">
        <div className="clock-app-brand"><span>{title}</span><strong>时钟</strong></div>
        <nav className="clock-app-nav" aria-label="时钟视图">
          <span className="is-active">世界时钟</span>
          <span>闹钟</span>
          <span>秒表</span>
          <span>计时器</span>
        </nav>
        <MiniCalendar now={displayNow} />
      </aside>
      <main className="clock-ipados-main">
        <div className="clock-app-titlebar">
          <div><span>{timezoneLabel}</span><h1>世界时钟</h1></div>
          <strong>{formatDate(displayNow)}</strong>
        </div>
        <section className="clock-hero-card">
          <AnalogClock now={displayNow} showSeconds={settings.showSeconds} showProgress={settings.showProgress} label={`${h}:${m}`} />
          <div className="clock-hero-copy">
            <div className="clock-hero-meta"><span>{greet(displayNow.getHours())}</span><span>{timezoneLabel}</span></div>
            <div className="clock-hero-time"><TimeText h={h} m={m} s={s} showSeconds={settings.showSeconds} /></div>
            <div className="clock-hero-metrics">
              <div><span>下一整点</span><strong>{minutesToNextHour} 分钟</strong></div>
              <div><span>今日</span><strong>{dayPct.toFixed(1)}%</strong></div>
              <div><span>今年</span><strong>{yearPct.toFixed(1)}%</strong></div>
            </div>
          </div>
        </section>
        <section className="clock-app-grid">
          {settings.showProgress && <div className="clock-app-panel"><h2>时间进度</h2><ProgressRows dayPct={dayPct} yearPct={yearPct} /></div>}
          <div className="clock-app-panel"><h2>本周</h2><WeekStrip days={weekDays} /></div>
          <div className="clock-app-panel clock-app-panel--wide"><h2>城市</h2><WorldTimes items={worldTimes} dayPct={dayPct} showProgress={settings.showProgress} /></div>
        </section>
      </main>
    </div>
  );
}
