// 支持通过 props.sdk 获取主题信息并监听主题变化
// 支持通过 sdk.storage 读取用户设置（时区、标题、是否显示秒）
import { useEffect, useState } from "react";
import type { ClockProps } from "./types";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// 根据时区选项获取当前时间，空字符串表示本地时间。
function getTimeInZone(timezone: string) {
  const now = new Date();
  if (!timezone) return now;
  try {
    // 使用 Intl 格式化指定时区的各个时间部分
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric", minute: "numeric", second: "numeric",
      year: "numeric", month: "numeric", day: "numeric",
      hour12: false,
    }).formatToParts(now);
    const get = (type: Intl.DateTimeFormatPartTypes) => {
      const p = parts.find((x) => x.type === type);
      return p ? parseInt(p.value, 10) : 0;
    };
    // 构造一个表示目标时区时间的 Date（仅用于显示）
    return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  } catch {
    return now;
  }
}

const Clock = ({ mode = "icon", title, sdk }: ClockProps) => {
  const [now, setNow] = useState(new Date());
  // 通过 SDK 获取当前主题，默认 "light"
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  // 用户设置：时区、自定义标题、是否显示秒（从 sdk.storage 读取）
  const [timezone, setTimezone] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [showSeconds, setShowSeconds] = useState(true);

  // 初始化时从 sdk.storage 加载用户设置
  useEffect(() => {
    if (!sdk?.storage) return;
    Promise.all([
      sdk.storage.get("timezone"),
      sdk.storage.get("title"),
      sdk.storage.get("showSeconds"),
    ]).then(([tz, t, ss]) => {
      if (tz !== null && tz !== undefined) setTimezone(String(tz));
      if (t !== null && t !== undefined) setCustomTitle(String(t));
      if (ss !== null && ss !== undefined) setShowSeconds(ss !== "false" && ss !== false);
    }).catch(() => {});
  }, [sdk]);

  // 监听 storage 变化事件，支持实时更新设置（由设置面板触发）
  useEffect(() => {
    if (!sdk?.events) return;
    const handler = (payload: Record<string, unknown>) => {
      if (!payload) return;
      const { key, value } = payload;
      if (key === "timezone") setTimezone(value ? String(value) : "");
      if (key === "title") setCustomTitle(value ? String(value) : "");
      if (key === "showSeconds") setShowSeconds(value !== "false" && value !== false);
    };
    const unsub = sdk.events.on("storage:changed", handler);
    return typeof unsub === "function" ? unsub : undefined;
  }, [sdk]);

  // 定时更新，考虑时区
  useEffect(() => {
    const tick = () => setNow(getTimeInZone(timezone));
    tick(); // 立即执行一次
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [timezone]);

  // 监听宿主主题变化事件，实时更新小组件配色
  useEffect(() => {
    if (!sdk?.onThemeChange) return;
    const unsubscribe = sdk.onThemeChange((newTheme) => {
      setThemeId(newTheme.activeThemeId);
    });
    return unsubscribe;
  }, [sdk]);

  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  // 根据设置决定时间显示格式
  const timeStr = showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
  const iconTimeStr = `${h}:${m}`;

  const isIcon = mode === "icon";
  const isDark = themeId === "dark";

  // 显示标题优先级：自定义标题 > props.title > 默认
  const displayTitle = customTitle || title || "时钟";
  const timezoneLabel = timezone
    ? timezone.replace(/_/g, " ").split("/").pop()
    : "本地时间";
  const dateLabel = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);
  const periodLabel = now.getHours() < 6
    ? "夜深了"
    : now.getHours() < 12
      ? "上午"
      : now.getHours() < 18
        ? "下午"
        : "晚上";
  const shellClassName = [
    "clock-widget-shell tw:flex tw:h-full tw:w-full tw:items-center tw:justify-center tw:box-border tw:[container-type:size] tw:overflow-hidden tw:rounded-[14px] tw:font-sans",
    isIcon ? "clock-widget-shell--icon tw:px-1.5 tw:py-1.5" : "clock-widget-shell--full tw:p-6",
    isDark
      ? "tw:border tw:border-white/10 tw:bg-[linear-gradient(145deg,#263238_0%,#11191d_100%)] tw:text-[#f3f7f5] tw:shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
      : "tw:border tw:border-[#2b6655]/15 tw:bg-[linear-gradient(145deg,#f7fbf8_0%,#dcefe7_100%)] tw:text-[#17352d] tw:shadow-[0_10px_28px_rgba(37,88,74,0.16)]",
  ].join(" ");

  return (
    <div className={shellClassName}>
      <div className="tw:w-full tw:text-center">
        {!isIcon && (
          <div className="tw:mb-5">
            <div className="tw:text-[13px] tw:font-bold tw:tracking-[2px] tw:opacity-70">{displayTitle}</div>
            <div className="tw:mt-[5px] tw:text-xs tw:opacity-55">{timezoneLabel}</div>
          </div>
        )}
        {isIcon ? (
          <div className="clock-widget-icon-time" aria-label={timeStr}>
            <span className="clock-widget-icon-time__main">{iconTimeStr}</span>
          </div>
        ) : (
          <div className="tw:whitespace-nowrap tw:text-[clamp(42px,14cqw,68px)] tw:font-bold tw:leading-none tw:tracking-[1px]">
            {timeStr}
          </div>
        )}
        {!isIcon && (
          <div className="tw:mt-[18px]">
            <div className="tw:text-[15px] tw:font-semibold tw:opacity-[0.88]">{dateLabel}</div>
            <div className="tw:mt-[7px] tw:text-xs tw:tracking-[1px] tw:opacity-[0.58]">{periodLabel}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clock;
