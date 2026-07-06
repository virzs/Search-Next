import { createRoot } from "react-dom/client";
import App from "./App";
import styleText from "./style.css?inline";
import type { AppProps } from "./types";

type AppInstance = {
  root: ReturnType<typeof createRoot>;
  props: AppProps;
};

type AppModule = {
  default?: typeof App;
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

export function mount(container: HTMLElement | null, props: AppProps = {}) {
  if (!container) return () => {};

  let disposed = false;
  const appRoot = createAppRoot(container);
  let root: ReturnType<typeof createRoot>;
  let instance: AppInstance | undefined;
  try {
    root = createRoot(appRoot.mountPoint);
    instance = { root, props: { ...props, mode: props.mode || "full" } };
    instances.add(instance);
    root.render(<App {...instance.props} />);
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
  import.meta.hot.accept("./App", (mod) => {
    const NextApp = (mod as AppModule | undefined)?.default || App;
    instances.forEach((instance) => {
      instance.root.render(<NextApp {...instance.props} />);
    });
  });
}
