import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { resources, useAppI18n } from "./i18n";
import type { AppTranslationFn } from "./i18n";
import type {
  StorageChangedPayload,
  TodoItem,
  TodoPriority,
  TodoProps,
  TodoSettings,
  TodoSortMode,
  AppSDK,
} from "./types";

const TODOS_STORAGE_KEY = "todos";
const SETTINGS_STORAGE_KEY = "todoSettings";

const ACCENT_OPTIONS = [
  { labelKey: "accent.blue", value: "#007aff" },
  { labelKey: "accent.green", value: "#34c759" },
  { labelKey: "accent.orange", value: "#ff9500" },
  { labelKey: "accent.purple", value: "#af52de" },
];

const PRIORITY_OPTIONS: Array<{ labelKey: string; value: TodoPriority }> = [
  { labelKey: "priority.high", value: "high" },
  { labelKey: "priority.normal", value: "normal" },
  { labelKey: "priority.low", value: "low" },
];

const SORT_OPTIONS: Array<{ labelKey: string; value: TodoSortMode }> = [
  { labelKey: "sort.priority", value: "priority" },
  { labelKey: "sort.created", value: "created" },
  { labelKey: "sort.completed", value: "completed" },
];

const DEFAULT_SETTINGS: TodoSettings = {
  accentColor: "#007aff",
  showCompleted: true,
  compact: false,
  sortMode: "priority",
};

const priorityWeight: Record<TodoPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

const cn = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const safeParseJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const isPriority = (value: unknown): value is TodoPriority =>
  value === "high" || value === "normal" || value === "low";

const isSortMode = (value: unknown): value is TodoSortMode =>
  value === "priority" || value === "created" || value === "completed";

const normalizeTodo = (value: unknown, index: number): TodoItem | null => {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.title !== "string") return null;
  const title = item.title.trim();
  if (!title) return null;

  return {
    id: item.id,
    title,
    done: item.done === true,
    createdAt:
      typeof item.createdAt === "number" && Number.isFinite(item.createdAt)
        ? item.createdAt
        : Date.now() - index,
    note: typeof item.note === "string" ? item.note : undefined,
    priority: isPriority(item.priority) ? item.priority : "normal",
  };
};

const parseTodos = (value: unknown): TodoItem[] => {
  const parsed = safeParseJson(value);
  return Array.isArray(parsed)
    ? parsed
        .map((item, index) => normalizeTodo(item, index))
        .filter((item): item is TodoItem => Boolean(item))
    : [];
};

const parseSettings = (value: unknown): TodoSettings => {
  const parsed = safeParseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return DEFAULT_SETTINGS;
  }
  const settings = parsed as Record<string, unknown>;
  const accentColor =
    typeof settings.accentColor === "string" &&
    ACCENT_OPTIONS.some((option) => option.value === settings.accentColor)
      ? settings.accentColor
      : DEFAULT_SETTINGS.accentColor;

  return {
    accentColor,
    showCompleted:
      typeof settings.showCompleted === "boolean"
        ? settings.showCompleted
        : DEFAULT_SETTINGS.showCompleted,
    compact:
      typeof settings.compact === "boolean"
        ? settings.compact
        : DEFAULT_SETTINGS.compact,
    sortMode: isSortMode(settings.sortMode)
      ? settings.sortMode
      : DEFAULT_SETTINGS.sortMode,
  };
};

const createTodo = (title: string, priority: TodoPriority): TodoItem => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  title,
  done: false,
  createdAt: Date.now(),
  priority,
});

const readTodos = async (sdk?: AppSDK): Promise<TodoItem[]> => {
  if (!sdk?.storage) return [];
  const raw = await sdk.storage.get(TODOS_STORAGE_KEY);
  return parseTodos(raw);
};

const readSettings = async (sdk?: AppSDK): Promise<TodoSettings> => {
  if (!sdk?.storage) return DEFAULT_SETTINGS;
  const raw = await sdk.storage.get(SETTINGS_STORAGE_KEY);
  return parseSettings(raw);
};

const writeTodos = async (sdk: AppSDK | undefined, todos: TodoItem[]) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(TODOS_STORAGE_KEY, JSON.stringify(todos));
};

const writeSettings = async (
  sdk: AppSDK | undefined,
  settings: TodoSettings,
) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

const sortTodos = (todos: TodoItem[], sortMode: TodoSortMode) => {
  return [...todos].sort((a, b) => {
    if (sortMode === "completed" && a.done !== b.done) {
      return a.done ? 1 : -1;
    }
    if (sortMode === "priority") {
      const priorityDiff =
        priorityWeight[a.priority ?? "normal"] -
        priorityWeight[b.priority ?? "normal"];
      if (priorityDiff !== 0) return priorityDiff;
    }
    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
  });
};

const getThemeVars = (themeId: string, settings: TodoSettings) =>
  ({
    "--todo-bg": themeId === "dark" ? "#000000" : "#ffffff",
    "--todo-card": themeId === "dark" ? "#1d1d1f" : "#f5f5f7",
    "--todo-elevated": themeId === "dark" ? "#2c2c2e" : "#ffffff",
    "--todo-fg": themeId === "dark" ? "#f5f5f7" : "#1d1d1f",
    "--todo-muted": themeId === "dark" ? "#a1a1a6" : "#6e6e73",
    "--todo-border": themeId === "dark" ? "#38383a" : "#e5e5ea",
    "--todo-accent": settings.accentColor,
  }) as CSSProperties;

const Todo = ({ mode = "icon", title = "Todo", sdk }: TodoProps) => {
  const { language, t } = useAppI18n(sdk, resources);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [settings, setSettings] = useState<TodoSettings>(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState("");
  const [draftPriority, setDraftPriority] = useState<TodoPriority>("normal");
  const [filter, setFilter] = useState<"today" | "active" | "done">("today");
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");

  useEffect(() => {
    let mounted = true;
    Promise.all([readTodos(sdk), readSettings(sdk)]).then(
      ([nextTodos, nextSettings]) => {
        if (!mounted) return;
        setTodos(nextTodos);
        setSettings(nextSettings);
      },
    );
    return () => {
      mounted = false;
    };
  }, [sdk]);

  useEffect(() => {
    const events = sdk?.events;
    if (!events) return undefined;
    const handler = (payload: StorageChangedPayload) => {
      if (!payload || payload.appId !== sdk.appId) return;
      if (payload.key === TODOS_STORAGE_KEY) {
        setTodos(parseTodos(payload.value));
      }
      if (payload.key === SETTINGS_STORAGE_KEY) {
        setSettings(parseSettings(payload.value));
      }
    };
    events.on("storage:changed", handler);
    return () => events.off("storage:changed", handler);
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.done).length,
    [todos],
  );
  const completedCount = todos.length - activeCount;
  const visibleTodos = useMemo(() => {
    const filtered = todos.filter((todo) => {
      if (filter === "active") return !todo.done;
      if (filter === "done") return todo.done;
      return settings.showCompleted || !todo.done;
    });
    return sortTodos(filtered, settings.sortMode);
  }, [filter, settings.showCompleted, settings.sortMode, todos]);
  const themeVars = getThemeVars(themeId, settings);
  const isIcon = mode === "icon" || mode === "appIcon";
  const isAppIcon = mode === "appIcon";
  const isWide = sdk?.sizeId === "4x2";

  const setAndPersistTodos = (nextTodos: TodoItem[]) => {
    setTodos(nextTodos);
    void writeTodos(sdk, nextTodos);
  };

  const setAndPersistSettings = (nextSettings: TodoSettings) => {
    setSettings(nextSettings);
    void writeSettings(sdk, nextSettings);
  };

  const addTodo = () => {
    const nextTitle = draft.trim();
    if (!nextTitle) return;
    setAndPersistTodos([createTodo(nextTitle, draftPriority), ...todos]);
    setDraft("");
  };

  const toggleTodo = (id: string) => {
    setAndPersistTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  };

  const removeTodo = (id: string) => {
    setAndPersistTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearDone = () => {
    setAndPersistTodos(todos.filter((todo) => !todo.done));
  };

  if (isIcon) {
    return (
      <div
        className={cn(
          "tw:flex tw:h-full tw:w-full tw:box-border tw:overflow-hidden tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,Helvetica_Neue,system-ui,sans-serif] tw:tracking-[0] tw:text-[var(--todo-fg)] tw:antialiased",
          isAppIcon
            ? "tw:items-center tw:justify-center tw:rounded-[18px] tw:bg-white tw:p-0 tw:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
            : "tw:flex-col tw:rounded-[18px] tw:bg-[var(--todo-bg)] tw:p-3 tw:shadow-[inset_0_0_0_1px_var(--todo-border)]",
        )}
        style={themeVars}
      >
        {isAppIcon ? (
          <div className="tw:flex tw:h-full tw:w-full tw:items-center tw:justify-center tw:bg-[linear-gradient(180deg,#ffffff,#f2f2f7)]">
            <div className="tw:grid tw:h-[62%] tw:w-[56%] tw:gap-[9%] tw:rounded-[16%] tw:border tw:border-[#e5e5ea] tw:bg-white tw:p-[12%] tw:shadow-[0_8px_18px_rgba(0,0,0,0.14)]">
              <span className="tw:h-[22%] tw:w-[76%] tw:rounded-full tw:bg-[#007aff]" />
              <span className="tw:h-[22%] tw:w-[58%] tw:rounded-full tw:bg-[#ff9500]" />
              <span className="tw:h-[22%] tw:w-[88%] tw:rounded-full tw:bg-[#34c759]" />
            </div>
          </div>
        ) : (
          <>
            <div className="tw:flex tw:items-center tw:justify-between tw:gap-2">
              <div>
                <div className="tw:text-[13px] tw:font-semibold tw:leading-none">
                  {t("title.today")}
                </div>
                <div className="tw:mt-1 tw:text-[11px] tw:text-[var(--todo-muted)]">
                  {t("count.active", { count: activeCount })}
                </div>
              </div>
              <div className="tw:flex tw:h-8 tw:w-8 tw:items-center tw:justify-center tw:rounded-full tw:bg-[var(--todo-accent)] tw:text-[16px] tw:font-bold tw:text-white">
                {activeCount}
              </div>
            </div>
            <div
              className={cn(
                "tw:mt-3 tw:grid tw:min-h-0 tw:flex-1 tw:gap-1.5",
                isWide && "tw:grid-cols-2",
              )}
            >
              {visibleTodos.slice(0, isWide ? 4 : 3).map((todo) => (
                <div
                  key={todo.id}
                  className="tw:flex tw:min-w-0 tw:items-center tw:gap-2 tw:rounded-[10px] tw:bg-[var(--todo-card)] tw:px-2 tw:py-1.5"
                >
                  <span
                    className={cn(
                      "tw:h-4 tw:w-4 tw:flex-none tw:rounded-full tw:border-2 tw:border-[var(--todo-accent)]",
                      todo.done &&
                        "tw:bg-[var(--todo-accent)] tw:shadow-[inset_0_0_0_3px_var(--todo-card)]",
                    )}
                  />
                  <span
                    className={cn(
                      "tw:min-w-0 tw:truncate tw:text-[11px]",
                      todo.done && "tw:text-[var(--todo-muted)] tw:line-through",
                    )}
                  >
                    {todo.title}
                  </span>
                </div>
              ))}
              {!visibleTodos.length && (
                <div
                  className={cn(
                    "tw:flex tw:items-center tw:justify-center tw:rounded-[12px] tw:bg-[var(--todo-card)] tw:text-[11px] tw:text-[var(--todo-muted)]",
                    isWide && "tw:col-span-2",
                  )}
                >
                  {t("empty.noItem")}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (mode === "settings") {
    return (
      <div
        className="todo-scroll-area tw:flex tw:h-full tw:w-full tw:flex-col tw:bg-[var(--todo-bg)] tw:p-4 tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,Helvetica_Neue,system-ui,sans-serif] tw:tracking-[0] tw:text-[var(--todo-fg)] tw:antialiased"
        style={themeVars}
      >
        <div className="tw:mb-3 tw:flex-none">
          <div className="tw:text-[23px] tw:font-semibold tw:leading-tight">
            {t("settings.title")}
          </div>
          <div className="tw:mt-1 tw:text-[13px] tw:text-[var(--todo-muted)]">
            {t("settings.subtitle")}
          </div>
        </div>
        <div className="tw:flex-none tw:overflow-hidden tw:rounded-[18px] tw:border tw:border-[var(--todo-border)] tw:bg-[var(--todo-elevated)]">
          <SettingRow title={t("settings.accent.title")} description={t("settings.accent.desc")}>
            <div className="tw:flex tw:gap-2">
              {ACCENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-label={t(option.labelKey)}
                  onClick={() =>
                    setAndPersistSettings({
                      ...settings,
                      accentColor: option.value,
                    })
                  }
                  className={cn(
                    "tw:h-6 tw:w-6 tw:cursor-pointer tw:rounded-full tw:border-2 tw:border-[var(--todo-elevated)] tw:shadow-[0_0_0_1px_rgba(0,0,0,0.18)]",
                    settings.accentColor === option.value &&
                      "tw:shadow-[0_0_0_1px_rgba(0,0,0,0.18),0_0_0_4px_var(--todo-accent)]",
                  )}
                  style={{ backgroundColor: option.value }}
                />
              ))}
            </div>
          </SettingRow>
          <SettingRow title={t("settings.showDone.title")} description={t("settings.showDone.desc")}>
            <SwitchButton
              active={settings.showCompleted}
              onClick={() =>
                setAndPersistSettings({
                  ...settings,
                  showCompleted: !settings.showCompleted,
                })
              }
            />
          </SettingRow>
          <SettingRow title={t("settings.compact.title")} description={t("settings.compact.desc")}>
            <SwitchButton
              active={settings.compact}
              onClick={() =>
                setAndPersistSettings({
                  ...settings,
                  compact: !settings.compact,
                })
              }
            />
          </SettingRow>
          <SettingRow title={t("settings.sort.title")} description={t("settings.sort.desc")}>
            <select
              value={settings.sortMode}
              onChange={(event) =>
                setAndPersistSettings({
                  ...settings,
                  sortMode: event.target.value as TodoSortMode,
                })
              }
              className="tw:h-8 tw:rounded-full tw:border tw:border-[var(--todo-border)] tw:bg-[var(--todo-card)] tw:px-3 tw:text-[12px] tw:text-[var(--todo-fg)] tw:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </SettingRow>
        </div>
      </div>
    );
  }

  return (
    <div
      className="todo-scroll-area tw:h-full tw:w-full tw:bg-[var(--todo-bg)] tw:font-[-apple-system,BlinkMacSystemFont,SF_Pro_Text,Helvetica_Neue,system-ui,sans-serif] tw:tracking-[0] tw:text-[var(--todo-fg)] tw:antialiased"
      style={themeVars}
    >
      <main className="tw:box-border tw:min-h-full tw:min-w-0 tw:bg-[var(--todo-bg)] tw:p-4">
        <div className="tw:mb-2.5 tw:flex tw:items-start tw:justify-between tw:gap-3">
          <div className="tw:min-w-0">
            <div className="tw:text-[12px] tw:font-semibold tw:text-[var(--todo-accent)]">
              {title}
            </div>
            <div className="tw:mt-1 tw:truncate tw:text-[28px] tw:font-semibold tw:leading-none">
              {filter === "done" ? t("title.done") : t("title.today")}
            </div>
            <div className="tw:mt-1.5 tw:text-[13px] tw:text-[var(--todo-muted)]">
              {new Date().toLocaleDateString(language, {
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={clearDone}
            className="tw:h-8 tw:flex-none tw:cursor-pointer tw:rounded-full tw:border-0 tw:bg-[var(--todo-card)] tw:px-3 tw:text-[12px] tw:font-medium tw:text-[var(--todo-accent)]"
          >
            {t("action.clearDone")}
          </button>
        </div>
        <div className="tw:mb-2.5 tw:grid tw:grid-cols-3 tw:gap-2">
          <SummaryCard label={t("summary.active")} value={activeCount} active />
          <SummaryCard label={t("summary.done")} value={completedCount} />
          <SummaryCard label={t("summary.all")} value={todos.length} />
        </div>
        <div className="tw:mb-2.5 tw:rounded-[16px] tw:border tw:border-[var(--todo-border)] tw:bg-[var(--todo-card)] tw:p-2">
          <div className="tw:grid tw:grid-cols-[1fr_auto] tw:gap-2">
            <input
              value={draft}
              placeholder={t("placeholder.new")}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTodo();
              }}
              className="tw:h-9 tw:min-w-0 tw:rounded-[12px] tw:border-0 tw:bg-[var(--todo-elevated)] tw:px-3 tw:text-[14px] tw:text-[var(--todo-fg)] tw:outline-none tw:placeholder:text-[var(--todo-muted)]"
            />
            <button
              type="button"
              onClick={addTodo}
              className="tw:h-9 tw:w-9 tw:cursor-pointer tw:rounded-full tw:border-0 tw:bg-[var(--todo-accent)] tw:text-[20px] tw:font-semibold tw:leading-none tw:text-white"
            >
              +
            </button>
          </div>
          <div className="tw:mt-2 tw:flex tw:flex-wrap tw:gap-2">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDraftPriority(option.value)}
                className={cn(
                  "tw:h-6 tw:cursor-pointer tw:rounded-full tw:border tw:px-3 tw:text-[12px]",
                  draftPriority === option.value
                    ? "tw:border-[var(--todo-accent)] tw:bg-[var(--todo-accent)] tw:text-white"
                    : "tw:border-[var(--todo-border)] tw:bg-[var(--todo-elevated)] tw:text-[var(--todo-muted)]",
                )}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>
        <div className="tw:mb-2.5 tw:grid tw:grid-cols-3 tw:gap-1 tw:rounded-full tw:bg-[var(--todo-card)] tw:p-1">
          <FilterButton
            active={filter === "today"}
            label={t("filter.today")}
            onClick={() => setFilter("today")}
          />
          <FilterButton
            active={filter === "active"}
            label={t("filter.active")}
            onClick={() => setFilter("active")}
          />
          <FilterButton
            active={filter === "done"}
            label={t("filter.done")}
            onClick={() => setFilter("done")}
          />
        </div>
        <div
          className={cn(
            "tw:min-h-[112px] tw:rounded-[18px] tw:border tw:border-[var(--todo-border)] tw:bg-[var(--todo-card)] tw:p-2",
            settings.compact ? "tw:space-y-1" : "tw:space-y-2",
          )}
        >
          {visibleTodos.length ? (
            visibleTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                compact={settings.compact}
                onToggle={() => toggleTodo(todo.id)}
                onDelete={() => removeTodo(todo.id)}
                t={t}
              />
            ))
          ) : (
            <div className="tw:flex tw:min-h-[112px] tw:flex-col tw:items-center tw:justify-center tw:gap-2 tw:text-center tw:text-[13px] tw:text-[var(--todo-muted)]">
              <span className="tw:flex tw:h-12 tw:w-12 tw:items-center tw:justify-center tw:rounded-full tw:bg-[var(--todo-elevated)] tw:text-[24px] tw:text-[var(--todo-accent)]">
                ✓
              </span>
              {t("empty.noReminder")}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active?: boolean;
}) => (
  <div
    className={cn(
      "tw:min-w-0 tw:rounded-[15px] tw:border tw:border-[var(--todo-border)] tw:p-2.5",
      active
        ? "tw:bg-[var(--todo-accent)] tw:text-white"
        : "tw:bg-[var(--todo-card)] tw:text-[var(--todo-fg)]",
    )}
  >
    <div className={cn("tw:text-[12px]", active ? "tw:text-white/78" : "tw:text-[var(--todo-muted)]")}>
      {label}
    </div>
    <div className="tw:mt-1 tw:text-[24px] tw:font-semibold tw:leading-none">
      {value}
    </div>
  </div>
);

const FilterButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "tw:h-7 tw:cursor-pointer tw:rounded-full tw:border-0 tw:text-[12px] tw:font-medium",
      active
        ? "tw:bg-[var(--todo-elevated)] tw:text-[var(--todo-fg)] tw:shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
        : "tw:bg-transparent tw:text-[var(--todo-muted)]",
    )}
  >
    {label}
  </button>
);

const NavItem = ({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "tw:mb-1 tw:flex tw:h-8 tw:w-full tw:cursor-pointer tw:items-center tw:justify-between tw:rounded-[10px] tw:border-0 tw:px-3 tw:text-left tw:text-[13px]",
      active
        ? "tw:bg-[var(--todo-elevated)] tw:text-[var(--todo-fg)]"
        : "tw:bg-transparent tw:text-[var(--todo-muted)]",
    )}
  >
    <span>{label}</span>
    <span className="tw:rounded-full tw:bg-[var(--todo-border)] tw:px-2 tw:text-[11px]">
      {count}
    </span>
  </button>
);

const TaskRow = ({
  todo,
  compact,
  onToggle,
  onDelete,
  t,
}: {
  todo: TodoItem;
  compact: boolean;
  onToggle: () => void;
  onDelete: () => void;
  t: AppTranslationFn;
}) => (
  <div
    className={cn(
      "tw:grid tw:grid-cols-[24px_1fr_auto] tw:items-center tw:gap-2 tw:rounded-[13px] tw:bg-[var(--todo-elevated)] tw:px-3",
      compact ? "tw:min-h-10 tw:py-1.5" : "tw:min-h-12 tw:py-2",
    )}
  >
    <button
      type="button"
      aria-label={todo.done ? t("aria.markUndone") : t("aria.markDone")}
      onClick={onToggle}
      className={cn(
        "tw:flex tw:h-5 tw:w-5 tw:cursor-pointer tw:items-center tw:justify-center tw:rounded-full tw:border-2 tw:border-[var(--todo-accent)] tw:bg-transparent tw:text-[12px] tw:text-white",
        todo.done && "tw:bg-[var(--todo-accent)]",
      )}
    >
      {todo.done ? "✓" : ""}
    </button>
    <div className="tw:min-w-0">
      <div
        className={cn(
          "tw:truncate tw:text-[14px] tw:font-medium",
          todo.done && "tw:text-[var(--todo-muted)] tw:line-through",
        )}
      >
        {todo.title}
      </div>
      {!compact && (
        <div className="tw:mt-1 tw:flex tw:items-center tw:gap-2 tw:text-[11px] tw:text-[var(--todo-muted)]">
          <span>{priorityLabel(todo.priority, t)}</span>
          {todo.note && <span className="tw:min-w-0 tw:truncate">{todo.note}</span>}
        </div>
      )}
    </div>
    <button
      type="button"
      onClick={onDelete}
      className="tw:h-7 tw:cursor-pointer tw:rounded-full tw:border-0 tw:bg-transparent tw:px-2 tw:text-[12px] tw:text-[var(--todo-muted)] hover:tw:bg-[var(--todo-card)]"
    >
      {t("action.delete")}
    </button>
  </div>
);

const priorityLabel = (
  priority: TodoPriority | undefined,
  t: AppTranslationFn,
) => {
  if (priority === "high") return t("priority.highFull");
  if (priority === "low") return t("priority.lowFull");
  return t("priority.normal");
};

const SettingRow = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <div className="tw:grid tw:min-h-[58px] tw:grid-cols-[minmax(0,1fr)_auto] tw:items-center tw:gap-4 tw:border-b tw:border-[var(--todo-border)] tw:px-4 tw:py-2.5 last:tw:border-b-0">
    <div className="tw:min-w-0">
      <div className="tw:text-[14px] tw:font-semibold">{title}</div>
      <div className="tw:mt-1 tw:text-[12px] tw:text-[var(--todo-muted)]">
        {description}
      </div>
    </div>
    {children}
  </div>
);

const SwitchButton = ({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "tw:flex tw:h-7 tw:w-12 tw:cursor-pointer tw:items-center tw:rounded-full tw:border-0 tw:p-0.5 tw:transition",
      active ? "tw:justify-end tw:bg-[var(--todo-accent)]" : "tw:justify-start tw:bg-[var(--todo-border)]",
    )}
  >
    <span className="tw:h-6 tw:w-6 tw:rounded-full tw:bg-white tw:shadow-[0_1px_3px_rgba(0,0,0,0.26)]" />
  </button>
);

export default Todo;
