# 部署与开发

这一部分面向部署人员和应用开发者。日常产品使用请从 [Web 端快速开始](/web/) 阅读；内容与权限配置请从 [Admin 端概览](/admin/) 阅读。

## 文档导航

| 文档 | 适用场景 |
| --- | --- |
| [部署与 Nginx 配置](/guide/deployment) | 部署 Web、Admin、API 与上传资源，处理 SPA 刷新和资源 404 |
| [应用脚手架](/guide/app-scaffold) | 从源码创建、开发、构建并打包 `.snapp` 应用 |
| [React 应用开发](/guide/react-app-dev) | 开发、调试和打包 React 应用 |
| [网页壁纸开发](/guide/wallpaper-dev) | 开发、预览并打包 `.snwall` 网页壁纸 |

> **建议顺序**
>
> 首次上线先完成 API 与静态资源映射，再部署 Web、Admin 和本说明站点。上线后分别验证 Web、Admin 的 `/api/`、`/static/` 与 SPA 深层路由。

:::warning 应用与网页壁纸需要自行打包
当前 GitHub Releases 不提供 `.snapp` 应用包和 `.snwall` 网页壁纸包。需要使用这些扩展内容时，请先克隆项目源码，再按照对应开发文档构建和打包。
:::
