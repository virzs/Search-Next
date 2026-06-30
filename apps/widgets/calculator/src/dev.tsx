import { mount } from "./index";
import config from "../widget.config.json";

type SizeConfig = {
  id?: string;
  name?: string;
  row: number;
  col: number;
};

type ThemeId = "light" | "dark";

const cleanups: Array<() => void> = [];
const sizeConfigs = ((config.sizeConfigs || []) as SizeConfig[]).length
  ? (config.sizeConfigs as SizeConfig[])
  : [{ id: config.defaultSizeId || "1x1", name: config.defaultSizeId || "1x1", row: 1, col: 1 }];
const settingsDefaults = Object.fromEntries(
  (config.settingsSchema || []).map((field: { key: string; default?: unknown }) => [field.key, field.default ?? null]),
);

const getPreviewSize = ({ row, col }: SizeConfig) => ({
  width: col <= 1 ? 64 : 112 * col - 50,
  height: row <= 1 ? 64 : 110 * row - 46,
});

const createSdk = (sizeId: string, themeId: ThemeId) => ({
  widgetId: `dev-${sizeId}-${themeId}`,
  sizeId,
  theme: { activeThemeId: themeId },
  storage: {
    get: (key: string) => Promise.resolve(settingsDefaults[key] ?? null),
    set: () => Promise.resolve(),
  },
  events: {
    on: () => () => undefined,
    off: () => undefined,
  },
  toast: {
    success: () => undefined,
    error: () => undefined,
  },
  onThemeChange: () => () => undefined,
});

const createSection = (title: string, subtitle?: string) => {
  const section = document.createElement("section");
  section.className = "demo-section";
  section.innerHTML = `<div class="demo-section__header"><h2>${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div>`;
  document.getElementById("root")?.append(section);
  return section;
};

const createPreview = (parent: HTMLElement, label: string, width: number, height: number, themeId: ThemeId) => {
  const item = document.createElement("article");
  item.className = "demo-preview";
  item.innerHTML = `<div class="demo-frame"></div><div class="demo-caption"><strong>${label}</strong><span>${width}x${height} ${themeId}</span></div>`;
  const frame = item.querySelector<HTMLElement>(".demo-frame");
  if (!frame) throw new Error("Missing preview frame");
  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
  parent.append(item);
  return frame;
};

const mountPreview = (frame: HTMLElement, props: Parameters<typeof mount>[1]) => {
  cleanups.push(mount(frame, props));
};

const style = document.createElement("style");
style.textContent = `
  :root { color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif; }
  body { margin: 0; background: #eef6f7; color: #1d1d1f; }
  #root { min-height: 100vh; padding: 28px; }
  .demo-hero { margin-bottom: 24px; }
  .demo-hero h1 { margin: 0; font-size: 24px; line-height: 1.1; }
  .demo-hero p { margin: 8px 0 0; color: #6e6e73; font-size: 13px; }
  .demo-section { margin-top: 24px; }
  .demo-section__header { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
  .demo-section__header h2 { margin: 0; font-size: 16px; }
  .demo-section__header p { margin: 0; color: #6e6e73; font-size: 12px; }
  .demo-grid { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 18px; }
  .demo-preview { display: flex; flex-direction: column; align-items: center; gap: 7px; }
  .demo-frame { overflow: hidden; border-radius: 18px; pointer-events: none; user-select: none; }
  .demo-caption { display: flex; flex-direction: column; align-items: center; gap: 2px; color: #3a3a3c; font-size: 12px; }
  .demo-caption span { color: #6e6e73; font-size: 11px; }
`;
document.head.append(style);

document.getElementById("root")!.innerHTML = `
  <header class="demo-hero">
    <h1>${config.displayName || config.name} 展示页</h1>
    <p>自动读取 widget.config.json 的 sizeConfigs，只读展示所有尺寸与主题；此页面仅用于开发，不参与小组件打包。</p>
  </header>
`;

for (const themeId of ["light", "dark"] as ThemeId[]) {
  const section = createSection(`Icon Mode - ${themeId}`, "所有 sizeConfigs");
  const grid = document.createElement("div");
  grid.className = "demo-grid";
  section.append(grid);

  for (const size of sizeConfigs) {
    const sizeId = size.id || `${size.col}x${size.row}`;
    const previewSize = getPreviewSize(size);
    const frame = createPreview(grid, size.name || sizeId, previewSize.width, previewSize.height, themeId);
    mountPreview(frame, {
      mode: "icon",
      title: config.displayName || config.name,
      sdk: createSdk(sizeId, themeId),
    });
  }
}

for (const themeId of ["light", "dark"] as ThemeId[]) {
  const section = createSection(`Panel Mode - ${themeId}`, "full / settings");
  const grid = document.createElement("div");
  grid.className = "demo-grid";
  section.append(grid);

  const fullFrame = createPreview(grid, "full", 760, 640, themeId);
  mountPreview(fullFrame, {
    mode: "full",
    title: config.displayName || config.name,
    sdk: createSdk(config.defaultSizeId || sizeConfigs[0]?.id || "1x1", themeId),
  });

  if (config.pagePaths?.settings) {
    const settingsFrame = createPreview(grid, "settings", 760, 640, themeId);
    mountPreview(settingsFrame, {
      mode: "settings",
      pagePath: config.pagePaths.settings,
      title: config.displayName || config.name,
      sdk: createSdk(config.defaultSizeId || sizeConfigs[0]?.id || "1x1", themeId),
    });
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanups.forEach((cleanup) => cleanup());
    style.remove();
  });
}
