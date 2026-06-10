import { WEEK_LABELS } from "../constants";
import { AnalogClock, ProgressRows, TimeText, WeekStrip, WorldTimes } from "../components/ClockPrimitives";
import { dayProgress, formatDate, getTimeInZone, greet, pad, yearProgress } from "../time";
import { useWeekDays, useWorldTimes } from "../hooks";
import type { ClockSettings } from "../types";

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

  return (
    <div className="clock-card clock-card--icon" aria-label={`${h}:${m}:${s}`}>
      <div className="clock-card__content">
        <div className="clock-widget-main">
          <AnalogClock now={displayNow} showSeconds={showAnalogSeconds} showProgress={settings.showProgress} label={`${h}:${m}`} />
          <div className="clock-widget-copy">
            <div className="clock-greeting">{greet(displayNow.getHours())}</div>
            <TimeText h={h} m={m} s={s} showSeconds={showTextSeconds} />
            <div className="clock-date">{dateText}</div>
          </div>
        </div>
        {settings.showProgress && sizeId === "2x2" && <ProgressRows dayPct={dayPct} yearPct={yearPct} />}
        {sizeId === "3x2" && <WeekStrip days={weekDays} />}
        {sizeId === "4x2" && <WorldTimes items={worldTimes} dayPct={dayPct} showProgress={settings.showProgress} />}
      </div>
    </div>
  );
}
