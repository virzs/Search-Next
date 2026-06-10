import { MemoryRouter, Navigate, Route, Routes } from "react-router";
import { useClockState } from "./useClockState";
import { FullPage } from "./pages/full-page";
import { IconPage } from "./pages/icon-page";
import { SettingsPage } from "./pages/settings-page";
import type { ClockProps } from "./types";

const Clock = ({ mode = "icon", pagePath, title, sdk }: ClockProps) => {
  const { now, themeId, settings, saving, saveSettings } = useClockState(sdk);
  const sizeId = sdk?.sizeId || "2x2";
  const isIcon = mode === "icon";
  const isSettings = mode === "settings";
  const shellClassName = [
    "clock-widget-shell",
    `clock-size-${sizeId}`,
    isIcon ? "clock-widget-shell--icon" : "clock-widget-shell--panel",
    isSettings ? "clock-widget-shell--settings" : "",
    themeId === "dark" ? "clock-theme-dark" : "clock-theme-light",
  ].join(" ");

  if (isSettings) {
    return (
      <div className={shellClassName}>
        <MemoryRouter initialEntries={[pagePath || "/settings"]}>
          <Routes>
            <Route path="/settings" element={<SettingsPage settings={settings} saving={saving} onSave={saveSettings} />} />
            <Route path="*" element={<Navigate to="/settings" replace />} />
          </Routes>
        </MemoryRouter>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      {isIcon ? (
        <IconPage now={now} settings={settings} sizeId={sizeId} />
      ) : (
        <FullPage now={now} settings={settings} title={title || "时钟"} />
      )}
    </div>
  );
};

export default Clock;
