import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "./constants";
import { parseBoolean, parseWorldTimezones } from "./time";
import type { ClockSettings, WidgetSDK } from "./types";

export function useClockState(sdk?: WidgetSDK) {
  const [now, setNow] = useState(new Date());
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  const [settings, setSettings] = useState<ClockSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sdk?.storage) return;
    Promise.all([
      sdk.storage.get("timezone"),
      sdk.storage.get("timeFormat"),
      sdk.storage.get("showSeconds"),
      sdk.storage.get("showProgress"),
      sdk.storage.get("worldTimezones"),
    ])
      .then(([timezone, timeFormat, showSeconds, showProgress, worldTimezones]) => {
        setSettings({
          timezone: typeof timezone === "string" ? timezone : DEFAULT_SETTINGS.timezone,
          timeFormat: timeFormat === "12h" ? "12h" : "24h",
          showSeconds: parseBoolean(showSeconds, DEFAULT_SETTINGS.showSeconds),
          showProgress: parseBoolean(showProgress, DEFAULT_SETTINGS.showProgress),
          worldTimezones: parseWorldTimezones(worldTimezones),
        });
      })
      .catch(() => undefined);
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.events) return;
    const handler = (payload: Record<string, unknown>) => {
      if (payload.widgetId && sdk.widgetId && payload.widgetId !== sdk.widgetId) return;
      setSettings((prev) => {
        if (payload.key === "timezone") return { ...prev, timezone: payload.value ? String(payload.value) : "" };
        if (payload.key === "timeFormat") return { ...prev, timeFormat: payload.value === "12h" ? "12h" : "24h" };
        if (payload.key === "showSeconds") return { ...prev, showSeconds: parseBoolean(payload.value, prev.showSeconds) };
        if (payload.key === "showProgress") return { ...prev, showProgress: parseBoolean(payload.value, prev.showProgress) };
        if (payload.key === "worldTimezones") return { ...prev, worldTimezones: parseWorldTimezones(payload.value) };
        return prev;
      });
    };
    const unsubscribe = sdk.events.on("storage:changed", handler);
    if (typeof unsubscribe === "function") return unsubscribe;
    return () => sdk.events?.off?.("storage:changed", handler);
  }, [sdk]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sdk?.onThemeChange) return;
    return sdk.onThemeChange((nextTheme) => setThemeId(nextTheme.activeThemeId));
  }, [sdk]);

  const saveSettings = async (next: ClockSettings) => {
    if (!sdk?.storage) return;
    setSaving(true);
    try {
      await Promise.all([
        sdk.storage.set("timezone", next.timezone),
        sdk.storage.set("timeFormat", next.timeFormat),
        sdk.storage.set("showSeconds", String(next.showSeconds)),
        sdk.storage.set("showProgress", String(next.showProgress)),
        sdk.storage.set("worldTimezones", JSON.stringify(next.worldTimezones)),
      ]);
      setSettings(next);
      sdk.toast?.success("设置已保存", "时钟小组件会立即使用新的显示偏好。");
    } catch (error) {
      sdk.toast?.error("保存失败", error instanceof Error ? error.message : "请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  return { now, themeId, settings, saving, saveSettings };
}
