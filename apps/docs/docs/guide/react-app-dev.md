# React 应用开发流程（TSX 与自带运行时）

本文档介绍如何在本项目中开发、构建和集成 React 应用。React 应用以远程 ESM 模块形式动态加载，入口导出 `mount(container, props)`；React 与 ReactDOM 随应用自身打包，避免依赖宿主页面全局变量，也避免不同框架或不同版本依赖互相冲突。

## 目标与约定

- 应用必须导出 `mount(container, props)` 函数，也可以默认导出该函数。
- React 应用默认使用 TypeScript/TSX，构建前执行 `tsc --noEmit` 做类型检查。
- React 应用默认接入 Tailwind CSS utilities，组件内使用 `tw:` 前缀类名。
- React 模板内置 shadcn/ui 风格的本地组件，默认包含 `components.json`、`src/lib/utils.ts` 和 `src/components/ui/button.tsx`。
- 样式文件只导入 Tailwind utilities，不导入全局 preflight/base；入口会把编译后的样式注入应用容器，减少宿主页面样式干扰。
- 构建产物入口固定为 `dist/app-build/<name>/index.js`。
- 构建后会为 icon 模式生成 `sizeConfigs x light/dark` 的截图，输出到 `dist/app-build/<name>/screenshots`。
- 应用需支持三种显示模式：`icon`（桌面图标位置展示）、`full`（窗口内完整展示）与 `settings`（设置页）。
- 应用通过 `props.sdk` 获取宿主注入的主题、storage、事件等能力。

## 目录结构

应用统一放在 `apps/apps/<name>` 目录，例如时钟：

```text
apps/apps/
  clock/
    package.json
    tsconfig.json
    vite.config.js
    app.config.json
    index.html
    src/
      index.tsx
      Clock.tsx
      types.ts
      vite-env.d.ts
      lib/
        utils.ts
      components/
        ui/
          button.tsx
      style.css
      icon.svg
```

构建输出位于：`dist/app-build/clock/index.js`。截图输出位于：`dist/app-build/clock/screenshots/icon`。

## 入口协议

入口文件负责把 React 组件挂载到宿主传入的隔离容器。宿主会强制为每个应用创建 Shadow DOM，入口只需要在传入容器内注入样式并创建自己的 React 挂载点：

```tsx
import { createRoot } from "react-dom/client";
import Clock from "./Clock";
import styleText from "./style.css?inline";
import type { ClockProps } from "./types";

const createAppRoot = (container: HTMLElement) => {
  const style = document.createElement("style");
  style.textContent = styleText;
  const mountPoint = document.createElement("div");
  mountPoint.className = "tw:h-full tw:w-full";
  container.append(style, mountPoint);
  return {
    mountPoint,
    cleanup: () => {
      style.remove();
      mountPoint.remove();
    },
  };
};

export function mount(container: HTMLElement | null, props: ClockProps = {}) {
  if (!container) return () => {};
  let disposed = false;
  const appRoot = createAppRoot(container);
  const root = createRoot(appRoot.mountPoint);
  root.render(<Clock {...props} mode={props.mode || "icon"} />);
  return () => {
    if (disposed) return;
    disposed = true;
    root.unmount();
    appRoot.cleanup();
  };
}

export default mount;
```

应用本体按标准 React 函数写法实现：

```tsx
import { useEffect, useState } from "react";
import type { ClockProps } from "./types";

const Clock = ({ mode = "icon", title, sdk }: ClockProps) => {
  const [themeId, setThemeId] = useState(sdk?.theme?.activeThemeId || "light");

  useEffect(() => {
    if (!sdk?.onThemeChange) return undefined;
    return sdk.onThemeChange((theme) => setThemeId(theme.activeThemeId));
  }, [sdk]);

  return <div className="tw:flex tw:h-full tw:w-full tw:items-center tw:justify-center">{mode === "icon" ? "Clock" : title}</div>;
};

export default Clock;
```

## 构建配置

React 应用的 `vite.config.js` 使用 Vite library mode，入口指向 TSX 文件，产物仍输出为 `index.js`：

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
  build: {
    lib: {
      entry: "src/index.tsx",
      name: "ClockApp",
      formats: ["esm"],
      fileName: () => "index.js",
    },
    outDir: "../../../dist/app-build/clock",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
```

`package.json` 的构建脚本应先做类型检查，再生成截图：

```json
{
  "scripts": {
    "build": "tsc --noEmit && vite build && pnpm run screenshots",
    "screenshots": "node ../../../scripts/capture-app-screenshots.mjs clock"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@tailwindcss/vite": "^4.1.4",
    "@vitejs/plugin-react-swc": "^3.8.0",
    "tailwindcss": "^4.1.17",
    "typescript": "~5.7.2",
    "vite": "^7.1.12"
  }
}
```

`src/style.css` 只导入 Tailwind theme/utilities，并启用前缀，避免生成全局 reset：

```css
@source "./**/*.{ts,tsx}";

@import "tailwindcss/theme" layer(theme) prefix(tw);
@import "tailwindcss/utilities" layer(utilities) prefix(tw);
```

## shadcn/ui 组件

React 模板默认提供 `Button`，路径为 `src/components/ui/button.tsx`。组件类名同样使用 `tw:` 前缀：

```tsx
import { Button } from "@/components/ui/button";

export function Actions() {
  return <Button size="sm">保存</Button>;
}
```

`components.json` 已配置 `@/*` alias；新增 shadcn/ui 风格组件时，优先放在 `src/components/ui`，通用类名合并使用 `src/lib/utils.ts` 的 `cn`。

## icon 截图

截图脚本会读取 `app.config.json`：

- `sizeConfigs` 决定需要截图的尺寸。
- `supportIconMode: false` 时跳过。
- 每个尺寸会分别生成 `light` 与 `dark` 主题截图。
- `supportAppMode: true` 会让包进入应用菜单；`appIcon.type: "custom"` 由宿主以 `mode: "appIcon"` 渲染，不要求生成额外截图。

输出示例：

```text
dist/app-build/clock/screenshots/
  manifest.json
  icon/
    icon-2x2-light.png
    icon-2x2-dark.png
```

默认使用本机 Chrome/Chromium headless。可设置 `APP_SCREENSHOT_CHROME=/path/to/chrome` 指定浏览器；无浏览器环境可设置 `APP_SCREENSHOTS=0` 跳过。

## 开发流程

1. 创建脚手架：`pnpm app:create react my-tool`。
2. 安装依赖：`pnpm install`。
3. 启动开发服务：`pnpm --filter my-tool-app dev`。
4. 在开发者应用页面填写入口 URL，例如 `http://localhost:<port>/src/index.tsx`。
5. 构建并生成 icon 截图：`pnpm --filter my-tool-app build`。
6. 打包：`pnpm app:pack my-tool`。

打包后会生成 `dist/apps/<name>-<version>.snapp`，其中包含构建后的 `index.js`、`app.config.json`、图标和 `screenshots` 目录，可上传到后台，由后台解压并提供远程入口与截图资源。

## 调试与故障排查

- 若报 `App module does not export mount`，检查入口是否导出 `mount` 或默认导出该函数。
- 若类型检查失败，先运行 `pnpm --filter <name>-app build` 查看 `tsc --noEmit` 输出。
- 若开发者页面无法加载入口，确认填写的是 Vite dev server 暴露的 TSX 入口，例如 `http://localhost:<port>/src/index.tsx`。
- 若构建产物出现裸 `react` / `react-dom` import，检查 Vite 配置是否错误配置了 React external；当前约定是 React 随应用自身打包。

## 安全说明

应用入口是远程 ESM 代码，加载后会在宿主页面权限下运行，并能访问注入的 `props.sdk`。只加载自己开发或可信来源的应用，不要导入未知 URL。
