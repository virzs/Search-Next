import Widget from "./Widget.jsx";
import styleText from "./style.css?inline";

const instances = new Set();

const injectStyle = (container) => {
  const style = document.createElement("style");
  style.textContent = styleText;
  container.prepend(style);
  return () => style.remove();
};

export function mount(container, props = {}) {
  if (!container) return () => {};
  const React = globalThis.React;
  const ReactDOM = globalThis.ReactDOM;
  if (!React || !ReactDOM) {
    container.innerHTML = "Widget 依赖 React(宿主) 未找到";
    return () => {};
  }

  const removeStyle = injectStyle(container);
  const root = ReactDOM.createRoot(container);
  const instance = { root, props: { ...props, mode: props.mode || "icon" } };
  instances.add(instance);
  root.render(React.createElement(Widget, instance.props));
  return () => {
    root.unmount();
    removeStyle();
    instances.delete(instance);
  };
}

export default mount;

if (import.meta?.hot) {
  import.meta.hot.accept("./Widget.jsx", (mod) => {
    const React = globalThis.React;
    if (!React) return;
    const NextWidget = mod?.default || Widget;
    instances.forEach((instance) => {
      instance.root.render(React.createElement(NextWidget, instance.props));
    });
  });
}
