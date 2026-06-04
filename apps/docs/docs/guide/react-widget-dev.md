# React 小组件开发流程（TSX 与自带运行时）

本文档介绍如何在本项目中开发、构建和集成 React 小组件。React 小组件以远程 ESM 模块形式动态加载，入口导出 `mount(container, props)`；React 与 ReactDOM 随小组件自身打包，避免依赖宿主页面全局变量，也避免不同框架或不同版本依赖互相冲突。

## 目标与约定

- 小组件必须导出 `mount(container, props)` 函数，也可以默认导出该函数。
- React 小组件默认使用 TypeScript/TSX，构建前执行 `tsc --noEmit` 做类型检查。
- React 小组件默认接入 Tailwind CSS utilities，组件内使用 `tw:` 前缀类名。
- 样式文件只导入 Tailwind utilities，不导入全局 preflight/base；入口会把编译后的样式注入小组件容器，减少宿主页面样式干扰。
- 构建产物入口固定为 `dist/widget-build/<name>/index.js`。
- 组件需支持两种显示模式：`icon`（桌面图标位置展示）与 `full`（窗口内完整展示）。
- 组件通过 `props.sdk` 获取宿主注入的主题、storage、事件等能力。

## 目录结构

小组件统一放在 `apps/widgets/<name>` 目录，例如时钟：

```text
apps/widgets/
  clock/
    package.json
    tsconfig.json
    vite.config.js
    widget.config.json
    index.html
    src/
      index.tsx
      Clock.tsx
      types.ts
      vite-env.d.ts
      style.css
      icon.svg
```

构建输出位于：`dist/widget-build/clock/index.js`。

## 入口协议

入口文件负责把 React 组件挂载到宿主传入的隔离容器。宿主会强制为每个小组件创建 Shadow DOM，入口只需要在传入容器内注入样式并创建自己的 React 挂载点：

```tsx
import { createRoot } from "react-dom/client";
import Clock from "./Clock";
import styleText from "./style.css?inline";
import type { ClockProps } from "./types";

const createWidgetRoot = (container: HTMLElement) => {
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
  const widgetRoot = createWidgetRoot(container);
  const root = createRoot(widgetRoot.mountPoint);
  root.render(<Clock {...props} mode={props.mode || "icon"} />);
  return () => {
    if (disposed) return;
    disposed = true;
    root.unmount();
    widgetRoot.cleanup();
  };
}

export default mount;
```

组件本体按标准函数组件写法实现：

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

React 小组件的 `vite.config.js` 使用 Vite library mode，入口指向 TSX 文件，产物仍输出为 `index.js`：

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: "src/index.tsx",
      name: "ClockWidget",
      formats: ["esm"],
      fileName: () => "index.js",
    },
    outDir: "../../../dist/widget-build/clock",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
```

`package.json` 的构建脚本应先做类型检查：

```json
{
  "scripts": {
    "build": "tsc --noEmit && vite build"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
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

`src/style.css` 只导入 Tailwind utilities，并启用前缀，避免生成全局 reset：

```css
@import "tailwindcss/utilities" prefix(tw);

@source "./**/*.{ts,tsx}";
```

## 开发流程

1. 创建脚手架：`pnpm widget:create react my-widget`。
2. 安装依赖：`pnpm install`。
3. 启动开发服务：`pnpm --filter my-widget-widget dev`。
4. 在开发者小组件页面填写入口 URL，例如 `http://localhost:<port>/src/index.tsx`。
5. 构建：`pnpm --filter my-widget-widget build`。
6. 打包：`pnpm widget:pack my-widget`。

打包后会生成 `dist/widgets/<name>-<version>.snwidget`，可上传到后台，由后台解压并提供远程入口。

## 调试与故障排查

- 若报 `Widget module does not export mount`，检查入口是否导出 `mount` 或默认导出该函数。
- 若类型检查失败，先运行 `pnpm --filter <name>-widget build` 查看 `tsc --noEmit` 输出。
- 若开发者页面无法加载入口，确认填写的是 Vite dev server 暴露的 TSX 入口，例如 `http://localhost:<port>/src/index.tsx`。
- 若构建产物出现裸 `react` / `react-dom` import，检查 Vite 配置是否错误配置了 React external；当前约定是 React 随小组件自身打包。

## 安全说明

小组件入口是远程 ESM 代码，加载后会在宿主页面权限下运行，并能访问注入的 `props.sdk`。只加载自己开发或可信来源的小组件，不要导入未知 URL。
