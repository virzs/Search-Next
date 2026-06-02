# 小组件脚手架

`widgets` 目录支持通过脚手架创建 React、Vue、Solid 小组件。宿主加载协议保持一致：小组件入口必须导出 `mount(container, props)`，也可以默认导出该函数；`mount` 返回的函数会在小组件卸载时执行。

## 创建小组件

```bash
pnpm widget:create react my-clock
pnpm widget:create vue my-panel
pnpm widget:create solid my-stats
```

命令会创建 `widgets/<name>`，名称必须使用 kebab-case。生成目录包含：

```text
widgets/<name>/
  package.json
  vite.config.js
  widget.config.json
  index.html
  src/
    index.*
    Widget.*
    dev.*
    style.css
    icon.svg
```

## 开发与构建

```bash
cd widgets/<name>
pnpm install
pnpm dev
pnpm build
```

构建产物输出到 `dist/widget-build/<name>/index.js`。需要生成可导入后台的包时，在项目根目录执行：

```bash
pnpm widget:pack -- <name>
```

打包脚本会读取 `widgets/<name>/widget.config.json`，执行小组件自己的 `npm run build`，再生成 `dist/widgets/<name>-<version>.snwidget`。

## 框架约定

- React 模板复用宿主页面暴露的 `globalThis.React` 与 `globalThis.ReactDOM`，避免多个 React 实例。
- Vue 和 Solid 模板会把各自运行时打进小组件产物，不要求宿主暴露全局变量。
- 三种模板都支持 `props.mode` 的 `icon` / `full` 模式，以及 `props.sdk` 注入的宿主能力。

## 接入宿主

开发模式下，可以在应用商店的开发者页面手动添加入口 URL，例如 Vite dev server 的 `http://localhost:<port>/src/index.jsx` 或构建后的 `index.js` 地址。线上推荐上传 `.snwidget`，由后台解压并提供 `/static/widgets/...` 入口。

小组件入口是远程 ESM 代码，加载后会在宿主页面权限下运行，并能访问注入的 `props.sdk`。只加载自己开发或可信来源的小组件，不要导入未知 URL。

宿主不关心具体框架，只调用：

```js
const cleanup = mount(container, {
  mode: "icon",
  sdk,
});
```

因此新增框架时，只要保持同一个 `mount` 协议即可。
