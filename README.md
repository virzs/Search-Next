# Search 导航页

![stars](https://img.shields.io/github/stars/virzs/Search-Next) ![forks](https://img.shields.io/github/forks/virzs/Search-Next)

```
公共组件库 🎉    公共后端接口 🎉    公共后台 🎉    第三方组件库 ⏳
      |                  |                  |                  |
      |                  |                  |                  |
      +------------------+------------------+------------------+
                         |
                         |
                         v
                    本项目 🚧

```

> 状态说明：
>
> - 🚧 开发中
> - ⏳ 等待中
> - 🎉 已完成
>
> 公共组件库地址：https://zs-library.virs.xyz/

## 在线地址

<https://search_next.virs.xyz/>

2x 正在开发中，查看历史版本请切换至 1x 分支

后端部分暂不开源，待项目稳定后发布

## 功能说明

- 账号 🎉
- 图标排序配置 🎉
- 搜索建议 🚧
- 添加自定义网站 🚧
- 自定义主题 🚧
- 自定义壁纸 🚧
- 数据同步 🚧
- 插件系统 🚧
- 移动端支持 ⏳
- AI 搜索 ⏳

## 版本说明

- 1.x 分支 1.x
- 2.x 分支 2.x

## 在线交流

Discord: https://discord.gg/NRMxAmqG

QQ 群：859791575

欢迎提供意见或建议

## 启动项目

需要 nodejs（版本不限，建议最新）、pnpm。当前仓库已调整为 pnpm workspace，多项目依赖统一在仓库根目录安装。

安装依赖：

```bash
pnpm install
```

启动项目：

```bash
pnpm dev
```

编译项目：

```bash
pnpm build
```

## 小组件开发

项目内置 `apps/widgets/<name>` 小组件工作流。小组件需要导出 `mount(container, props = {})`，并返回清理函数；打包产物入口固定为 `index.js`，清单文件 `widget.config.json` 的 `entry` 也应保持为 `index.js`。

创建脚手架：

```bash
pnpm widget:create react my-widget
pnpm widget:create vue my-widget
pnpm widget:create solid my-widget
```

脚手架会生成 `apps/widgets/<name>/package.json`、`vite.config.js`、`widget.config.json`、`src/index`、组件、样式、图标和本地开发页。React 模板沿用宿主全局 `React`/`ReactDOM`，不会把 React 打进小组件；Vue 和 Solid 模板会随小组件打包各自运行时。

安装依赖并启动某个小组件：

```bash
pnpm install
pnpm --filter my-widget-widget dev
```

构建某个小组件：

```bash
pnpm --filter my-widget-widget build
```

构建输出位于 `dist/widget-build/<name>/index.js`。生成 `.snwidget`：

```bash
pnpm widget:pack my-widget
```

该命令会通过 pnpm workspace 执行对应小组件的 `build`，复制 `widget.config.json`，并输出到 `dist/widgets/<name>-<version>.snwidget`。生成后可在开发者小组件页面填写后端解压后的远程入口进行调试。

注意：小组件入口是远程 ESM 代码，会在宿主页面权限下运行并访问注入的 SDK。仅加载自己开发或可信来源的小组件。

## 常见问题说明

待更新

## 插件

规划中，预计采用微前端方案

[Search Next Plugins](https://github.com/virzs/Search-Next-Plugins)

## 后端支持

待更新，不开源，提供构建后的文件

**多语言：**

VS Code 安装 i18n Ally 插件

## 引用资源

-----none------
