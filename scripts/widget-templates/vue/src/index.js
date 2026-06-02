import { createApp } from "vue";
import Widget from "./Widget.vue";
import styleText from "./style.css?inline";

const injectStyle = (container) => {
  const style = document.createElement("style");
  style.textContent = styleText;
  container.prepend(style);
  return () => style.remove();
};

export function mount(container, props = {}) {
  if (!container) return () => {};
  const removeStyle = injectStyle(container);
  const app = createApp(Widget, { ...props, mode: props.mode || "icon" });
  app.mount(container);
  return () => {
    app.unmount();
    removeStyle();
  };
}

export default mount;
