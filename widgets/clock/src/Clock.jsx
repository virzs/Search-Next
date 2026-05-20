// 标准 JSX 格式的时钟组件
// 注意：不直接从 'react' 导入 hooks，改用宿主注入的全局 React，避免出现多份 React 导致的 Invalid hook call
// 支持通过 props.sdk 获取主题信息并监听主题变化
// 支持通过 sdk.storage 读取用户设置（时区、标题、是否显示秒）

function pad(n) {
  return n.toString().padStart(2, "0");
}

/**
 * 根据时区选项获取当前时间
 * @param {string} timezone - IANA 时区标识（如 "Asia/Tokyo"），空字符串表示本地时间
 * @returns {Date} 调整后的日期对象（本地时区）或原始 Date（带 toLocaleString 输出）
 */
function getTimeInZone(timezone) {
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
    const get = (type) => {
      const p = parts.find((x) => x.type === type);
      return p ? parseInt(p.value, 10) : 0;
    };
    // 构造一个表示目标时区时间的 Date（仅用于显示）
    return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  } catch {
    return now;
  }
}

const Clock = ({ mode = "icon", title, sdk }) => {
  const React = globalThis.React;
  const { createElement, useEffect, useState } = React;
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
    const handler = (payload) => {
      if (!payload) return;
      const { key, value } = payload;
      if (key === "timezone") setTimezone(value || "");
      if (key === "title") setCustomTitle(value || "");
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

  const isIcon = mode === "icon";
  const isDark = themeId === "dark";

  // 显示标题优先级：自定义标题 > props.title > 默认
  const displayTitle = customTitle || title || "时钟";
  // 如果设置了时区，在标题下方显示时区标签
  const timezoneLabel = timezone ? timezone.replace(/_/g, " ").split("/").pop() : "";

  return createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        background: isIcon
          ? "transparent"
          : isDark
            ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: isIcon ? (isDark ? "#e5e7eb" : "#111827") : "#ffffff",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial",
        padding: isIcon ? 0 : 16,
        boxShadow: isIcon ? "none" : "0 8px 30px rgba(0,0,0,0.25)",
      },
    },
    createElement(
      "div",
      { style: { textAlign: "center" } },
      !isIcon
        ? createElement(
            "div",
            { style: { marginBottom: 8 } },
            createElement("div", { style: { fontSize: 14, opacity: 0.8 } }, displayTitle),
            timezoneLabel
              ? createElement("div", { style: { fontSize: 11, opacity: 0.55, marginTop: 2 } }, timezoneLabel)
              : null,
          )
        : null,
      createElement("div", { style: { fontSize: isIcon ? 20 : 48, fontWeight: 600, letterSpacing: 1 } }, timeStr),
      !isIcon
        ? createElement("div", { style: { marginTop: 6, fontSize: 14, opacity: 0.85 } }, String(now.toLocaleDateString()))
        : null,
    ),
  );
};

export default Clock;
