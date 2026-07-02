import { MemoryRouter, Navigate, Route, Routes } from "react-router";
import { useClockState } from "./useClockState";
import { FullPage } from "./pages/full-page";
import { IconPage } from "./pages/icon-page";
import { SettingsPage } from "./pages/settings-page";
import { resources, useWidgetI18n } from "./i18n";
import { clockThemeVars, cn } from "./styles";
import type { ClockProps } from "./types";

const Clock = ({ mode = "icon", pagePath, title, sdk }: ClockProps) => {
  const { language, t } = useWidgetI18n(sdk, resources);
  const { now, themeId, settings, saving, saveSettings } = useClockState(sdk, t);
  const sizeId = sdk?.sizeId || "2x2";
  const isIcon = mode === "icon" || mode === "appIcon";
  const isSettings = mode === "settings";
  const themeKey = themeId === "dark" ? "dark" : "light";
  const shellClassName = cn(
    "tw:h-full tw:w-full tw:box-border tw:text-[var(--clock-fg)] tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,Helvetica_Neue,system-ui,sans-serif] tw:tracking-[0] tw:antialiased tw:[container-type:size] tw:[&_*]:box-border",
    isIcon
      ? "tw:flex tw:items-center tw:justify-center tw:overflow-hidden"
      : "tw:overflow-hidden tw:rounded-[18px] tw:bg-[var(--clock-app)]",
  );

  if (isSettings) {
    return (
      <div className={shellClassName} style={clockThemeVars[themeKey]}>
        <MemoryRouter initialEntries={[pagePath || "/settings"]}>
          <Routes>
            <Route path="/settings" element={<SettingsPage settings={settings} saving={saving} onSave={saveSettings} language={language} t={t} />} />
            <Route path="*" element={<Navigate to="/settings" replace />} />
          </Routes>
        </MemoryRouter>
      </div>
    );
  }

  return (
    <div className={shellClassName} style={clockThemeVars[themeKey]}>
      {isIcon ? (
        <IconPage now={now} settings={settings} sizeId={sizeId} language={language} t={t} />
      ) : (
        <FullPage now={now} settings={settings} title={title || t("settings.brand")} language={language} t={t} />
      )}
    </div>
  );
};

export default Clock;
