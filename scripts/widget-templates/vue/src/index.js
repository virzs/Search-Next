import { createApp } from "vue";
import Widget from "./Widget.vue";
import styleText from "./style.css?inline";

const createWidgetRoot = (container) => {
  const style = document.createElement("style");
  style.textContent = styleText;
  const mountPoint = document.createElement("div");
  mountPoint.className = "widget-root";
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
  const widgetRoot = createWidgetRoot(container);
  const app = createApp(Widget, { ...props, mode: props.mode || "icon" });
  try {
    app.mount(widgetRoot.mountPoint);
  } catch (error) {
    widgetRoot.cleanup();
    throw error;
  }
  return () => {
    if (disposed) return;
    disposed = true;
    app.unmount();
    widgetRoot.cleanup();
  };
}

export default mount;
