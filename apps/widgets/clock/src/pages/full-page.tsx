import { addHours, differenceInMilliseconds, startOfHour } from "date-fns";
import { TIMEZONES } from "../constants";
import { AnalogClock, MiniCalendar, ProgressRows, TimeText, WeekStrip, WorldTimes } from "../components/ClockPrimitives";
import { cn } from "../styles";
import { dayProgress, formatDate, getTimeInZone, greet, pad, yearProgress } from "../time";
import { useWeekDays, useWorldTimes } from "../hooks";
import type { ClockSettings } from "../types";

const frameClassName = "tw:grid tw:h-full tw:w-full tw:grid-cols-[220px_minmax(0,1fr)] tw:overflow-hidden tw:rounded-[inherit] tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-app)] tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:grid-cols-[180px_minmax(0,1fr)] tw:[@container(max-width:700px)]:!grid-cols-1 tw:max-[760px]:!grid-cols-1";
const sidebarClassName = "tw:flex tw:min-w-0 tw:flex-col tw:gap-[18px] tw:border-r tw:border-[var(--clock-divider)] tw:bg-[var(--clock-sidebar)] tw:px-4 tw:py-5 tw:[@container(max-width:860px)]:px-3.5 tw:[@container(max-width:860px)]:py-[18px] tw:[@container(max-width:700px)]:hidden tw:max-[760px]:hidden";
const mainClassName = "tw:h-full tw:min-w-0 tw:overflow-auto tw:p-6 tw:[@container(max-width:860px)]:p-[18px] tw:[@container(max-width:700px)]:p-4 tw:max-[520px]:p-[18px]";
const brandClassName = "tw:flex tw:min-w-0 tw:flex-col tw:gap-1";
const brandLabelClassName = "tw:truncate tw:text-xs tw:font-[760] tw:text-[var(--clock-fg-3)]";
const brandTitleClassName = "tw:text-[28px] tw:font-[780] tw:leading-none tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:text-2xl";
const navClassName = "tw:flex tw:flex-col tw:gap-1.5";
const navItemClassName = (active = false) => cn(
  "tw:rounded-[10px] tw:px-3 tw:py-2.5 tw:text-[15px] tw:font-[720] tw:text-[var(--clock-fg-2)] tw:[@container(max-width:860px)]:px-2.5 tw:[@container(max-width:860px)]:py-[9px] tw:[@container(max-width:860px)]:text-sm",
  active && "tw:bg-[rgba(255,159,10,0.18)] tw:text-[var(--clock-accent)]",
);
const panelClassName = "tw:min-w-0 tw:rounded-3xl tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card)] tw:p-4 tw:shadow-[0_18px_36px_rgba(0,0,0,0.26)]";

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
    <div className={frameClassName}>
      <aside className={sidebarClassName}>
        <div className={brandClassName}><span className={brandLabelClassName}>{title}</span><strong className={brandTitleClassName}>时钟</strong></div>
        <nav className={navClassName} aria-label="时钟视图">
          <span className={navItemClassName(true)}>世界时钟</span>
          <span className={navItemClassName()}>闹钟</span>
          <span className={navItemClassName()}>秒表</span>
          <span className={navItemClassName()}>计时器</span>
        </nav>
        <MiniCalendar now={displayNow} />
      </aside>
      <main className={mainClassName}>
        <div className="tw:mb-[18px] tw:flex tw:items-end tw:justify-between tw:gap-[18px] tw:[@container(max-width:860px)]:mb-3.5 tw:[@container(max-width:700px)]:mb-3 tw:[@container(max-width:700px)]:flex-col tw:[@container(max-width:700px)]:items-start tw:[@container(max-width:700px)]:gap-1.5 tw:max-[520px]:flex-col tw:max-[520px]:items-start">
          <div><span className="tw:text-[13px] tw:font-[760] tw:text-[var(--clock-accent)]">{timezoneLabel}</span><h1 className="tw:m-0 tw:mt-1 tw:text-[34px] tw:font-[780] tw:leading-[1.08] tw:tracking-[0] tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:text-[30px] tw:[@container(max-width:700px)]:text-[28px] tw:max-[520px]:text-[28px]">世界时钟</h1></div>
          <strong className="tw:text-[13px] tw:font-bold tw:text-[var(--clock-fg-2)]">{formatDate(displayNow)}</strong>
        </div>
        <section className="tw:grid tw:grid-cols-[220px_minmax(0,1fr)] tw:items-center tw:gap-6 tw:rounded-3xl tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card)] tw:p-6 tw:shadow-[0_18px_36px_rgba(0,0,0,0.26)] tw:[@container(max-width:860px)]:grid-cols-[168px_minmax(0,1fr)] tw:[@container(max-width:860px)]:gap-[18px] tw:[@container(max-width:860px)]:p-[18px] tw:[@container(max-width:700px)]:grid-cols-[150px_minmax(0,1fr)] tw:[@container(max-width:700px)]:gap-4 tw:[@container(max-width:700px)]:p-4 tw:[@container(max-width:520px)]:grid-cols-1 tw:max-[760px]:grid-cols-1">
          <AnalogClock
            now={displayNow}
            showSeconds={settings.showSeconds}
            showProgress={settings.showProgress}
            label={`${h}:${m}`}
            className="tw:w-[210px] tw:[@container(max-width:860px)]:w-[168px] tw:[@container(max-width:700px)]:w-[148px] tw:[@container(max-width:520px)]:w-[138px] tw:max-[760px]:w-[170px]"
            showNumbers
          />
          <div className="tw:min-w-0">
            <div className="tw:flex tw:justify-between tw:gap-4 tw:text-sm tw:font-[740] tw:text-[var(--clock-fg-2)]"><span>{greet(displayNow.getHours())}</span><span>{timezoneLabel}</span></div>
            <TimeText h={h} m={m} s={s} showSeconds={settings.showSeconds} className="tw:mt-3.5 tw:text-[80px] tw:[@container(max-width:860px)]:text-[60px] tw:[@container(max-width:700px)]:text-[52px] tw:max-[760px]:text-[58px]" />
            <div className="tw:mt-[18px] tw:grid tw:grid-cols-3 tw:gap-2.5 tw:[@container(max-width:860px)]:mt-3.5 tw:[@container(max-width:860px)]:gap-2 tw:[@container(max-width:520px)]:grid-cols-1 tw:max-[760px]:grid-cols-1">
              <div className="tw:min-w-0 tw:rounded-[14px] tw:bg-[var(--clock-card-soft)] tw:p-3 tw:[@container(max-width:860px)]:p-[9px]"><span className="tw:block tw:text-[11px] tw:font-[760] tw:text-[var(--clock-fg-3)]">下一整点</span><strong className="tw:mt-[5px] tw:block tw:truncate tw:text-[17px] tw:font-[760] tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:text-sm">{minutesToNextHour} 分钟</strong></div>
              <div className="tw:min-w-0 tw:rounded-[14px] tw:bg-[var(--clock-card-soft)] tw:p-3 tw:[@container(max-width:860px)]:p-[9px]"><span className="tw:block tw:text-[11px] tw:font-[760] tw:text-[var(--clock-fg-3)]">今日</span><strong className="tw:mt-[5px] tw:block tw:truncate tw:text-[17px] tw:font-[760] tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:text-sm">{dayPct.toFixed(1)}%</strong></div>
              <div className="tw:min-w-0 tw:rounded-[14px] tw:bg-[var(--clock-card-soft)] tw:p-3 tw:[@container(max-width:860px)]:p-[9px]"><span className="tw:block tw:text-[11px] tw:font-[760] tw:text-[var(--clock-fg-3)]">今年</span><strong className="tw:mt-[5px] tw:block tw:truncate tw:text-[17px] tw:font-[760] tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:text-sm">{yearPct.toFixed(1)}%</strong></div>
            </div>
          </div>
        </section>
        <section className="tw:mt-3.5 tw:grid tw:grid-cols-2 tw:gap-3.5 tw:[@container(max-width:700px)]:grid-cols-1 tw:max-[760px]:grid-cols-1">
          {settings.showProgress && <div className={panelClassName}><h2 className="tw:m-0 tw:mb-3 tw:text-base tw:font-[780] tw:text-[var(--clock-fg)]">时间进度</h2><ProgressRows dayPct={dayPct} yearPct={yearPct} /></div>}
          <div className={panelClassName}><h2 className="tw:m-0 tw:mb-3 tw:text-base tw:font-[780] tw:text-[var(--clock-fg)]">本周</h2><WeekStrip days={weekDays} /></div>
          <div className={cn(panelClassName, "tw:col-span-full")}><h2 className="tw:m-0 tw:mb-3 tw:text-base tw:font-[780] tw:text-[var(--clock-fg)]">城市</h2><WorldTimes items={worldTimes} dayPct={dayPct} showProgress={settings.showProgress} wide /></div>
        </section>
      </main>
    </div>
  );
}
