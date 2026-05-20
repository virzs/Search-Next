import Todo from "./Todo.jsx";

let todoRoot = null;
let todoProps = null;

export function mount(container, props = {}) {
  if (!container) return () => {};
  const React = globalThis.React;
  const ReactDOM = globalThis.ReactDOM;
  if (!React || !ReactDOM) {
    container.innerHTML = "Widget 依赖 React(宿主) 未找到";
    return () => {};
  }
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(Todo, {
    mode: props.mode || "icon",
    sdk: props.sdk,
  }));
  todoRoot = root;
  todoProps = { ...props };
  return () => root.unmount();
}

export default mount;

if (import.meta?.hot) {
  import.meta.hot.accept("./Todo.jsx", (mod) => {
    const React = globalThis.React;
    if (!React || !todoRoot) return;
    const NextTodo = mod?.default || Todo;
    todoRoot.render(React.createElement(NextTodo, {
      mode: todoProps?.mode || "icon",
      sdk: todoProps?.sdk,
    }));
  });
}
