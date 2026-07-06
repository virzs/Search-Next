import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "./constants";
import { parseBoolean, parseWorldTimezones } from "./time";
import type { AppTranslationFn } from "./i18n";
import type { ClockSettings, ClockView, AppSDK } from "./types";

const parseClockView = (value: unknown): ClockView =>
  value === "stopwatch" || value === "timer" ? value : "world";

const parseTimerPreset = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 1 && numberValue <= 240
    ? Math.round(numberValue)
    : DEFAULT_SETTINGS.timerPresetMinutes;
};

export function useClockState(sdk: AppSDK | undefined, t: AppTranslationFn) {
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
      sdk.storage.get("defaultView"),
      sdk.storage.get("timerPresetMinutes"),
    ])
      .then(([timezone, timeFormat, showSeconds, showProgress, worldTimezones, defaultView, timerPresetMinutes]) => {
        setSettings({
          timezone: typeof timezone === "string" ? timezone : DEFAULT_SETTINGS.timezone,
          timeFormat: timeFormat === "12h" ? "12h" : "24h",
          showSeconds: parseBoolean(showSeconds, DEFAULT_SETTINGS.showSeconds),
          showProgress: parseBoolean(showProgress, DEFAULT_SETTINGS.showProgress),
          worldTimezones: parseWorldTimezones(worldTimezones),
          defaultView: parseClockView(defaultView),
          timerPresetMinutes: parseTimerPreset(timerPresetMinutes),
        });
      })
      .catch(() => undefined);
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.events) return;
    const handler = (payload: Record<string, unknown>) => {
      if (payload.appId && sdk.appId && payload.appId !== sdk.appId) return;
      setSettings((prev) => {
        if (payload.key === "timezone") return { ...prev, timezone: payload.value ? String(payload.value) : "" };
        if (payload.key === "timeFormat") return { ...prev, timeFormat: payload.value === "12h" ? "12h" : "24h" };
        if (payload.key === "showSeconds") return { ...prev, showSeconds: parseBoolean(payload.value, prev.showSeconds) };
        if (payload.key === "showProgress") return { ...prev, showProgress: parseBoolean(payload.value, prev.showProgress) };
        if (payload.key === "worldTimezones") return { ...prev, worldTimezones: parseWorldTimezones(payload.value) };
        if (payload.key === "defaultView") return { ...prev, defaultView: parseClockView(payload.value) };
        if (payload.key === "timerPresetMinutes") return { ...prev, timerPresetMinutes: parseTimerPreset(payload.value) };
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
    setSettings(next);
    if (!sdk?.storage) return;
    setSaving(true);
    try {
      await Promise.all([
        sdk.storage.set("timezone", next.timezone),
        sdk.storage.set("timeFormat", next.timeFormat),
        sdk.storage.set("showSeconds", String(next.showSeconds)),
        sdk.storage.set("showProgress", String(next.showProgress)),
        sdk.storage.set("worldTimezones", JSON.stringify(next.worldTimezones)),
        sdk.storage.set("defaultView", next.defaultView),
        sdk.storage.set("timerPresetMinutes", String(next.timerPresetMinutes)),
      ]);
      sdk.toast?.success(t("toast.saved"), t("toast.saveDesc"));
    } catch (error) {
      sdk.toast?.error(t("toast.saveFailed"), error instanceof Error ? error.message : t("toast.retry"));
    } finally {
      setSaving(false);
    }
  };

  return { now, themeId, settings, saving, saveSettings };
}
