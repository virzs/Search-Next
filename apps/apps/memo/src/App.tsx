import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { resources, useAppI18n } from "./i18n";
import type { AppTranslationFn } from "./i18n";
import type { AppProps, AppSDK } from "./types";

type MemoColor = "yellow" | "white" | "blue" | "green";
type MemoItem = {
  id: string;
  title: string;
  body: string;
  color: MemoColor;
  pinned: boolean;
  checklist: string[];
  updatedAt: number;
};
type MemoSettings = {
  defaultColor: MemoColor;
  sortMode: "updated" | "title";
  showChecklist: boolean;
};

const MEMOS_KEY = "memoItems";
const SETTINGS_KEY = "memoSettings";
const DEFAULT_SETTINGS: MemoSettings = { defaultColor: "yellow", sortMode: "updated", showChecklist: true };

const createSampleMemos = (t: AppTranslationFn): MemoItem[] => [
  { id: "memo-1", title: t("sample.1.title"), body: t("sample.1.body"), color: "yellow", pinned: true, checklist: [t("sample.1.check.1"), t("sample.1.check.2"), t("sample.1.check.3")], updatedAt: Date.now() - 60000 },
  { id: "memo-2", title: t("sample.2.title"), body: t("sample.2.body"), color: "white", pinned: false, checklist: [t("sample.2.check.1"), t("sample.2.check.2"), t("sample.2.check.3")], updatedAt: Date.now() - 3600000 },
  { id: "memo-3", title: t("sample.3.title"), body: t("sample.3.body"), color: "blue", pinned: false, checklist: [], updatedAt: Date.now() - 86400000 },
];

const safeParse = <T,>(value: unknown, fallback: T): T => {
  if (!value) return fallback;
  try {
    return (typeof value === "string" ? JSON.parse(value) : value) as T;
  } catch {
    return fallback;
  }
};

const readValue = async <T,>(sdk: AppSDK | undefined, key: string, fallback: T): Promise<T> => {
  if (sdk?.storage) return safeParse(await sdk.storage.get(key), fallback);
  try {
    return safeParse(localStorage.getItem(`search-next:${key}`), fallback);
  } catch {
    return fallback;
  }
};

const writeValue = async (sdk: AppSDK | undefined, key: string, value: unknown) => {
  const serialized = JSON.stringify(value);
  if (sdk?.storage) {
    await sdk.storage.set(key, serialized);
    return;
  }
  try {
    localStorage.setItem(`search-next:${key}`, serialized);
  } catch {
    // Session-only fallback is the in-memory React state.
  }
};

const themeVars = (themeId: string) => ({
  "--memo-bg": themeId === "dark" ? "#000000" : "#f5f5f7",
  "--memo-panel": themeId === "dark" ? "#1c1c1e" : "#ffffff",
  "--memo-soft": themeId === "dark" ? "#2c2c2e" : "#f2f2f7",
  "--memo-fg": themeId === "dark" ? "#f5f5f7" : "#1d1d1f",
  "--memo-muted": themeId === "dark" ? "#a1a1a6" : "#6e6e73",
  "--memo-line": themeId === "dark" ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)",
  "--memo-yellow": themeId === "dark" ? "#3a3216" : "#fff8cc",
  "--memo-blue": themeId === "dark" ? "#12324a" : "#dff2ff",
  "--memo-green": themeId === "dark" ? "#16351f" : "#e5f8e9",
}) as CSSProperties;

const noteBg = (color: MemoColor) => {
  if (color === "blue") return "var(--memo-blue)";
  if (color === "green") return "var(--memo-green)";
  if (color === "white") return "var(--memo-panel)";
  return "var(--memo-yellow)";
};

export default function App({ mode = "icon", sdk }: AppProps) {
  const { t } = useAppI18n(sdk, resources);
  const sampleMemos = useMemo(() => createSampleMemos(t), [t]);
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");
  const [memos, setMemos] = useState<MemoItem[]>(sampleMemos);
  const [settings, setSettings] = useState<MemoSettings>(DEFAULT_SETTINGS);
  const [selectedId, setSelectedId] = useState(sampleMemos[0]?.id);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([readValue(sdk, MEMOS_KEY, sampleMemos), readValue(sdk, SETTINGS_KEY, DEFAULT_SETTINGS)]).then(([nextMemos, nextSettings]) => {
      setMemos(Array.isArray(nextMemos) && nextMemos.length ? nextMemos : sampleMemos);
      setSettings({ ...DEFAULT_SETTINGS, ...nextSettings });
      setSelectedId((Array.isArray(nextMemos) && nextMemos[0]?.id) || sampleMemos[0].id);
    });
  }, [sdk, sampleMemos]);

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const sortedMemos = useMemo(() => {
    const filtered = memos.filter((memo) => `${memo.title} ${memo.body}`.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (settings.sortMode === "title") return a.title.localeCompare(b.title);
      return b.updatedAt - a.updatedAt;
    });
  }, [memos, query, settings.sortMode]);
  const selected = memos.find((memo) => memo.id === selectedId) || sortedMemos[0] || memos[0];
  const isIcon = mode === "icon" || mode === "appIcon";
  const sizeId = sdk?.sizeId || "2x2";

  const persistMemos = (next: MemoItem[]) => {
    setMemos(next);
    void writeValue(sdk, MEMOS_KEY, next);
  };
  const persistSettings = (next: MemoSettings) => {
    setSettings(next);
    void writeValue(sdk, SETTINGS_KEY, next);
  };
  const updateSelected = (patch: Partial<MemoItem>) => {
    if (!selected) return;
    persistMemos(memos.map((memo) => memo.id === selected.id ? { ...memo, ...patch, updatedAt: Date.now() } : memo));
  };
  const addMemo = () => {
    const next: MemoItem = { id: `memo-${Date.now()}`, title: t("memo.new"), body: "", color: settings.defaultColor, pinned: false, checklist: [], updatedAt: Date.now() };
    persistMemos([next, ...memos]);
    setSelectedId(next.id);
  };
  const removeSelected = () => {
    if (!selected) return;
    const next = memos.filter((memo) => memo.id !== selected.id);
    persistMemos(next);
    setSelectedId(next[0]?.id);
  };

  return (
    <div className="tw:h-full tw:w-full tw:overflow-hidden tw:bg-[var(--memo-bg)] tw:text-[var(--memo-fg)] tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,system-ui,sans-serif] tw:[container-type:size] tw:[&_*]:box-border" style={themeVars(themeId)}>
      {isIcon ? (
        <IconView memos={sortedMemos} sizeId={sizeId} settings={settings} sampleMemos={sampleMemos} t={t} />
      ) : mode === "settings" ? (
        <SettingsView settings={settings} onChange={persistSettings} t={t} />
      ) : (
        <FullView memos={sortedMemos} selected={selected} query={query} setQuery={setQuery} setSelectedId={setSelectedId} onAdd={addMemo} onDelete={removeSelected} onUpdate={updateSelected} settings={settings} t={t} />
      )}
    </div>
  );
}

function IconView({ memos, sizeId, settings, sampleMemos, t }: { memos: MemoItem[]; sizeId: string; settings: MemoSettings; sampleMemos: MemoItem[]; t: AppTranslationFn }) {
  const primary = memos[0] || sampleMemos[0];
  if (sizeId === "1x1") {
    return <div className="tw:flex tw:h-full tw:w-full tw:flex-col tw:justify-between tw:rounded-[15px] tw:border tw:border-[var(--memo-line)] tw:bg-[var(--memo-yellow)] tw:p-2 tw:text-[#1d1d1f]"><b className="tw:text-xl">{t("icon.char")}</b><span className="tw:text-[11px] tw:font-bold">{t("note.count", { count: memos.length })}</span></div>;
  }
  if (sizeId === "2x1") {
    return <div className="tw:flex tw:h-full tw:w-full tw:flex-col tw:justify-center tw:rounded-2xl tw:border tw:border-[var(--memo-line)] tw:p-3" style={{ background: noteBg(primary.color) }}><b className="tw:truncate tw:text-sm">{primary.title}</b><span className="tw:mt-1 tw:truncate tw:text-[11px] tw:font-semibold tw:text-[var(--memo-muted)]">{primary.body || primary.checklist.join(t("delimiter.list"))}</span></div>;
  }
  if (sizeId === "4x2") {
    return <div className="tw:grid tw:h-full tw:w-full tw:grid-cols-[1fr_1fr] tw:gap-2.5 tw:rounded-[20px] tw:border tw:border-[var(--memo-line)] tw:bg-[var(--memo-panel)] tw:p-3"><NoteCard memo={primary} /><div className="tw:flex tw:min-w-0 tw:flex-col tw:gap-2">{memos.slice(1, 4).map((memo) => <MemoRow key={memo.id} memo={memo} t={t} />)}</div></div>;
  }
  return <div className="tw:flex tw:h-full tw:w-full tw:flex-col tw:gap-2 tw:rounded-[20px] tw:border tw:border-[var(--memo-line)] tw:bg-[var(--memo-panel)] tw:p-3"><NoteCard memo={primary} />{settings.showChecklist && primary.checklist.slice(0, 2).map((item) => <span className="tw:truncate tw:text-[11px] tw:font-semibold tw:text-[var(--memo-muted)]" key={item}>○ {item}</span>)}</div>;
}

function FullView({ memos, selected, query, setQuery, setSelectedId, onAdd, onDelete, onUpdate, settings, t }: { memos: MemoItem[]; selected?: MemoItem; query: string; setQuery: (value: string) => void; setSelectedId: (id: string) => void; onAdd: () => void; onDelete: () => void; onUpdate: (patch: Partial<MemoItem>) => void; settings: MemoSettings; t: AppTranslationFn }) {
  return (
    <div className="tw:grid tw:h-full tw:grid-cols-[290px_minmax(0,1fr)] tw:overflow-hidden tw:rounded-[18px] tw:bg-[var(--memo-bg)] tw:[@container(max-width:700px)]:grid-cols-1">
      <aside className="tw:flex tw:min-w-0 tw:flex-col tw:gap-3 tw:border-r tw:border-[var(--memo-line)] tw:bg-[var(--memo-soft)] tw:p-4 tw:[@container(max-width:700px)]:hidden">
        <div className="tw:flex tw:items-center tw:justify-between"><h1 className="tw:m-0 tw:text-[28px] tw:font-[780]">{t("title")}</h1><button className="tw:rounded-full tw:border-0 tw:bg-[#007aff] tw:px-3 tw:py-2 tw:text-xs tw:font-bold tw:text-white" type="button" onClick={onAdd}>{t("action.add")}</button></div>
        <input className="tw:w-full tw:rounded-xl tw:border tw:border-[var(--memo-line)] tw:bg-[var(--memo-panel)] tw:px-3 tw:py-2 tw:text-sm tw:font-semibold tw:text-[var(--memo-fg)] tw:outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("placeholder.search")} />
        <div className="tw:flex tw:min-h-0 tw:flex-col tw:gap-2 tw:overflow-auto">
          {memos.map((memo) => <button className="tw:min-w-0 tw:cursor-pointer tw:rounded-[14px] tw:border-0 tw:bg-[var(--memo-panel)] tw:p-3 tw:text-left tw:text-[var(--memo-fg)]" key={memo.id} type="button" onClick={() => setSelectedId(memo.id)}><MemoRow memo={memo} t={t} /></button>)}
        </div>
      </aside>
      <section className="tw:flex tw:min-w-0 tw:flex-col tw:gap-3 tw:p-5">
        {selected ? (
          <>
            <div className="tw:flex tw:items-center tw:gap-2"><input className="tw:min-w-0 tw:flex-1 tw:border-0 tw:bg-transparent tw:text-[30px] tw:font-[780] tw:text-[var(--memo-fg)] tw:outline-none" value={selected.title} onChange={(event) => onUpdate({ title: event.target.value })} /><button className="tw:rounded-full tw:border-0 tw:bg-[var(--memo-soft)] tw:px-3 tw:py-2 tw:text-xs tw:font-bold tw:text-[var(--memo-fg)]" type="button" onClick={() => onUpdate({ pinned: !selected.pinned })}>{selected.pinned ? t("action.unpin") : t("action.pin")}</button><button className="tw:rounded-full tw:border-0 tw:bg-[var(--memo-soft)] tw:px-3 tw:py-2 tw:text-xs tw:font-bold tw:text-[var(--memo-fg)]" type="button" onClick={onDelete}>{t("action.delete")}</button></div>
            <textarea className="tw:min-h-[260px] tw:flex-1 tw:resize-none tw:rounded-[20px] tw:border tw:border-[var(--memo-line)] tw:p-4 tw:text-[16px] tw:font-medium tw:leading-6 tw:text-[var(--memo-fg)] tw:outline-none" style={{ background: noteBg(selected.color) }} value={selected.body} onChange={(event) => onUpdate({ body: event.target.value })} />
            {settings.showChecklist && <input className="tw:rounded-xl tw:border tw:border-[var(--memo-line)] tw:bg-[var(--memo-panel)] tw:px-3 tw:py-2 tw:text-sm tw:text-[var(--memo-fg)] tw:outline-none" value={selected.checklist.join(t("delimiter.list"))} onChange={(event) => onUpdate({ checklist: event.target.value.split(/[，,]/).map((item) => item.trim()).filter(Boolean) })} placeholder={t("placeholder.checklist")} />}
          </>
        ) : <div className="tw:m-auto tw:text-sm tw:font-bold tw:text-[var(--memo-muted)]">{t("empty.noMemo")}</div>}
      </section>
    </div>
  );
}

function SettingsView({ settings, onChange, t }: { settings: MemoSettings; onChange: (settings: MemoSettings) => void; t: AppTranslationFn }) {
  return (
    <div className="tw:h-full tw:overflow-auto tw:p-6">
      <h1 className="tw:m-0 tw:mb-4 tw:text-[30px] tw:font-[780]">{t("settings.title")}</h1>
      <div className="tw:overflow-hidden tw:rounded-3xl tw:border tw:border-[var(--memo-line)] tw:bg-[var(--memo-panel)]">
        <SettingRow label={t("settings.color")}><select value={settings.defaultColor} onChange={(event) => onChange({ ...settings, defaultColor: event.target.value as MemoColor })}><option value="yellow">{t("color.yellow")}</option><option value="white">{t("color.white")}</option><option value="blue">{t("color.blue")}</option><option value="green">{t("color.green")}</option></select></SettingRow>
        <SettingRow label={t("settings.sort")}><select value={settings.sortMode} onChange={(event) => onChange({ ...settings, sortMode: event.target.value as MemoSettings["sortMode"] })}><option value="updated">{t("sort.updated")}</option><option value="title">{t("sort.title")}</option></select></SettingRow>
        <SettingRow label={t("settings.showList")}><input type="checkbox" checked={settings.showChecklist} onChange={(event) => onChange({ ...settings, showChecklist: event.target.checked })} /></SettingRow>
      </div>
    </div>
  );
}

function NoteCard({ memo }: { memo: MemoItem }) {
  return <div className="tw:min-h-0 tw:overflow-hidden tw:rounded-[18px] tw:p-3 tw:text-[#1d1d1f]" style={{ background: noteBg(memo.color) }}><b className="tw:block tw:truncate tw:text-sm">{memo.pinned ? "● " : ""}{memo.title}</b><p className="tw:m-0 tw:mt-2 tw:line-clamp-3 tw:text-[12px] tw:font-semibold tw:leading-4 tw:text-[#3a3a3c]">{memo.body}</p></div>;
}

function MemoRow({ memo, t }: { memo: MemoItem; t: AppTranslationFn }) {
  return <div className="tw:min-w-0"><b className="tw:block tw:truncate tw:text-sm">{memo.pinned ? "● " : ""}{memo.title}</b><span className="tw:mt-1 tw:block tw:truncate tw:text-[11px] tw:font-semibold tw:text-[var(--memo-muted)]">{memo.body || memo.checklist.join(t("delimiter.list"))}</span></div>;
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return <label className="tw:flex tw:min-h-14 tw:items-center tw:justify-between tw:gap-4 tw:border-b tw:border-[var(--memo-line)] tw:px-4 tw:py-3 tw:last:border-b-0"><span className="tw:text-sm tw:font-bold">{label}</span><span className="tw:[&_select]:rounded-xl tw:[&_select]:border tw:[&_select]:border-[var(--memo-line)] tw:[&_select]:bg-[var(--memo-soft)] tw:[&_select]:px-3 tw:[&_select]:py-2 tw:[&_select]:text-[var(--memo-fg)]">{children}</span></label>;
}
