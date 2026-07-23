# 部署与开发

这一部分面向部署人员和应用开发者。日常产品使用请从 [Web 端快速开始](/web/) 阅读；内容与权限配置请从 [Admin 端概览](/admin/) 阅读。

## 文档导航

| 文档 | 适用场景 |
| --- | --- |
| [部署与 Nginx 配置](/guide/deployment) | 部署 Web、Admin、API 与上传资源，处理 SPA 刷新和资源 404 |
| [应用脚手架](/guide/app-scaffold) | 创建符合 Search Next 约定的应用项目 |
| [React 应用开发](/guide/react-app-dev) | 开发、调试和打包 React 应用 |

> **建议顺序**
>
> 首次上线先完成 API 与静态资源映射，再部署 Web、Admin 和本说明站点。上线后分别验证 Web、Admin 的 `/api/`、`/static/` 与 SPA 深层路由。
