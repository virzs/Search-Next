import { mount } from "./index";
import config from "../app.config.json";

type Theme = "light" | "dark";
const root = document.getElementById("root")!;
root.innerHTML = `<header><div><strong>${config.displayName}</strong><span>LeaferJS · React · Tailwind CSS</span></div><nav><button data-theme="light">浅色</button><button data-theme="dark">深色</button><button data-mode="full">完整应用</button><button data-mode="settings">设置</button></nav></header><main><div id="preview"></div></main>`;
const pageStyle = document.createElement("style"); pageStyle.textContent = `
  *{box-sizing:border-box}body{margin:0;background:#e8ebf0;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;color:#202124}header{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(255,255,255,.78);border-bottom:1px solid rgba(0,0,0,.08);backdrop-filter:blur(20px)}header div{display:flex;align-items:baseline;gap:12px}header strong{font-size:18px}header span{font-size:11px;color:#71747c}nav{display:flex;gap:6px}button{border:0;border-radius:9px;background:rgba(0,0,0,.06);padding:7px 10px;font:600 12px inherit;cursor:pointer}main{height:calc(100vh - 64px);padding:20px}#preview{height:100%;min-height:560px;overflow:hidden;border-radius:18px;box-shadow:0 18px 60px rgba(26,35,55,.16)}
`; document.head.append(pageStyle);
let cleanup = () => {}; let theme: Theme = "light"; let mode: "full" | "settings" = "full";
const render = () => { cleanup(); cleanup = mount(document.getElementById("preview"), { mode, sdk: { sizeId: "2x2", theme: { activeThemeId: theme }, locale: { language: "zh-CN" }, storage: { get: async () => null, set: async () => {} }, onThemeChange: () => () => {}, onLocaleChange: () => () => {}, toast: { success: console.info, error: console.error } } }); };
document.querySelectorAll<HTMLButtonElement>("[data-theme]").forEach((button) => button.onclick = () => { theme = button.dataset.theme as Theme; render(); });
document.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((button) => button.onclick = () => { mode = button.dataset.mode as typeof mode; render(); });
render();
