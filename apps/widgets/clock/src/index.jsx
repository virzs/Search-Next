// React 版本时钟小组件（不打包 React），导出 mount(container, props)
// 依赖宿主页面提前暴露 window.React 与 window.ReactDOM
// 支持通过 props.sdk 接收宿主注入的 Widget SDK 实例
import Clock from "./Clock.jsx";

// 记录当前挂载的根与属性，便于 HMR 触发时重新渲染
let __clock_root = null;
let __clock_props = null;

export function mount(container, props = {}) {
  if (!container) return () => {};
  const React = globalThis.React;
  const ReactDOM = globalThis.ReactDOM;
  if (!React || !ReactDOM) {
    console.error("[clock-widget] 宿主未提供 React/ReactDOM 全局变量");
    try {
      container.innerHTML = "Widget 依赖 React(宿主) 未找到";
    } catch {}
    return () => {};
  }
  const root = ReactDOM.createRoot(container);
  const { createElement } = React;
  root.render(createElement(Clock, {
    mode: props.mode || "icon",
    title: props.title,
    sdk: props.sdk,
  }));
  __clock_root = root;
  __clock_props = { ...props };
  return () => root.unmount();
}

export default mount;

// 接受 Clock 组件的热更新，并在同一根内重新渲染
if (import.meta && import.meta.hot) {
  import.meta.hot.accept("./Clock.jsx", (newClockMod) => {
    try {
      const React = globalThis.React;
      if (!React || !__clock_root) return;
      const { createElement } = React;
      const NewClock = newClockMod?.default || Clock;
      __clock_root.render(
        createElement(NewClock, {
          mode: __clock_props?.mode || "icon",
          title: __clock_props?.title,
          sdk: __clock_props?.sdk,
        })
      );
    } catch (err) {
      console.warn("[clock-widget] HMR re-render failed:", err);
    }
  });
}
