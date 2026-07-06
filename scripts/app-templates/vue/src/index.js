import { createApp } from "vue";
import App from "./App.vue";
import styleText from "./style.css?inline";

const createAppRoot = (container) => {
  const style = document.createElement("style");
  style.textContent = styleText;
  const mountPoint = document.createElement("div");
  mountPoint.className = "app-root";
  mountPoint.style.width = "100%";
  mountPoint.style.height = "100%";
  container.append(style, mountPoint);
  return {
    mountPoint,
    cleanup: () => {
      style.remove();
      mountPoint.remove();
    },
  };
};

export function mount(container, props = {}) {
  if (!container) return () => {};
  let disposed = false;
  const appRoot = createAppRoot(container);
  const app = createApp(App, { ...props, mode: props.mode || "icon" });
  try {
    app.mount(appRoot.mountPoint);
  } catch (error) {
    appRoot.cleanup();
    throw error;
  }
  return () => {
    if (disposed) return;
    disposed = true;
    app.unmount();
    appRoot.cleanup();
  };
}

export default mount;
