# React 小组件开发流程（基于纯 ESM 与宿主共享 React）

本文档介绍如何在本项目中开发、构建和集成 React 小组件（Widget）。小组件以“外部 ESM 模块”的形式动态加载，并复用宿主项目的 React/ReactDOM（不将 React 打包入小组件），以降低体积、避免多个 React 实例。

## 目标与约定
- 小组件必须导出 `mount(container, props)` 函数（或默认导出为该函数）。
- 小组件在运行时通过 `globalThis.React` 与 `globalThis.ReactDOM` 使用宿主的 React。
- 构建产物是浏览器可直接加载的 ESM 单文件：`public/widgets/<name>/index.js`。
- 组件需支持两种显示模式：`icon`（桌面图标位置展示）与 `full`（窗口内全屏展示）。

## 目录结构
小组件统一放在 `widgets/<name>` 目录，例如时钟：

```
widgets/
  clock/
    package.json
    vite.config.js
    src/
      index.jsx
```

构建输出位于：`public/widgets/clock/index.js`

## 宿主项目准备
宿主项目在 `src/main.tsx` 中暴露全局变量，供小组件复用：

```ts
import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
(globalThis as any).React = (globalThis as any).React || React;
(globalThis as any).ReactDOM = (globalThis as any).ReactDOM || ReactDOMClient;
```

## 小组件示例（不打包 React）
`widgets/clock/src/index.jsx` 采用 `createElement`，避免 JSX 依赖 `react/jsx-runtime`：

```js
function pad(n) { return n.toString().padStart(2, '0'); }

function Clock({ mode = 'icon', title }) {
  const React = globalThis.React;
  const { useEffect, useState, createElement } = React;
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  const isIcon = mode === 'icon';
  return createElement('div', { style: {/* ...样式略 */} },
    /* 子元素略 */
  );
}

export function mount(container, props = {}) {
  const React = globalThis.React;
  const ReactDOM = globalThis.ReactDOM;
  if (!container || !React || !ReactDOM) return () => {};
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(Clock, { mode: props.mode || 'icon', title: props.title }));
  return () => root.unmount();
}
```

## 构建配置
`widgets/clock/vite.config.js`：

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: { port: 3002, host: true },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}',
    'process': '{}',
  },
  build: {
    lib: { entry: 'src/index.jsx', name: 'ClockWidget', formats: ['esm'], fileName: () => 'index.js' },
    outDir: '../../public/widgets/clock',
    rollupOptions: { external: ['react', 'react-dom/client', 'react/jsx-runtime'], output: { inlineDynamicImports: true } },
  },
});
```

说明：
- `define` 替换可消除对 `process` 的依赖，避免浏览器报错。
- 标记 `react`/`react-dom/client`/`react/jsx-runtime` 为 external，确保库构建时不打包 React（注意：库源码不应直接 `import react`，否则产物会残留裸模块导入）。
- `inlineDynamicImports` 保证产物单文件，便于直接通过 `<origin>/widgets/<name>/index.js` 加载。

## 集成到桌面
通过 `PureWidget` 动态加载外部 ESM：

```tsx
<PureWidget config={{ entry: '/widgets/clock/index.js', props: { title: '时钟' }, mode: 'icon' }} />
```

或在桌面初始化时注入默认小组件（示例见 `src/pages/index/index.tsx` 中的默认注入逻辑）。

## 开发流程
1. 在 `widgets/<name>` 创建目录与基础文件（参考 `widgets/clock`）。
2. 组件代码导出 `mount`，使用 `globalThis.React/ReactDOM`，避免 `import react` 与 JSX。
3. 运行构建：在 `widgets/<name>` 目录执行 `pnpm build`（不在任务末尾自动运行）。
4. 确认生成 `public/widgets/<name>/index.js`。
5. 在宿主使用 `PureWidget` 指向该路径进行加载。

## 模式与交互
- `icon`：用于桌面图标展示，尺寸较小；应尽量避免复杂交互与大体积依赖。
- `full`：用于窗口内完整展示。

## 调试与故障排查
- 若浏览器报 `process is not defined`，确认构建配置里的 `define` 已设置。
- 若报 `Widget module does not export mount`，检查是否正确导出 `mount` 或默认导出。
- 若报找不到 React，全局未暴露：确认 `src/main.tsx` 已设置 `globalThis.React/ReactDOM`。
- 产物体积异常大：检查是否误用 JSX 或引入 React 导致打包入内，改用 `createElement`。

## 新建小组件建议
- 复用宿主的图标、主题与样式，保持一致体验。
- 尽量无第三方依赖，或使用灵活替代（例如纯 DOM 渲染或内联逻辑）。
- 输出 API 简洁稳定：`mount(container, props) -> unmount()`。

## 单独启动与本地开发
小组件支持在其目录下独立启动开发服务器，便于脱离宿主调试：

- 安装依赖：在 `widgets/<name>` 执行 `pnpm i`（已在 `devDependencies` 中声明 `react` 与 `react-dom`）。
- 进入目录并启动：`pnpm dev`（默认端口 `3002`，可在 `vite.config.js` 修改）。
- 开发页：`widgets/clock/index.html` 使用本地模块导入 `react` 与 `react-dom/client`，并注入到 `globalThis` 后调用 `mount` 在两个容器中展示 `icon` 与 `full` 模式。
- 预览：`pnpm preview` 可在本地预览构建后的静态资源。

注意：
- 单独启动仅用于开发调试；生产环境仍建议构建为单文件 ESM 并由宿主的 `PureWidget` 动态加载。
- 库源码请避免 `import react` 或 JSX，以防构建产物残留裸模块导入；若需要 JSX，请在生产构建前改回 `createElement` 模式或确保 external 导入不会影响浏览器直接加载。