import React from "react";
import { createRoot } from "react-dom/client";
import { mount } from "./index.jsx";

globalThis.React = React;
globalThis.ReactDOM = { createRoot };

const cleanup = mount(document.getElementById("root"), { mode: "full" });

if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
