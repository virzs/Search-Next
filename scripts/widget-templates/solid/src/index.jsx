import { render } from "solid-js/web";
import Widget from "./Widget.jsx";
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
  let cleanup;
  try {
    cleanup = render(() => <Widget {...props} mode={props.mode || "icon"} />, widgetRoot.mountPoint);
  } catch (error) {
    widgetRoot.cleanup();
    throw error;
  }
  return () => {
    if (disposed) return;
    disposed = true;
    cleanup();
    widgetRoot.cleanup();
  };
}

export default mount;
