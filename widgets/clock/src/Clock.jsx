// 标准 JSX 格式的时钟组件
// 注意：不直接从 'react' 导入 hooks，改用宿主注入的全局 React，避免出现多份 React 导致的 Invalid hook call

function pad(n) {
  return n.toString().padStart(2, "0");
}

const Clock = ({ mode = "icon", title }) => {
  const React = globalThis.React;
  const { useEffect, useState } = React;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());

  const isIcon = mode === "icon";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        background: isIcon ? "transparent" : "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
        color: isIcon ? "#111827" : "#ffffff",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial",
        padding: isIcon ? 0 : 16,
        boxShadow: isIcon ? "none" : "0 8px 30px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {!isIcon ? <div style={{ marginBottom: 8, fontSize: 14, opacity: 0.8 }}>{title || "时钟"}</div> : null}
        <div style={{ fontSize: isIcon ? 20 : 48, fontWeight: 600, letterSpacing: 1 }}>{`${h}:${m}:${s}`}</div>
        {!isIcon ? (
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.85 }}>{String(now.toLocaleDateString())}</div>
        ) : null}
      </div>
    </div>
  );
};

export default Clock;
