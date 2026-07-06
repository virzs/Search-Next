import { createRoot } from "react-dom/client";
import Todo from "./Todo";
import styleText from "./style.css?inline";
import type { TodoProps } from "./types";

type AppInstance = {
  root: ReturnType<typeof createRoot>;
  props: TodoProps;
};

type TodoModule = {
  default?: typeof Todo;
};

const instances = new Set<AppInstance>();

const createAppRoot = (container: HTMLElement) => {
  const style = document.createElement("style");
  style.textContent = styleText;
  const mountPoint = document.createElement("div");
  mountPoint.className = "tw:h-full tw:w-full";
  container.append(style, mountPoint);
  return {
    mountPoint,
    cleanup: () => {
      style.remove();
      mountPoint.remove();
    },
  };
};

export function mount(container: HTMLElement | null, props: TodoProps = {}) {
  if (!container) return () => {};
  let disposed = false;
  const appRoot = createAppRoot(container);
  let root: ReturnType<typeof createRoot>;
  let instance: AppInstance | undefined;
  try {
    root = createRoot(appRoot.mountPoint);
    instance = { root, props: { ...props, mode: props.mode || "icon" } };
    instances.add(instance);
    root.render(<Todo {...instance.props} />);
  } catch (error) {
    if (instance) instances.delete(instance);
    appRoot.cleanup();
    throw error;
  }
  return () => {
    if (disposed) return;
    disposed = true;
    try {
      root.unmount();
    } finally {
      appRoot.cleanup();
      if (instance) instances.delete(instance);
    }
  };
}

export default mount;

if (import.meta?.hot) {
  import.meta.hot.accept("./Todo", (mod) => {
    const NextTodo = (mod as TodoModule | undefined)?.default || Todo;
    instances.forEach((instance) => {
      instance.root.render(<NextTodo {...instance.props} />);
    });
  });
}
