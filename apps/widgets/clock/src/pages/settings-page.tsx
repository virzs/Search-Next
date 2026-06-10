import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { TIMEZONES } from "../constants";
import type { ClockSettings } from "../types";

export function SettingsPage({ settings, saving, onSave }: { settings: ClockSettings; saving: boolean; onSave: (next: ClockSettings) => Promise<void> }) {
  const [draft, setDraft] = useState<ClockSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const toggleWorldTimezone = (timezone: string, checked: boolean) => {
    setDraft((prev) => {
      const next = checked
        ? [...prev.worldTimezones, timezone]
        : prev.worldTimezones.filter((item) => item !== timezone);
      return { ...prev, worldTimezones: next.slice(0, 6) };
    });
  };

  return (
    <div className="clock-settings-app">
      <aside className="clock-settings-sidebar">
        <div className="clock-app-brand"><span>Clock</span><strong>时钟</strong></div>
        <nav className="clock-settings-nav" aria-label="设置分类">
          <span className="is-active">显示偏好</span>
          <span>世界时钟</span>
          <span>小组件</span>
        </nav>
      </aside>
      <main className="clock-settings-content">
        <header className="clock-settings-header">
          <h2>显示偏好</h2>
          <p>时钟小组件</p>
        </header>

        <section className="clock-settings-group">
          <SettingRow title="主时区" description="桌面小组件与展开页的基准时间">
            <select value={draft.timezone} onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}>
              {TIMEZONES.map((item) => <option key={item.value || "local"} value={item.value}>{item.city}</option>)}
            </select>
          </SettingRow>
          <SettingRow title="时间制式" description="数字时间的显示方式">
            <div className="clock-format-switch" role="group" aria-label="时间制式">
              <button className={draft.timeFormat === "24h" ? "is-active" : ""} type="button" onClick={() => setDraft((prev) => ({ ...prev, timeFormat: "24h" }))}>24h</button>
              <button className={draft.timeFormat === "12h" ? "is-active" : ""} type="button" onClick={() => setDraft((prev) => ({ ...prev, timeFormat: "12h" }))}>12h</button>
            </div>
          </SettingRow>
        </section>

        <section className="clock-settings-group">
          <ToggleRow title="秒针与秒数" description="在较大尺寸与展开页显示" checked={draft.showSeconds} onChange={(checked) => setDraft((prev) => ({ ...prev, showSeconds: checked }))} />
          <ToggleRow title="日程进度" description="显示今日与今年进度" checked={draft.showProgress} onChange={(checked) => setDraft((prev) => ({ ...prev, showProgress: checked }))} />
        </section>

        <section className="clock-settings-group clock-settings-group--cities">
          <div className="clock-settings-group-title"><strong>世界时钟城市</strong><span>最多选择 6 个，用于 4x2 和展开页。</span></div>
          <div className="clock-city-grid">
            {TIMEZONES.filter((item) => item.value).map((item) => (
              <label className="clock-city-option" key={item.value}>
                <input type="checkbox" checked={draft.worldTimezones.includes(item.value)} disabled={!draft.worldTimezones.includes(item.value) && draft.worldTimezones.length >= 6} onChange={(event) => toggleWorldTimezone(item.value, event.target.checked)} />
                <span>{item.city}</span>
                <i aria-hidden="true" />
              </label>
            ))}
          </div>
        </section>

        <button className="clock-save-button" type="button" disabled={saving} onClick={() => onSave(draft)}>{saving ? "保存中…" : "保存设置"}</button>
      </main>
    </div>
  );
}

const SettingRow = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <div className="clock-settings-row"><span><strong>{title}</strong><small>{description}</small></span>{children}</div>
);

const ToggleRow = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className="clock-settings-row"><span><strong>{title}</strong><small>{description}</small></span><input className="clock-switch-input" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i className="clock-switch" aria-hidden="true" /></label>
);
