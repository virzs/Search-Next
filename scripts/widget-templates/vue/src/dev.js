import { mount } from "./index.js";

const cleanup = mount(document.getElementById("root"), { mode: "full" });

if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
