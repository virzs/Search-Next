# 应用模板说明

`scripts/app-templates` 存放 `pnpm app:create <framework> <name>` 使用的模板。模板会被复制到 `apps/apps/<name>`，并替换 `__APP_NAME__`、`__APP_DISPLAY_NAME__`、`__APP_CLASS_NAME__` 和 `__APP_PACKAGE_NAME__` 占位符。

## 默认技术栈

- React 模板默认使用 TypeScript/TSX、Tailwind CSS v4 utilities 和 shadcn/ui 风格的本地组件。
- Tailwind CSS 使用 `tw:` 前缀，只导入 `theme` 与 `utilities`，不导入全局 preflight/base。
- shadcn/ui 组件放在 `src/components/ui`，通用 `cn` 工具放在 `src/lib/utils.ts`，并通过 `@/*` alias 引用。
- Vue 与 Solid 模板保持各自框架的标准组件写法；需要 Tailwind 或 shadcn 风格组件时，可参考 React 模板的样式隔离和组件目录约定迁移。
- 模板内置基于 `i18next` 的本地 i18n 文件。资源放在 `src/i18n/locales/zh-CN.*` 与 `src/i18n/locales/en-US.*`，key 使用简短英文结构 key。

## 应用协议

每个应用入口必须导出 `mount(container, props = {})`，也可以默认导出该函数。`mount` 需要返回清理函数。宿主会传入：

- `props.mode`: `icon` / `full` / `settings`
- `props.pagePath`: 设置页等内部路由路径
- `props.title`: 展示名称
- `props.sdk`: 主题、语言、storage、事件、toast 等宿主能力

宿主会通过 `props.sdk.locale`、`props.sdk.getLocale()` 或 `props.sdk.onLocaleChange(callback)` 传入当前语言；没有宿主 SDK 的独立网页部署会读取 URL `lang`/`locale`、本地存储和浏览器语言，并且需要自行把 storage、事件、toast 等 SDK 相关能力视为不可用或 no-op。

React 模板入口会把编译后的 Tailwind 样式注入应用容器，避免污染宿主页面或其他应用。

## 构建截图

模板的 `build` 会在 Vite 构建后执行：

```bash
pnpm run screenshots
```

截图脚本读取 `apps/apps/<name>/app.config.json` 中的 `sizeConfigs`，并为 icon 模式生成 `sizeConfigs x light/dark` 的所有截图：

```text
dist/app-build/<name>/screenshots/
  manifest.json
  icon/
    icon-2x2-light.png
    icon-2x2-dark.png
    ...
```

默认使用本机 Chrome/Chromium headless。可通过 `APP_SCREENSHOT_CHROME=/path/to/chrome` 指定浏览器；在无浏览器环境中可设置 `APP_SCREENSHOTS=0` 跳过截图。

## 打包截图

`pnpm app:pack <name>` 会 zip 整个 `dist/app-build/<name>` 目录，所以 `screenshots/manifest.json` 和 `screenshots/icon/*.png` 会进入最终的 `.snapp` 文件。若构建后没有发现截图清单，打包脚本会在写入 `.snapp` 前补跑一次截图生成。
