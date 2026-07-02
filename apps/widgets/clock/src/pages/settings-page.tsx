import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { TIMEZONES } from "../constants";
import { cn } from "../styles";
import { timezoneName } from "../time";
import type { ClockSettings } from "../types";
import type { WidgetLanguage, WidgetTranslationFn } from "../i18n";

const frameClassName = "tw:grid tw:h-full tw:w-full tw:grid-cols-[220px_minmax(0,1fr)] tw:overflow-hidden tw:rounded-[inherit] tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-app)] tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:grid-cols-[180px_minmax(0,1fr)] tw:[@container(max-width:700px)]:!grid-cols-1 tw:max-[760px]:!grid-cols-1";
const sidebarClassName = "tw:flex tw:min-w-0 tw:flex-col tw:gap-[18px] tw:border-r tw:border-[var(--clock-divider)] tw:bg-[var(--clock-sidebar)] tw:px-4 tw:py-5 tw:[@container(max-width:860px)]:px-3.5 tw:[@container(max-width:860px)]:py-[18px] tw:[@container(max-width:700px)]:hidden tw:max-[760px]:hidden";
const contentClassName = "tw:h-full tw:min-w-0 tw:overflow-auto tw:p-6 tw:[@container(max-width:860px)]:p-[18px] tw:[@container(max-width:700px)]:p-4 tw:max-[520px]:p-[18px]";
const brandClassName = "tw:flex tw:min-w-0 tw:flex-col tw:gap-1";
const brandLabelClassName = "tw:truncate tw:text-xs tw:font-[760] tw:text-[var(--clock-fg-3)]";
const brandTitleClassName = "tw:text-[28px] tw:font-[780] tw:leading-none tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:text-2xl";
const navClassName = "tw:flex tw:flex-col tw:gap-1.5";
const navItemClassName = (active = false) => cn(
  "tw:rounded-[10px] tw:px-3 tw:py-2.5 tw:text-[15px] tw:font-[720] tw:text-[var(--clock-fg-2)] tw:[@container(max-width:860px)]:px-2.5 tw:[@container(max-width:860px)]:py-[9px] tw:[@container(max-width:860px)]:text-sm",
  active && "tw:bg-[rgba(255,159,10,0.18)] tw:text-[var(--clock-accent)]",
);
const groupClassName = "tw:mb-3.5 tw:overflow-hidden tw:rounded-3xl tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card)] tw:shadow-[0_18px_36px_rgba(0,0,0,0.26)]";
const rowClassName = "tw:relative tw:flex tw:min-h-16 tw:items-center tw:justify-between tw:gap-[18px] tw:border-b tw:border-[var(--clock-divider)] tw:px-4 tw:py-3 tw:text-[var(--clock-fg)] tw:last:border-b-0 tw:[@container(max-width:520px)]:flex-col tw:[@container(max-width:520px)]:items-start tw:max-[520px]:flex-col tw:max-[520px]:items-start";
const rowTextClassName = "tw:min-w-0";
const rowTitleClassName = "tw:block tw:text-[15px] tw:font-[760] tw:text-[var(--clock-fg)]";
const rowDescriptionClassName = "tw:mt-1 tw:block tw:text-xs tw:font-[620] tw:leading-[1.35] tw:text-[var(--clock-fg-2)]";

export function SettingsPage({ settings, saving, onSave, t }: { settings: ClockSettings; saving: boolean; onSave: (next: ClockSettings) => Promise<void>; language: WidgetLanguage; t: WidgetTranslationFn }) {
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
    <div className={frameClassName}>
      <aside className={sidebarClassName}>
        <div className={brandClassName}><span className={brandLabelClassName}>{t("settings.brand")}</span><strong className={brandTitleClassName}>{t("settings.subtitle")}</strong></div>
        <nav className={navClassName} aria-label={t("settings.title")}>
          <span className={navItemClassName(true)}>{t("settings.nav.display")}</span>
          <span className={navItemClassName()}>{t("settings.nav.world")}</span>
          <span className={navItemClassName()}>{t("settings.nav.widget")}</span>
        </nav>
      </aside>
      <main className={contentClassName}>
        <header className="tw:mb-[18px]">
          <h2 className="tw:m-0 tw:mt-1 tw:text-[34px] tw:font-[780] tw:leading-[1.08] tw:tracking-[0] tw:text-[var(--clock-fg)] tw:[@container(max-width:860px)]:text-[30px] tw:[@container(max-width:700px)]:text-[28px] tw:max-[520px]:text-[28px]">{t("settings.title")}</h2>
          <p className="tw:m-0 tw:mt-1.5 tw:text-sm tw:font-[650] tw:text-[var(--clock-fg-2)]">{t("settings.subtitle")}</p>
        </header>

        <section className={groupClassName}>
          <SettingRow title={t("settings.mainTz.title")} description={t("settings.mainTz.desc")}>
            <select className="tw:min-w-[150px] tw:rounded-xl tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card-soft)] tw:px-2.5 tw:py-2 tw:text-sm tw:font-bold tw:text-[var(--clock-fg)] tw:outline-none tw:[@container(max-width:520px)]:w-full tw:max-[520px]:w-full" value={draft.timezone} onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}>
              {TIMEZONES.map((item) => <option key={item.value || "local"} value={item.value}>{timezoneName(item.value, t, item.city)}</option>)}
            </select>
          </SettingRow>
          <SettingRow title={t("settings.timeFormat.title")} description={t("settings.timeFormat.desc")}>
            <div className="tw:grid tw:min-w-[136px] tw:grid-cols-2 tw:gap-[3px] tw:rounded-xl tw:bg-[var(--clock-card-soft)] tw:p-[3px] tw:[@container(max-width:520px)]:w-full tw:max-[520px]:w-full" role="group" aria-label={t("settings.timeFormat.label")}>
              <button className={cn("tw:cursor-pointer tw:rounded-[9px] tw:border-0 tw:bg-transparent tw:px-2.5 tw:py-[7px] tw:text-[13px] tw:font-[780] tw:text-[var(--clock-fg-2)]", draft.timeFormat === "24h" && "tw:bg-[var(--clock-accent)] tw:text-[var(--clock-active-fg)]")} type="button" onClick={() => setDraft((prev) => ({ ...prev, timeFormat: "24h" }))}>24h</button>
              <button className={cn("tw:cursor-pointer tw:rounded-[9px] tw:border-0 tw:bg-transparent tw:px-2.5 tw:py-[7px] tw:text-[13px] tw:font-[780] tw:text-[var(--clock-fg-2)]", draft.timeFormat === "12h" && "tw:bg-[var(--clock-accent)] tw:text-[var(--clock-active-fg)]")} type="button" onClick={() => setDraft((prev) => ({ ...prev, timeFormat: "12h" }))}>12h</button>
            </div>
          </SettingRow>
        </section>

        <section className={groupClassName}>
          <ToggleRow title={t("settings.seconds.title")} description={t("settings.seconds.desc")} checked={draft.showSeconds} onChange={(checked) => setDraft((prev) => ({ ...prev, showSeconds: checked }))} />
          <ToggleRow title={t("settings.progress.title")} description={t("settings.progress.desc")} checked={draft.showProgress} onChange={(checked) => setDraft((prev) => ({ ...prev, showProgress: checked }))} />
        </section>

        <section className={groupClassName}>
          <SettingRow title={t("settings.defaultPage.title")} description={t("settings.defaultPage.desc")}>
            <div className="tw:grid tw:min-w-[220px] tw:grid-cols-3 tw:gap-[3px] tw:rounded-xl tw:bg-[var(--clock-card-soft)] tw:p-[3px] tw:[@container(max-width:520px)]:w-full tw:max-[520px]:w-full" role="group" aria-label={t("settings.defaultPage.title")}>
              {[
                { label: t("tab.world"), value: "world" },
                { label: t("tab.stopwatch"), value: "stopwatch" },
                { label: t("tab.timer"), value: "timer" },
              ].map((item) => (
                <button className={cn("tw:cursor-pointer tw:rounded-[9px] tw:border-0 tw:bg-transparent tw:px-2.5 tw:py-[7px] tw:text-[13px] tw:font-[780] tw:text-[var(--clock-fg-2)]", draft.defaultView === item.value && "tw:bg-[var(--clock-accent)] tw:text-[var(--clock-active-fg)]")} key={item.value} type="button" onClick={() => setDraft((prev) => ({ ...prev, defaultView: item.value as ClockSettings["defaultView"] }))}>{item.label}</button>
              ))}
            </div>
          </SettingRow>
          <SettingRow title={t("settings.defaultTimer.title")} description={t("settings.defaultTimer.desc")}>
            <input className="tw:min-w-[120px] tw:rounded-xl tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card-soft)] tw:px-2.5 tw:py-2 tw:text-sm tw:font-bold tw:text-[var(--clock-fg)] tw:outline-none tw:[@container(max-width:520px)]:w-full tw:max-[520px]:w-full" min={1} max={240} type="number" value={draft.timerPresetMinutes} onChange={(event) => setDraft((prev) => ({ ...prev, timerPresetMinutes: Math.max(1, Math.min(240, Number(event.target.value) || 1)) }))} />
          </SettingRow>
        </section>

        <section className={cn(groupClassName, "tw:pb-3.5")}>
          <div className={cn(rowClassName, "tw:items-start tw:border-b-0")}><strong className={rowTitleClassName}>{t("settings.world.title")}</strong><span className={rowDescriptionClassName}>{t("settings.world.desc")}</span></div>
          <div className="tw:grid tw:grid-cols-2 tw:gap-2.5 tw:px-4 tw:[@container(max-width:520px)]:grid-cols-1 tw:max-[520px]:grid-cols-1">
            {TIMEZONES.filter((item) => item.value).map((item) => {
              const checked = draft.worldTimezones.includes(item.value);
              const disabled = !checked && draft.worldTimezones.length >= 6;

              return (
                <label className={cn("tw:relative tw:flex tw:min-w-0 tw:cursor-pointer tw:items-center tw:gap-2.5 tw:rounded-[14px] tw:border tw:border-[var(--clock-border)] tw:bg-[var(--clock-card-soft)] tw:p-3 tw:text-sm tw:font-[720] tw:text-[var(--clock-fg)]", disabled && "tw:cursor-not-allowed tw:opacity-45")} key={item.value}>
                  <input className="tw:pointer-events-none tw:absolute tw:opacity-0" type="checkbox" checked={checked} disabled={disabled} onChange={(event) => toggleWorldTimezone(item.value, event.target.checked)} />
                  <span className="tw:min-w-0 tw:truncate">{timezoneName(item.value, t, item.city)}</span>
                  <i className={cn("tw:relative tw:ml-auto tw:h-[18px] tw:w-[18px] tw:flex-none tw:rounded-full tw:border-2", checked ? "tw:border-[var(--clock-accent)] tw:bg-[var(--clock-accent)]" : "tw:border-white/25")} aria-hidden="true">
                    {checked && <span className="tw:absolute tw:left-[5px] tw:top-[3px] tw:h-2 tw:w-[5px] tw:rotate-[42deg] tw:border-b-2 tw:border-r-2 tw:border-[var(--clock-active-fg)]" />}
                  </i>
                </label>
              );
            })}
          </div>
        </section>

        <button className="tw:w-full tw:cursor-pointer tw:rounded-2xl tw:border-0 tw:bg-[var(--clock-accent)] tw:px-4 tw:py-[13px] tw:text-[15px] tw:font-[780] tw:text-[var(--clock-active-fg)] tw:disabled:cursor-wait tw:disabled:opacity-60" type="button" disabled={saving} onClick={() => onSave(draft)}>{saving ? t("action.saving") : t("action.save")}</button>
      </main>
    </div>
  );
}

const SettingRow = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <div className={rowClassName}><span className={rowTextClassName}><strong className={rowTitleClassName}>{title}</strong><small className={rowDescriptionClassName}>{description}</small></span>{children}</div>
);

const ToggleRow = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className={rowClassName}>
    <span className={rowTextClassName}><strong className={rowTitleClassName}>{title}</strong><small className={rowDescriptionClassName}>{description}</small></span>
    <input className="tw:pointer-events-none tw:absolute tw:h-px tw:w-px tw:opacity-0" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <i className={cn("tw:relative tw:h-[30px] tw:w-[50px] tw:flex-none tw:rounded-full tw:bg-[var(--clock-card-soft)] tw:transition-colors tw:duration-200", checked && "tw:bg-[var(--clock-accent)]")} aria-hidden="true">
      <span className={cn("tw:absolute tw:left-[3px] tw:top-[3px] tw:h-6 tw:w-6 tw:rounded-full tw:bg-white tw:shadow-[0_2px_8px_rgba(0,0,0,0.35)] tw:transition-transform tw:duration-200", checked && "tw:translate-x-5")} />
    </i>
  </label>
);
