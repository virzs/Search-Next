const STORAGE_KEY = "todos";

const createTodo = (title) => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  title,
  done: false,
});

const readTodos = async (sdk) => {
  if (!sdk?.storage) return [];
  try {
    const raw = await sdk.storage.get(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTodos = async (sdk, todos) => {
  if (!sdk?.storage) return;
  await sdk.storage.set(STORAGE_KEY, JSON.stringify(todos));
};

const Todo = ({ mode = "icon", sdk }) => {
  const React = globalThis.React;
  const { useEffect, useMemo, useState } = React;
  const [todos, setTodos] = useState([]);
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
    if (!sdk?.events) return undefined;
    const handler = (payload) => {
      if (!payload || payload.key !== STORAGE_KEY || payload.widgetId !== sdk.widgetId) return;
      try {
        const next = payload.value ? JSON.parse(payload.value) : [];
        setTodos(Array.isArray(next) ? next : []);
      } catch {
        setTodos([]);
      }
    };
    sdk.events.on("storage:changed", handler);
    return () => sdk.events.off("storage:changed", handler);
  }, [sdk]);

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  const activeCount = useMemo(() => todos.filter((todo) => !todo.done).length, [todos]);
  const isIcon = mode === "icon";
  const isDark = themeId === "dark";

  const setAndPersist = (nextTodos) => {
    setTodos(nextTodos);
    writeTodos(sdk, nextTodos);
  };

  const addTodo = () => {
    const title = draft.trim();
    if (!title) return;
    setAndPersist([createTodo(title), ...todos].slice(0, 12));
    setDraft("");
  };

  const toggleTodo = (id) => {
    setAndPersist(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  };

  const removeDone = () => {
    setAndPersist(todos.filter((todo) => !todo.done));
  };

  if (isIcon) {
    return React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: isDark ? "linear-gradient(145deg, #0f172a, #1e293b)" : "linear-gradient(145deg, #ecfeff, #ccfbf1)",
          color: isDark ? "#f8fafc" : "#0f766e",
          boxSizing: "border-box",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
      },
      React.createElement("div", { style: { fontSize: 24, lineHeight: 1 } }, "✓"),
      React.createElement("div", { style: { fontSize: 12, fontWeight: 700 } }, `${activeCount} 待办`),
    );
  }

  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        borderRadius: 18,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: isDark ? "linear-gradient(145deg, #0f172a, #111827)" : "linear-gradient(145deg, #f8fafc, #ecfeff)",
        color: isDark ? "#e2e8f0" : "#0f172a",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        boxShadow: isDark ? "inset 0 0 0 1px rgba(148, 163, 184, 0.18)" : "inset 0 0 0 1px rgba(15, 118, 110, 0.14)",
      },
    },
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
      React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, "Todo 测试"),
      React.createElement("button", {
        type: "button",
        onClick: removeDone,
        style: {
          border: 0,
          borderRadius: 999,
          padding: "4px 8px",
          fontSize: 11,
          color: isDark ? "#99f6e4" : "#0f766e",
          background: isDark ? "rgba(20, 184, 166, 0.14)" : "rgba(20, 184, 166, 0.12)",
          cursor: "pointer",
        },
      }, "清除已完成"),
    ),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 6 } },
      React.createElement("input", {
        value: draft,
        placeholder: "添加一个测试任务",
        onChange: (event) => setDraft(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Enter") addTodo();
        },
        style: {
          flex: 1,
          minWidth: 0,
          border: 0,
          borderRadius: 10,
          padding: "8px 10px",
          outline: "none",
          color: isDark ? "#f8fafc" : "#0f172a",
          background: isDark ? "rgba(15, 23, 42, 0.72)" : "rgba(255, 255, 255, 0.82)",
        },
      }),
      React.createElement("button", {
        type: "button",
        onClick: addTodo,
        style: {
          border: 0,
          borderRadius: 10,
          padding: "0 12px",
          color: "#ffffff",
          background: "#0f766e",
          fontWeight: 700,
          cursor: "pointer",
        },
      }, "+"),
    ),
    React.createElement(
      "div",
      { style: { flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 } },
      todos.length === 0
        ? React.createElement("div", { style: { margin: "auto", fontSize: 12, opacity: 0.62 } }, "暂无任务")
        : todos.map((todo) => React.createElement(
            "button",
            {
              key: todo.id,
              type: "button",
              onClick: () => toggleTodo(todo.id),
              style: {
                border: 0,
                borderRadius: 10,
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                textAlign: "left",
                color: isDark ? "#e2e8f0" : "#134e4a",
                background: isDark ? "rgba(30, 41, 59, 0.78)" : "rgba(255, 255, 255, 0.76)",
                cursor: "pointer",
              },
            },
            React.createElement("span", {
              style: {
                width: 16,
                height: 16,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#ffffff",
                background: todo.done ? "#14b8a6" : "transparent",
                boxShadow: todo.done ? "none" : "inset 0 0 0 1px #5eead4",
                fontSize: 11,
              },
            }, todo.done ? "✓" : ""),
            React.createElement("span", {
              style: {
                textDecoration: todo.done ? "line-through" : "none",
                opacity: todo.done ? 0.56 : 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }, todo.title),
          )),
    ),
  );
};

export default Todo;
