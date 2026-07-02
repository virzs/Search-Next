import { useEffect, useMemo, useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { resources, useWidgetI18n } from "./i18n";
import type { WidgetTranslationFn } from "./i18n";
import type { WidgetProps, WidgetSDK } from "./types";

type CounterColor = "blue" | "green" | "orange" | "purple";
type CounterItem = {
  id: string;
  name: string;
  unit: string;
  value: number;
  target: number;
  color: CounterColor;
  reset: "daily" | "weekly" | "manual";
  reminderTime: string;
  updatedAt: number;
};

const COUNTERS_KEY = "dailyCounterItems";

const createDefaultCounters = (t: WidgetTranslationFn): CounterItem[] => [
  { id: "water", name: t("sample.water.name"), unit: t("sample.water.unit"), value: 5, target: 8, color: "blue", reset: "daily", reminderTime: "14:00", updatedAt: Date.now() },
  { id: "read", name: t("sample.read.name"), unit: t("sample.read.unit"), value: 22, target: 30, color: "green", reset: "daily", reminderTime: "20:30", updatedAt: Date.now() - 1000 },
  { id: "coffee", name: t("sample.coffee.name"), unit: t("sample.coffee.unit"), value: 1, target: 2, color: "orange", reset: "daily", reminderTime: "15:30", updatedAt: Date.now() - 2000 },
];

const safeParse = <T,>(value: unknown, fallback: T): T => {
  try {
    return value ? (typeof value === "string" ? JSON.parse(value) : value) as T : fallback;
  } catch {
    return fallback;
  }
};

const readCounters = async (sdk: WidgetSDK | undefined, defaults: CounterItem[]) => {
  if (sdk?.storage) return safeParse(await sdk.storage.get(COUNTERS_KEY), defaults);
  try {
    return safeParse(localStorage.getItem(`search-next:${COUNTERS_KEY}`), defaults);
  } catch {
    return defaults;
  }
};

const writeCounters = async (sdk: WidgetSDK | undefined, counters: CounterItem[]) => {
  const serialized = JSON.stringify(counters);
  if (sdk?.storage) {
    await sdk.storage.set(COUNTERS_KEY, serialized);
    return;
  }
  try {
    localStorage.setItem(`search-next:${COUNTERS_KEY}`, serialized);
  } catch {
    // In-memory state remains available for this session.
  }
};

const colorValue = (color: CounterColor) => {
  if (color === "green") return "#34c759";
  if (color === "orange") return "#ff9f0a";
  if (color === "purple") return "#af52de";
  return "#007aff";
};

const themeVars = (themeId: string) => ({
  "--daily-bg": themeId === "dark" ? "#000" : "#f5f5f7",
  "--daily-panel": themeId === "dark" ? "#1c1c1e" : "#fff",
  "--daily-soft": themeId === "dark" ? "#2c2c2e" : "#f2f2f7",
  "--daily-fg": themeId === "dark" ? "#f5f5f7" : "#1d1d1f",
  "--daily-muted": themeId === "dark" ? "#a1a1a6" : "#6e6e73",
  "--daily-line": themeId === "dark" ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)",
}) as CSSProperties;

export default function Widget({ mode = "icon", sdk }: WidgetProps) {
  const { t } = useWidgetI18n(sdk, resources);
  const defaultCounters = useMemo(() => createDefaultCounters(t), [t]);
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  const [counters, setCounters] = useState<CounterItem[]>(defaultCounters);
  const [selectedId, setSelectedId] = useState(defaultCounters[0].id);
  const [showReminder, setShowReminder] = useState(false);
  const sizeId = sdk?.sizeId || "2x2";
  const isIcon = mode === "icon" || mode === "appIcon";
  const selected = counters.find((item) => item.id === selectedId) || counters[0];

  useEffect(() => {
    readCounters(sdk, defaultCounters).then((items) => setCounters(Array.isArray(items) && items.length ? items : defaultCounters));
  }, [sdk, defaultCounters]);

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const reminder = useMemo(() => {
    const now = new Date();
    return counters.find((counter) => {
      if (counter.value >= counter.target || !counter.reminderTime) return false;
      const [hour, minute] = counter.reminderTime.split(":").map(Number);
      return now.getHours() === hour && Math.abs(now.getMinutes() - minute) <= 5;
    });
  }, [counters]);

  useEffect(() => {
    setShowReminder(Boolean(reminder));
  }, [reminder?.id]);

  const persist = (next: CounterItem[]) => {
    setCounters(next);
    void writeCounters(sdk, next);
  };
  const changeValue = (id: string, delta: number) => {
    persist(counters.map((counter) => counter.id === id ? { ...counter, value: Math.max(0, counter.value + delta), updatedAt: Date.now() } : counter));
  };
  const updateSelected = (patch: Partial<CounterItem>) => {
    persist(counters.map((counter) => counter.id === selected.id ? { ...counter, ...patch, updatedAt: Date.now() } : counter));
  };
  const addCounter = () => {
    const next: CounterItem = { id: `counter-${Date.now()}`, name: t("counter.new.name"), unit: t("counter.new.unit"), value: 0, target: 10, color: "blue", reset: "daily", reminderTime: "09:00", updatedAt: Date.now() };
    persist([next, ...counters]);
    setSelectedId(next.id);
  };
  const resetToday = () => persist(counters.map((counter) => ({ ...counter, value: 0, updatedAt: Date.now() })));

  return (
    <div className="tw:h-full tw:w-full tw:overflow-hidden tw:bg-[var(--daily-bg)] tw:text-[var(--daily-fg)] tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,system-ui,sans-serif] tw:[container-type:size] tw:[&_*]:box-border" style={themeVars(themeId)}>
      {isIcon ? (
        <IconView counters={counters} defaultCounters={defaultCounters} sizeId={sizeId} onInc={(id) => changeValue(id, 1)} t={t} />
      ) : mode === "settings" ? (
        <EditView counter={selected} onChange={updateSelected} onAdd={addCounter} t={t} />
      ) : showReminder && reminder ? (
        <ReminderView counter={reminder} onInc={() => changeValue(reminder.id, 1)} onDismiss={() => setShowReminder(false)} t={t} />
      ) : (
        <FullView counters={counters} selectedId={selectedId} setSelectedId={setSelectedId} onInc={(id) => changeValue(id, 1)} onDec={(id) => changeValue(id, -1)} onAdd={addCounter} onReset={resetToday} t={t} />
      )}
    </div>
  );
}

function IconView({ counters, defaultCounters, sizeId, onInc, t }: { counters: CounterItem[]; defaultCounters: CounterItem[]; sizeId: string; onInc: (id: string) => void; t: WidgetTranslationFn }) {
  const primary = counters[0] || defaultCounters[0];
  if (sizeId === "1x1") return <div className="tw:flex tw:h-full tw:w-full tw:flex-col tw:justify-between tw:rounded-[15px] tw:border tw:border-[var(--daily-line)] tw:bg-[var(--daily-panel)] tw:p-2"><b className="tw:text-sm">{primary.name}</b><strong className="tw:text-lg" style={{ color: colorValue(primary.color) }}>{primary.value}/{primary.target}</strong></div>;
  if (sizeId === "2x1") return <div className="tw:flex tw:h-full tw:w-full tw:items-center tw:justify-between tw:gap-3 tw:rounded-2xl tw:border tw:border-[var(--daily-line)] tw:bg-[var(--daily-panel)] tw:p-3"><CounterText counter={primary} t={t} /><button className="tw:h-9 tw:w-9 tw:rounded-full tw:border-0 tw:bg-[#007aff] tw:text-lg tw:font-bold tw:text-white" type="button" onClick={() => onInc(primary.id)}>+</button></div>;
  if (sizeId === "4x2") return <div className="tw:grid tw:h-full tw:w-full tw:grid-cols-3 tw:gap-2.5 tw:rounded-[20px] tw:border tw:border-[var(--daily-line)] tw:bg-[var(--daily-panel)] tw:p-3">{counters.slice(0, 3).map((counter) => <CounterCard key={counter.id} counter={counter} onInc={() => onInc(counter.id)} t={t} />)}</div>;
  return <div className="tw:flex tw:h-full tw:w-full tw:flex-col tw:gap-3 tw:rounded-[20px] tw:border tw:border-[var(--daily-line)] tw:bg-[var(--daily-panel)] tw:p-3"><ProgressRing counter={primary} t={t} /><button className="tw:rounded-full tw:border-0 tw:bg-[#007aff] tw:px-3 tw:py-2 tw:text-sm tw:font-bold tw:text-white" type="button" onClick={() => onInc(primary.id)}>+1 {primary.unit}</button></div>;
}

function FullView({ counters, selectedId, setSelectedId, onInc, onDec, onAdd, onReset, t }: { counters: CounterItem[]; selectedId: string; setSelectedId: (id: string) => void; onInc: (id: string) => void; onDec: (id: string) => void; onAdd: () => void; onReset: () => void; t: WidgetTranslationFn }) {
  return (
    <div className="tw:h-full tw:overflow-auto tw:p-6">
      <div className="tw:mb-4 tw:flex tw:items-center tw:justify-between tw:gap-3"><div><span className="tw:text-sm tw:font-bold tw:text-[#007aff]">{t("app.name")}</span><h1 className="tw:m-0 tw:text-[34px] tw:font-[780]">{t("title")}</h1></div><div className="tw:flex tw:gap-2"><button className="tw:rounded-full tw:border-0 tw:bg-[var(--daily-soft)] tw:px-4 tw:py-2 tw:text-sm tw:font-bold tw:text-[var(--daily-fg)]" onClick={onReset} type="button">{t("action.reset")}</button><button className="tw:rounded-full tw:border-0 tw:bg-[#007aff] tw:px-4 tw:py-2 tw:text-sm tw:font-bold tw:text-white" onClick={onAdd} type="button">{t("action.add")}</button></div></div>
      <div className="tw:grid tw:grid-cols-3 tw:gap-3 tw:[@container(max-width:760px)]:grid-cols-1">
        {counters.map((counter) => <CounterPanel key={counter.id} counter={counter} active={counter.id === selectedId} onSelect={() => setSelectedId(counter.id)} onInc={() => onInc(counter.id)} onDec={() => onDec(counter.id)} t={t} />)}
      </div>
    </div>
  );
}

function EditView({ counter, onChange, onAdd, t }: { counter: CounterItem; onChange: (patch: Partial<CounterItem>) => void; onAdd: () => void; t: WidgetTranslationFn }) {
  return (
    <div className="tw:h-full tw:overflow-auto tw:p-6">
      <div className="tw:mx-auto tw:flex tw:max-w-[620px] tw:flex-col tw:gap-3 tw:rounded-3xl tw:border tw:border-[var(--daily-line)] tw:bg-[var(--daily-panel)] tw:p-5">
        <div className="tw:flex tw:items-center tw:justify-between"><h1 className="tw:m-0 tw:text-[30px] tw:font-[780]">{t("settings.title")}</h1><button className="tw:rounded-full tw:border-0 tw:bg-[#007aff] tw:px-4 tw:py-2 tw:text-sm tw:font-bold tw:text-white" type="button" onClick={onAdd}>{t("action.add")}</button></div>
        <Field label={t("field.name")}><input value={counter.name} onChange={(event) => onChange({ name: event.target.value })} /></Field>
        <Field label={t("field.unit")}><input value={counter.unit} onChange={(event) => onChange({ unit: event.target.value })} /></Field>
        <Field label={t("field.target")}><input type="number" min={1} value={counter.target} onChange={(event) => onChange({ target: Math.max(1, Number(event.target.value) || 1) })} /></Field>
        <Field label={t("field.reminder")}><input type="time" value={counter.reminderTime} onChange={(event) => onChange({ reminderTime: event.target.value })} /></Field>
        <Field label={t("field.color")}><select value={counter.color} onChange={(event) => onChange({ color: event.target.value as CounterColor })}><option value="blue">{t("color.blue")}</option><option value="green">{t("color.green")}</option><option value="orange">{t("color.orange")}</option><option value="purple">{t("color.purple")}</option></select></Field>
      </div>
    </div>
  );
}

function ReminderView({ counter, onInc, onDismiss, t }: { counter: CounterItem; onInc: () => void; onDismiss: () => void; t: WidgetTranslationFn }) {
  return <div className="tw:grid tw:h-full tw:place-items-center tw:p-6"><div className="tw:max-w-[560px] tw:rounded-3xl tw:border tw:border-[var(--daily-line)] tw:bg-[var(--daily-panel)] tw:p-6 tw:text-center"><ProgressRing counter={counter} t={t} /><h1 className="tw:m-0 tw:mt-4 tw:text-[30px] tw:font-[780]">{t("reminder.title")}</h1><p className="tw:text-sm tw:font-semibold tw:text-[var(--daily-muted)]">{t("reminder.message", { name: counter.name, count: Math.max(0, counter.target - counter.value), unit: counter.unit })}</p><div className="tw:flex tw:justify-center tw:gap-3"><button className="tw:rounded-full tw:border-0 tw:bg-[#007aff] tw:px-4 tw:py-2 tw:text-sm tw:font-bold tw:text-white" onClick={onInc} type="button">+1 {counter.unit}</button><button className="tw:rounded-full tw:border-0 tw:bg-[var(--daily-soft)] tw:px-4 tw:py-2 tw:text-sm tw:font-bold tw:text-[var(--daily-fg)]" onClick={onDismiss} type="button">{t("action.later")}</button></div></div></div>;
}

function CounterPanel({ counter, active, onSelect, onInc, onDec, t }: { counter: CounterItem; active: boolean; onSelect: () => void; onInc: () => void; onDec: () => void; t: WidgetTranslationFn }) {
  return <div className="tw:flex tw:min-h-[188px] tw:min-w-0 tw:flex-col tw:gap-3 tw:rounded-3xl tw:border tw:bg-[var(--daily-panel)] tw:p-4 tw:text-[var(--daily-fg)]" style={{ borderColor: active ? colorValue(counter.color) : "var(--daily-line)" }} onClick={onSelect}><CounterText counter={counter} t={t} /><ProgressBar counter={counter} /><div className="tw:mt-auto tw:flex tw:gap-2"><MiniButton onClick={(event) => { event.stopPropagation(); onDec(); }}>-1</MiniButton><MiniButton primary onClick={(event) => { event.stopPropagation(); onInc(); }}>+1 {counter.unit}</MiniButton></div></div>;
}

function CounterCard({ counter, onInc, t }: { counter: CounterItem; onInc: () => void; t: WidgetTranslationFn }) {
  return <div className="tw:flex tw:min-w-0 tw:flex-col tw:gap-2 tw:rounded-[18px] tw:bg-[var(--daily-soft)] tw:p-3"><CounterText counter={counter} compact t={t} /><ProgressBar counter={counter} /><button className="tw:mt-auto tw:rounded-full tw:border-0 tw:bg-[#007aff] tw:py-1.5 tw:text-xs tw:font-bold tw:text-white" type="button" onClick={onInc}>+1</button></div>;
}

function CounterText({ counter, compact = false, t }: { counter: CounterItem; compact?: boolean; t: WidgetTranslationFn }) {
  return <div className="tw:min-w-0"><b className="tw:block tw:truncate tw:text-sm">{counter.name}</b><strong className={compact ? "tw:text-xl" : "tw:text-[34px]"} style={{ color: colorValue(counter.color) }}>{counter.value}/{counter.target}</strong><span className="tw:block tw:truncate tw:text-xs tw:font-semibold tw:text-[var(--daily-muted)]">{t("unit.reminder", { unit: counter.unit, time: counter.reminderTime })}</span></div>;
}

function ProgressRing({ counter, t }: { counter: CounterItem; t: WidgetTranslationFn }) {
  const pct = Math.min(1, counter.value / counter.target);
  return <div className="tw:mx-auto tw:grid tw:aspect-square tw:w-[120px] tw:place-items-center tw:rounded-full" style={{ background: `conic-gradient(${colorValue(counter.color)} ${pct * 360}deg, var(--daily-soft) 0)` }}><div className="tw:grid tw:aspect-square tw:w-[86px] tw:place-items-center tw:rounded-full tw:bg-[var(--daily-panel)] tw:text-center"><CounterText counter={counter} compact t={t} /></div></div>;
}

function ProgressBar({ counter }: { counter: CounterItem }) {
  return <div className="tw:h-2 tw:overflow-hidden tw:rounded-full tw:bg-[var(--daily-soft)]"><span className="tw:block tw:h-full tw:rounded-full" style={{ width: `${Math.min(100, (counter.value / counter.target) * 100)}%`, background: colorValue(counter.color) }} /></div>;
}

function MiniButton({ primary, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return <button {...props} className={`tw:flex-1 tw:rounded-full tw:border-0 tw:px-3 tw:py-2 tw:text-sm tw:font-bold ${primary ? "tw:bg-[#007aff] tw:text-white" : "tw:bg-[var(--daily-soft)] tw:text-[var(--daily-fg)]"}`} type="button" />;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="tw:flex tw:items-center tw:justify-between tw:gap-4 tw:rounded-2xl tw:bg-[var(--daily-soft)] tw:p-3 tw:text-sm tw:font-bold tw:[&_input]:rounded-xl tw:[&_input]:border-0 tw:[&_input]:bg-[var(--daily-panel)] tw:[&_input]:px-3 tw:[&_input]:py-2 tw:[&_input]:text-[var(--daily-fg)] tw:[&_select]:rounded-xl tw:[&_select]:border-0 tw:[&_select]:bg-[var(--daily-panel)] tw:[&_select]:px-3 tw:[&_select]:py-2 tw:[&_select]:text-[var(--daily-fg)]"><span>{label}</span>{children}</label>;
}
