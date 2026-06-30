import { createRoot } from "react-dom/client";
import Widget from "./Widget";
import styleText from "./style.css?inline";
import type { WidgetProps } from "./types";

type WidgetInstance = {
  root: ReturnType<typeof createRoot>;
  props: WidgetProps;
};

type WidgetModule = {
  default?: typeof Widget;
};

const instances = new Set<WidgetInstance>();

const createWidgetRoot = (container: HTMLElement) => {
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

export function mount(container: HTMLElement | null, props: WidgetProps = {}) {
  if (!container) return () => {};

  let disposed = false;
  const widgetRoot = createWidgetRoot(container);
  let root: ReturnType<typeof createRoot>;
  let instance: WidgetInstance | undefined;
  try {
    root = createRoot(widgetRoot.mountPoint);
    instance = { root, props: { ...props, mode: props.mode || "icon" } };
    instances.add(instance);
    root.render(<Widget {...instance.props} />);
  } catch (error) {
    if (instance) instances.delete(instance);
    widgetRoot.cleanup();
    throw error;
  }
  return () => {
    if (disposed) return;
    disposed = true;
    try {
      root.unmount();
    } finally {
      widgetRoot.cleanup();
      if (instance) instances.delete(instance);
    }
  };
}

export default mount;

if (import.meta?.hot) {
  import.meta.hot.accept("./Widget", (mod) => {
    const NextWidget = (mod as WidgetModule | undefined)?.default || Widget;
    instances.forEach((instance) => {
      instance.root.render(<NextWidget {...instance.props} />);
    });
  });
}
