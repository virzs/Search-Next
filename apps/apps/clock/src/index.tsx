import { createRoot } from "react-dom/client";
import Clock from "./Clock";
import styleText from "./tailwind.css?inline";
import type { ClockProps } from "./types";

type AppInstance = {
  root: ReturnType<typeof createRoot>;
  props: ClockProps;
};

type ClockModule = {
  default?: typeof Clock;
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

export function mount(container: HTMLElement | null, props: ClockProps = {}) {
  if (!container) return () => {};
  let disposed = false;
  const appRoot = createAppRoot(container);
  let root: ReturnType<typeof createRoot>;
  let instance: AppInstance | undefined;
  try {
    root = createRoot(appRoot.mountPoint);
    instance = { root, props: { ...props, mode: props.mode || "icon" } };
    instances.add(instance);
    root.render(<Clock {...instance.props} />);
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
  import.meta.hot.accept("./Clock", (newClockMod) => {
    const NextClock = (newClockMod as ClockModule | undefined)?.default || Clock;
    instances.forEach((instance) => {
      instance.root.render(<NextClock {...instance.props} />);
    });
  });
}
