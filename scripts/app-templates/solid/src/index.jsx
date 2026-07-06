import { render } from "solid-js/web";
import App from "./App.jsx";
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
  let cleanup;
  try {
    cleanup = render(() => <App {...props} mode={props.mode || "icon"} />, appRoot.mountPoint);
  } catch (error) {
    appRoot.cleanup();
    throw error;
  }
  return () => {
    if (disposed) return;
    disposed = true;
    cleanup();
    appRoot.cleanup();
  };
}

export default mount;
