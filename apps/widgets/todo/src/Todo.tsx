import { useEffect, useMemo, useState } from "react";
import type { StorageChangedPayload, TodoItem, TodoProps, WidgetSDK } from "./types";

const STORAGE_KEY = "todos";

const createTodo = (title: string): TodoItem => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  title,
  done: false,
});

const isTodoItem = (item: unknown): item is TodoItem => {
  if (!item || typeof item !== "object") return false;
  const todo = item as Record<string, unknown>;
  return typeof todo.id === "string" && typeof todo.title === "string" && typeof todo.done === "boolean";
};

const parseTodos = (value: unknown): TodoItem[] => {
  if (typeof value !== "string") return [];
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed.filter(isTodoItem) : [];
};

const readTodos = async (sdk?: WidgetSDK): Promise<TodoItem[]> => {
  if (!sdk?.storage) return [];
  try {
    const raw = await sdk.storage.get(STORAGE_KEY);
    return parseTodos(raw);
  } catch {
    return [];
  }
};

const writeTodos = async (sdk: WidgetSDK | undefined, todos: TodoItem[]) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(STORAGE_KEY, JSON.stringify(todos));
};

const Todo = ({ mode = "icon", sdk }: TodoProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [draft, setDraft] = useState("");
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");

  useEffect(() => {
    let mounted = true;
    readTodos(sdk).then((list) => {
      if (mounted) setTodos(list);
    });
    return () => {
      mounted = false;
    };
  }, [sdk]);

  useEffect(() => {
    const events = sdk?.events;
    if (!events) return undefined;
    const handler = (payload: StorageChangedPayload) => {
      if (!payload || payload.key !== STORAGE_KEY || payload.widgetId !== sdk.widgetId) return;
      try {
        setTodos(parseTodos(payload.value));
      } catch {
        setTodos([]);
      }
    };
    events.on("storage:changed", handler);
    return () => events.off("storage:changed", handler);
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const activeCount = useMemo(() => todos.filter((todo) => !todo.done).length, [todos]);
  const isIcon = mode === "icon";
  const isDark = themeId === "dark";

  const setAndPersist = (nextTodos: TodoItem[]) => {
    setTodos(nextTodos);
    writeTodos(sdk, nextTodos);
  };

  const addTodo = () => {
    const title = draft.trim();
    if (!title) return;
    setAndPersist([createTodo(title), ...todos].slice(0, 12));
    setDraft("");
  };

  const toggleTodo = (id: string) => {
    setAndPersist(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  };

  const removeDone = () => {
    setAndPersist(todos.filter((todo) => !todo.done));
  };
  const iconShellClassName = [
    "tw:flex tw:h-full tw:w-full tw:flex-col tw:items-center tw:justify-center tw:gap-1 tw:box-border tw:rounded-[14px] tw:font-sans",
    isDark
      ? "tw:bg-[linear-gradient(145deg,#0f172a,#1e293b)] tw:text-[#f8fafc]"
      : "tw:bg-[linear-gradient(145deg,#ecfeff,#ccfbf1)] tw:text-[#0f766e]",
  ].join(" ");
  const fullShellClassName = [
    "tw:flex tw:h-full tw:w-full tw:flex-col tw:gap-2.5 tw:overflow-hidden tw:box-border tw:rounded-[18px] tw:p-[14px] tw:font-sans",
    isDark
      ? "tw:bg-[linear-gradient(145deg,#0f172a,#111827)] tw:text-[#e2e8f0] tw:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]"
      : "tw:bg-[linear-gradient(145deg,#f8fafc,#ecfeff)] tw:text-[#0f172a] tw:shadow-[inset_0_0_0_1px_rgba(15,118,110,0.14)]",
  ].join(" ");

  if (isIcon) {
    return (
      <div className={iconShellClassName}>
        <div className="tw:text-2xl tw:leading-none">✓</div>
        <div className="tw:text-xs tw:font-bold">{activeCount} 待办</div>
      </div>
    );
  }

  return (
    <div className={fullShellClassName}>
      <div className="tw:flex tw:items-center tw:justify-between tw:gap-2">
        <div className="tw:text-[15px] tw:font-extrabold">Todo 测试</div>
        <button
          type="button"
          onClick={removeDone}
          className={`tw:cursor-pointer tw:rounded-full tw:border-0 tw:px-2 tw:py-1 tw:text-[11px] ${
            isDark ? "tw:bg-teal-500/15 tw:text-teal-200" : "tw:bg-teal-500/10 tw:text-teal-700"
          }`}
        >
          清除已完成
        </button>
      </div>
      <div className="tw:flex tw:gap-1.5">
        <input
          value={draft}
          placeholder="添加一个测试任务"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addTodo();
          }}
          className={`tw:min-w-0 tw:flex-1 tw:rounded-[10px] tw:border-0 tw:px-2.5 tw:py-2 tw:outline-none ${
            isDark ? "tw:bg-slate-950/70 tw:text-slate-50" : "tw:bg-white/80 tw:text-slate-950"
          }`}
        />
        <button
          type="button"
          onClick={addTodo}
          className="tw:cursor-pointer tw:rounded-[10px] tw:border-0 tw:bg-teal-700 tw:px-3 tw:font-bold tw:text-white"
        >
          +
        </button>
      </div>
      <div className="tw:flex tw:flex-1 tw:flex-col tw:gap-1.5 tw:overflow-auto">
        {todos.length === 0 ? (
          <div className="tw:m-auto tw:text-xs tw:opacity-[0.62]">暂无任务</div>
        ) : (
          todos.map((todo) => (
            <button
              key={todo.id}
              type="button"
              onClick={() => toggleTodo(todo.id)}
              className={`tw:flex tw:cursor-pointer tw:items-center tw:gap-2 tw:rounded-[10px] tw:border-0 tw:px-2.5 tw:py-2 tw:text-left ${
                isDark ? "tw:bg-slate-800/80 tw:text-slate-200" : "tw:bg-white/75 tw:text-teal-950"
              }`}
            >
              <span
                className={`tw:inline-flex tw:h-4 tw:w-4 tw:flex-shrink-0 tw:items-center tw:justify-center tw:rounded-full tw:text-[11px] tw:text-white ${
                  todo.done ? "tw:bg-teal-500" : "tw:bg-transparent tw:shadow-[inset_0_0_0_1px_#5eead4]"
                }`}
              >
                {todo.done ? "✓" : ""}
              </span>
              <span
                className={`tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap ${todo.done ? "tw:line-through tw:opacity-55" : "tw:opacity-100"}`}
              >
                {todo.title}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Todo;
