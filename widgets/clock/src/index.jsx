// React 版本时钟小组件（不打包 React），导出 mount(container, props)
// 依赖宿主页面提前暴露 window.React 与 window.ReactDOM

function pad(n) { return n.toString().padStart(2, '0'); }

function Clock({ mode = 'icon', title }) {
  const React = globalThis.React;
  const { useEffect, useState, createElement } = React;

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());

  const isIcon = mode === 'icon';

  return createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        background: isIcon ? 'transparent' : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: isIcon ? '#111827' : '#ffffff',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial',
        padding: isIcon ? 0 : 16,
        boxShadow: isIcon ? 'none' : '0 8px 30px rgba(0,0,0,0.25)',
      },
    },
    createElement(
      'div',
      { style: { textAlign: 'center' } },
      !isIcon
        ? createElement(
            'div',
            { style: { marginBottom: 8, fontSize: 14, opacity: 0.8 } },
            title || '时钟'
          )
        : null,
      createElement(
        'div',
        { style: { fontSize: isIcon ? 20 : 48, fontWeight: 600, letterSpacing: 1 } },
        `${h}:${m}:${s}`
      ),
      !isIcon
        ? createElement(
            'div',
            { style: { marginTop: 6, fontSize: 14, opacity: 0.85 } },
            String(now.toLocaleDateString())
          )
        : null
    )
  );
}

export function mount(container, props = {}) {
  if (!container) return () => {};
  const React = globalThis.React;
  const ReactDOM = globalThis.ReactDOM;
  if (!React || !ReactDOM) {
    console.error('[clock-widget] 宿主未提供 React/ReactDOM 全局变量');
    try { container.innerHTML = 'Widget 依赖 React(宿主) 未找到'; } catch {}
    return () => {};
  }
  const root = ReactDOM.createRoot(container);
  const { createElement } = React;
  root.render(createElement(Clock, { mode: props.mode || 'icon', title: props.title }));
  return () => root.unmount();
}

export default mount;