function s(t) {
  return t.toString().padStart(2, "0");
}
function m({ mode: t = "icon", title: o }) {
  const a = globalThis.React, { useEffect: c, useState: i, createElement: e } = a, [r, l] = i(/* @__PURE__ */ new Date());
  c(() => {
    const f = setInterval(() => l(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(f);
  }, []);
  const u = s(r.getHours()), d = s(r.getMinutes()), g = s(r.getSeconds()), n = t === "icon";
  return e(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        background: n ? "transparent" : "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
        color: n ? "#111827" : "#ffffff",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial",
        padding: n ? 0 : 16,
        boxShadow: n ? "none" : "0 8px 30px rgba(0,0,0,0.25)"
      }
    },
    e(
      "div",
      { style: { textAlign: "center" } },
      n ? null : e(
        "div",
        { style: { marginBottom: 8, fontSize: 14, opacity: 0.8 } },
        o || "时钟"
      ),
      e(
        "div",
        { style: { fontSize: n ? 20 : 48, fontWeight: 600, letterSpacing: 1 } },
        `${u}:${d}:${g}`
      ),
      n ? null : e(
        "div",
        { style: { marginTop: 6, fontSize: 14, opacity: 0.85 } },
        String(r.toLocaleDateString())
      )
    )
  );
}
function y(t, o = {}) {
  if (!t) return () => {
  };
  const a = globalThis.React, c = globalThis.ReactDOM;
  if (!a || !c) {
    console.error("[clock-widget] 宿主未提供 React/ReactDOM 全局变量");
    try {
      t.innerHTML = "Widget 依赖 React(宿主) 未找到";
    } catch {
    }
    return () => {
    };
  }
  const i = c.createRoot(t), { createElement: e } = a;
  return i.render(e(m, { mode: o.mode || "icon", title: o.title })), () => i.unmount();
}
export {
  y as default,
  y as mount
};
