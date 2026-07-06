# 应用脚手架

`apps/apps` 目录支持通过脚手架创建 React、Vue、Solid 应用。宿主加载协议保持一致：应用入口必须导出 `mount(container, props)`，也可以默认导出该函数；`mount` 返回的函数会在应用卸载时执行。

## 创建应用

```bash
pnpm app:create react my-clock
pnpm app:create vue my-panel
pnpm app:create solid my-stats
```

命令会创建 `apps/apps/<name>`，名称必须使用 kebab-case。生成目录包含：

```text
apps/apps/<name>/
  package.json
  vite.config.js
  app.config.json
  tsconfig.json
  index.html
  src/
    index.tsx
    App.tsx
    dev.tsx
    types.ts
    vite-env.d.ts
    style.css
    icon.svg
```

## 开发与构建

```bash
pnpm install
pnpm --filter <name>-app dev
pnpm --filter <name>-app build
```

构建产物输出到 `dist/app-build/<name>/index.js`。构建完成后会读取 `app.config.json` 的 `sizeConfigs`，为 icon 模式生成每个尺寸与浅/深主题组合的截图，输出到 `dist/app-build/<name>/screenshots/icon`，并写入 `screenshots/manifest.json`。需要生成可导入后台的包时，在项目根目录执行：

```bash
pnpm app:pack <name>
```

打包脚本会读取 `apps/apps/<name>/app.config.json`，通过 pnpm workspace 执行应用自己的 `build`，确保截图清单已生成，再把构建目录完整写入 `dist/apps/<name>-<version>.snapp`。其中 `screenshots/manifest.json` 和 `screenshots/icon/*.png` 会随包一起发布。

## 框架约定

- React 模板默认使用 TypeScript/TSX，并在构建前执行 `tsc --noEmit` 做类型检查。
- React 模板默认接入 Tailwind CSS utilities 和 shadcn/ui 风格的本地组件，使用 `tw:` 前缀类名；模板只导入 theme/utilities，不导入全局 preflight/base，打包后的样式会随应用注入到容器内。
- React 模板内置 `components.json`、`src/lib/utils.ts` 和 `src/components/ui/button.tsx`，新增 UI 组件时优先沿用 `src/components/ui` 目录。
- React、Vue 和 Solid 模板都会把各自运行时打进应用产物，不要求宿主暴露全局变量，避免不同框架或不同版本依赖互相冲突。
- 三种模板都支持 `props.mode` 的 `icon` / `appIcon` / `full` / `settings` 模式，以及 `props.sdk` 注入的宿主能力。
- `app.config.json` 可通过 `supportAppMode: true` 显式进入应用菜单；`appIcon` 支持 `{ "type": "image", "src": "icon.svg" }` 或 `{ "type": "custom" }`，后者会由宿主用 `mode: "appIcon"` 渲染入口。

## 接入宿主

开发模式下，可以在应用商店的开发者页面手动添加入口 URL，例如 React Vite dev server 的 `http://localhost:<port>/src/index.tsx` 或构建后的 `index.js` 地址。线上推荐上传 `.snapp`，由后台解压并提供 `/static/apps/...` 入口。

应用入口是远程 ESM 代码，加载后会在宿主页面权限下运行，并能访问注入的 `props.sdk`。只加载自己开发或可信来源的应用，不要导入未知 URL。

宿主不关心具体框架，只调用：

```js
const cleanup = mount(container, {
  mode: "icon",
  sdk,
});
```

因此新增框架时，只要保持同一个 `mount` 协议即可。
