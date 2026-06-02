import { render } from "solid-js/web";
import Widget from "./Widget.jsx";
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
  const cleanup = render(() => <Widget {...props} mode={props.mode || "icon"} />, container);
  return () => {
    cleanup();
    removeStyle();
  };
}

export default mount;
