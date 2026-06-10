import { WEEK_LABELS } from "../constants";
import { dayProgress } from "../time";

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

export const TimeText = ({ h, m, s, showSeconds }: { h: string; m: string; s: string; showSeconds: boolean }) => (
  <div className="clock-time">
    <span>{h}</span><span className="clock-sep">:</span><span>{m}</span>{showSeconds && <span className="clock-seconds">{s}</span>}
  </div>
);

export const AnalogClock = ({ now, showSeconds, showProgress, label }: { now: Date; showSeconds?: boolean; showProgress?: boolean; label?: string }) => {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  const hourEnd = toPoint(hours * 30, 21);
  const minuteEnd = toPoint(minutes * 6, 30);
  const secondEnd = toPoint(seconds * 6, 35);
  const secondTail = toPoint(seconds * 6 + 180, 8);
  const progress = Math.max(0, Math.min(100, dayProgress(now)));

  return (
    <div className={showProgress ? "clock-analog clock-analog--progress" : "clock-analog"} aria-label={label}>
      <svg className="clock-analog__svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="clock-analog__outer" cx={CLOCK_CENTER} cy={CLOCK_CENTER} r="47" />
        {showProgress && (
          <circle
            className="clock-analog__progress-ring"
            cx={CLOCK_CENTER}
            cy={CLOCK_CENTER}
            r="45"
            pathLength="100"
            strokeDasharray={`${progress} 100`}
          />
        )}
        <circle className="clock-analog__face" cx={CLOCK_CENTER} cy={CLOCK_CENTER} r="40" />
        <g className="clock-analog__ticks">
          {TICK_MARKS.map((tick) => (
            <line
              className={tick.major ? "clock-analog__tick is-major" : "clock-analog__tick"}
              key={tick.index}
              x1={tick.inner.x}
              y1={tick.inner.y}
              x2={tick.outer.x}
              y2={tick.outer.y}
            />
          ))}
        </g>
        <text className="clock-analog__number clock-analog__number--12" x="50" y="21">12</text>
        <text className="clock-analog__number clock-analog__number--3" x="78" y="53">3</text>
        <text className="clock-analog__number clock-analog__number--6" x="50" y="82">6</text>
        <text className="clock-analog__number clock-analog__number--9" x="22" y="53">9</text>
        <line className="clock-analog__hand clock-analog__hand--hour" x1={CLOCK_CENTER} y1={CLOCK_CENTER} x2={hourEnd.x} y2={hourEnd.y} />
        <line className="clock-analog__hand clock-analog__hand--minute" x1={CLOCK_CENTER} y1={CLOCK_CENTER} x2={minuteEnd.x} y2={minuteEnd.y} />
        {showSeconds && (
          <line className="clock-analog__hand clock-analog__hand--second" x1={secondTail.x} y1={secondTail.y} x2={secondEnd.x} y2={secondEnd.y} />
        )}
        <circle className="clock-analog__pin" cx={CLOCK_CENTER} cy={CLOCK_CENTER} r="3.4" />
      </svg>
    </div>
  );
};

export const ProgressRows = ({ dayPct, yearPct }: { dayPct: number; yearPct: number }) => (
  <div className="clock-progress-rows">
    <ProgressRow label="今日" value={dayPct} />
    <ProgressRow label="今年" value={yearPct} />
  </div>
);

const ProgressRow = ({ label, value }: { label: string; value: number }) => (
  <div className="clock-info-row">
    <div className="clock-info-row__top"><span>{label}</span><strong>{value.toFixed(1)}%</strong></div>
    <div className="clock-info-row__bar"><i style={{ width: `${value}%` }} /></div>
  </div>
);

export const WeekStrip = ({ days }: { days: Array<{ key: string; label: string; date: number; active: boolean }> }) => (
  <div className="clock-week-strip">
    {days.map((day) => <div className={day.active ? "clock-week-day is-active" : "clock-week-day"} key={day.key}><span>{day.label}</span><strong>{day.date}</strong></div>)}
  </div>
);

export const WorldTimes = ({ items, dayPct, showProgress }: { items: Array<{ city: string; time: string; dayLabel?: string; offsetLabel?: string }>; dayPct: number; showProgress: boolean }) => (
  <div className="clock-world-times">
    <div className="clock-zone-grid">
      {items.map((item) => (
        <div className="clock-zone" key={item.city}>
          <div className="clock-zone__meta"><span>{item.city}</span><small>{item.dayLabel}</small></div>
          <strong>{item.time}</strong>
          {item.offsetLabel && <em>{item.offsetLabel}</em>}
        </div>
      ))}
    </div>
    {showProgress && <div className="clock-day-bar"><span style={{ width: `${dayPct}%` }} /></div>}
  </div>
);

export const MiniCalendar = ({ now }: { now: Date }) => (
  <div className="clock-calendar-card">
    <div className="clock-calendar-card__month">{now.getMonth() + 1}月</div>
    <div className="clock-calendar-card__day">{now.getDate()}</div>
    <div className="clock-calendar-card__weekday">星期{WEEK_LABELS[now.getDay()]}</div>
  </div>
);
