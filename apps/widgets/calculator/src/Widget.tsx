import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { resources, useWidgetI18n } from "./i18n";
import type { WidgetTranslationFn } from "./i18n";
import type { WidgetProps, WidgetSDK } from "./types";

type Operator = "+" | "-" | "×" | "÷" | null;
type HistoryItem = { expression: string; result: string };

const HISTORY_KEY = "calculatorHistory";

const safeParse = <T,>(value: unknown, fallback: T): T => {
  try {
    return value ? (typeof value === "string" ? JSON.parse(value) : value) as T : fallback;
  } catch {
    return fallback;
  }
};

const readHistory = async (sdk?: WidgetSDK): Promise<HistoryItem[]> => {
  if (sdk?.storage) return safeParse(await sdk.storage.get(HISTORY_KEY), []);
  try {
    return safeParse(localStorage.getItem(`search-next:${HISTORY_KEY}`), []);
  } catch {
    return [];
  }
};

const writeHistory = async (sdk: WidgetSDK | undefined, history: HistoryItem[]) => {
  const serialized = JSON.stringify(history.slice(0, 8));
  if (sdk?.storage) {
    await sdk.storage.set(HISTORY_KEY, serialized);
    return;
  }
  try {
    localStorage.setItem(`search-next:${HISTORY_KEY}`, serialized);
  } catch {
    // Current session state is enough when storage is unavailable.
  }
};

const themeVars = (themeId: string) => ({
  "--calc-bg": themeId === "dark" ? "#000" : "#f5f5f7",
  "--calc-panel": themeId === "dark" ? "#1c1c1e" : "#fff",
  "--calc-soft": themeId === "dark" ? "#2c2c2e" : "#f2f2f7",
  "--calc-fg": themeId === "dark" ? "#f5f5f7" : "#1d1d1f",
  "--calc-muted": themeId === "dark" ? "#a1a1a6" : "#6e6e73",
  "--calc-line": themeId === "dark" ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)",
  "--calc-orange": "#ff9f0a",
}) as CSSProperties;

const compute = (left: number, right: number, op: Operator) => {
  if (op === "+") return left + right;
  if (op === "-") return left - right;
  if (op === "×") return left * right;
  if (op === "÷") return right === 0 ? NaN : left / right;
  return right;
};

const formatNumber = (value: number, t: WidgetTranslationFn) => {
  if (!Number.isFinite(value)) return t("calc.error");
  const fixed = Number(value.toPrecision(12));
  return String(fixed).length > 14 ? fixed.toExponential(6) : String(fixed);
};

export default function Widget({ mode = "icon", sdk }: WidgetProps) {
  const { t } = useWidgetI18n(sdk, resources);
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waiting, setWaiting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const isIcon = mode === "icon" || mode === "appIcon";
  const sizeId = sdk?.sizeId || "2x2";

  useEffect(() => {
    readHistory(sdk).then(setHistory);
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const pushHistory = (item: HistoryItem) => {
    const next = [item, ...history].slice(0, 8);
    setHistory(next);
    void writeHistory(sdk, next);
  };
  const inputDigit = (digit: string) => {
    setDisplay((current) => waiting || current === "0" || current === t("calc.error") ? digit : `${current}${digit}`);
    setWaiting(false);
  };
  const inputDot = () => {
    setDisplay((current) => waiting ? "0." : current.includes(".") ? current : `${current}.`);
    setWaiting(false);
  };
  const clear = () => {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setWaiting(false);
  };
  const backspace = () => setDisplay((current) => current.length <= 1 || current === t("calc.error") ? "0" : current.slice(0, -1));
  const toggleSign = () => setDisplay((current) => current === "0" || current === t("calc.error") ? current : current.startsWith("-") ? current.slice(1) : `-${current}`);
  const percent = () => setDisplay((current) => formatNumber(Number(current) / 100, t));
  const chooseOperator = (nextOperator: Operator) => {
    const value = Number(display);
    if (stored !== null && operator && !waiting) {
      const result = compute(stored, value, operator);
      setDisplay(formatNumber(result, t));
      setStored(result);
    } else {
      setStored(value);
    }
    setOperator(nextOperator);
    setWaiting(true);
  };
  const equals = () => {
    if (stored === null || !operator) return;
    const right = Number(display);
    const result = compute(stored, right, operator);
    const formatted = formatNumber(result, t);
    pushHistory({ expression: `${formatNumber(stored, t)} ${operator} ${formatNumber(right, t)}`, result: formatted });
    setDisplay(formatted);
    setStored(null);
    setOperator(null);
    setWaiting(true);
  };
  const press = (key: string) => {
    if (/^\d$/.test(key)) inputDigit(key);
    else if (key === ".") inputDot();
    else if (key === "AC") clear();
    else if (key === "⌫") backspace();
    else if (key === "±") toggleSign();
    else if (key === "%") percent();
    else if (key === "=") equals();
    else chooseOperator(key as Operator);
  };

  return (
    <div className="tw:h-full tw:w-full tw:overflow-hidden tw:bg-[var(--calc-bg)] tw:text-[var(--calc-fg)] tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,system-ui,sans-serif] tw:[container-type:size] tw:[&_*]:box-border" style={themeVars(themeId)}>
      {isIcon ? <IconView display={display} sizeId={sizeId} press={press} t={t} /> : <FullView display={display} history={history} press={press} t={t} />}
    </div>
  );
}

const keys = ["AC", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "⌫", "="];

function IconView({ display, sizeId, press, t }: { display: string; sizeId: string; press: (key: string) => void; t: WidgetTranslationFn }) {
  if (sizeId === "1x1") return <div className="tw:flex tw:h-full tw:w-full tw:items-end tw:justify-end tw:rounded-[15px] tw:border tw:border-[var(--calc-line)] tw:bg-[var(--calc-panel)] tw:p-2"><b className="tw:max-w-full tw:truncate tw:text-[20px]">{display}</b></div>;
  if (sizeId === "2x1") return <div className="tw:flex tw:h-full tw:w-full tw:flex-col tw:justify-center tw:rounded-2xl tw:border tw:border-[var(--calc-line)] tw:bg-[var(--calc-panel)] tw:p-3"><span className="tw:text-xs tw:font-bold tw:text-[var(--calc-muted)]">{t("calc.recent")}</span><b className="tw:truncate tw:text-[30px]">{display}</b></div>;
  if (sizeId === "4x2") return <div className="tw:grid tw:h-full tw:w-full tw:grid-cols-[1fr_190px] tw:gap-2.5 tw:rounded-[20px] tw:border tw:border-[var(--calc-line)] tw:bg-[var(--calc-panel)] tw:p-3"><Display value={display} /><MiniKeypad press={press} /></div>;
  return <div className="tw:flex tw:h-full tw:w-full tw:flex-col tw:gap-2 tw:rounded-[20px] tw:border tw:border-[var(--calc-line)] tw:bg-[var(--calc-panel)] tw:p-3"><Display value={display} compact /><div className="tw:grid tw:grid-cols-4 tw:gap-1.5">{["AC", "7", "8", "+"].map((key) => <CalcKey key={key} label={key} onClick={() => press(key)} small />)}</div></div>;
}

function FullView({ display, history, press, t }: { display: string; history: HistoryItem[]; press: (key: string) => void; t: WidgetTranslationFn }) {
  return (
    <div className="tw:grid tw:h-full tw:grid-cols-[minmax(320px,440px)_minmax(220px,1fr)] tw:gap-4 tw:overflow-auto tw:p-6 tw:[@container(max-width:760px)]:grid-cols-1">
      <section className="tw:flex tw:flex-col tw:gap-3 tw:rounded-3xl tw:border tw:border-[var(--calc-line)] tw:bg-[var(--calc-panel)] tw:p-4">
        <span className="tw:text-sm tw:font-bold tw:text-[var(--calc-muted)]">{t("calc.basic")}</span>
        <Display value={display} />
        <div className="tw:grid tw:grid-cols-4 tw:gap-2.5">{keys.map((key) => <CalcKey key={key} label={key} onClick={() => press(key)} wide={key === "0"} />)}</div>
      </section>
      <aside className="tw:rounded-3xl tw:border tw:border-[var(--calc-line)] tw:bg-[var(--calc-panel)] tw:p-4">
        <h2 className="tw:m-0 tw:mb-3 tw:text-base tw:font-[780]">{t("calc.history")}</h2>
        <div className="tw:flex tw:flex-col tw:gap-2">
          {(history.length ? history : [{ expression: t("calc.noHistory"), result: t("calc.start") }]).map((item, index) => <div className="tw:rounded-2xl tw:bg-[var(--calc-soft)] tw:p-3" key={`${item.expression}-${index}`}><span className="tw:block tw:truncate tw:text-xs tw:font-bold tw:text-[var(--calc-muted)]">{item.expression}</span><b className="tw:block tw:truncate tw:text-xl">{item.result}</b></div>)}
        </div>
      </aside>
    </div>
  );
}

function MiniKeypad({ press }: { press: (key: string) => void }) {
  return <div className="tw:grid tw:grid-cols-4 tw:gap-1.5">{["AC", "7", "8", "÷", "4", "5", "6", "×"].map((key) => <CalcKey key={key} label={key} onClick={() => press(key)} small />)}</div>;
}

function Display({ value, compact = false }: { value: string; compact?: boolean }) {
  return <div className="tw:flex tw:min-w-0 tw:flex-1 tw:items-end tw:justify-end tw:rounded-2xl tw:bg-[var(--calc-soft)] tw:p-3"><strong className={`tw:max-w-full tw:truncate tw:text-right tw:font-[780] tw:leading-none ${compact ? "tw:text-[34px]" : "tw:text-[64px] tw:[@container(max-width:620px)]:text-[44px]"}`}>{value}</strong></div>;
}

function CalcKey({ label, onClick, small = false, wide = false }: { label: string; onClick: () => void; small?: boolean; wide?: boolean }) {
  const op = ["÷", "×", "-", "+", "="].includes(label);
  const fn = ["AC", "±", "%", "⌫"].includes(label);
  return <button className={`tw:cursor-pointer tw:border-0 tw:font-[760] ${wide ? "tw:col-span-1" : ""} ${small ? "tw:h-8 tw:rounded-[10px] tw:text-sm" : "tw:h-14 tw:rounded-[18px] tw:text-xl"} ${op ? "tw:bg-[var(--calc-orange)] tw:text-[#1d1d1f]" : fn ? "tw:bg-[var(--calc-soft)] tw:text-[#007aff]" : "tw:bg-[var(--calc-soft)] tw:text-[var(--calc-fg)]"}`} type="button" onClick={onClick}>{label}</button>;
}
