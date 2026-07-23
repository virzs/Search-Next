# 部署与 Nginx 配置

如果不希望在服务器上从源码构建，可以直接从 [GitHub Releases](https://github.com/virzs/Search-Next/releases) 下载已构建的部署文件。

## 从 GitHub Releases 获取部署文件

进入 Releases 页面后，先选择要部署的版本，再在 **Assets** 中下载对应压缩包。完整版本使用 `v<version>` 标签，例如 `v0.14.0`；单项发布使用 `web-v<version>`、`admin-v<version>` 或 `api-v<version>` 等标签，只包含该项目的资产。

| 发布资产 | 用途 | 建议解压目录 |
| --- | --- | --- |
| `search-next-api-<version>.zip` | API 单文件构建产物 | `/var/www/search-next/api/` |
| `search-next-web-<version>.zip` | 用户端静态站点 | `/var/www/search-next/web/` |
| `search-next-admin-<version>.zip` | 管理端静态站点 | `/var/www/search-next/admin/` |
| `search-next-docs-<version>.zip` | 文档静态站点（可选） | 文档站点目录 |
| `release-manifest.json` | 记录发布项目、版本、资产名和文件大小 | 下载后用于核对 |

:::warning 不要下载源码包
GitHub 自动生成的 **Source code (zip)** 和 **Source code (tar.gz)** 是源码快照，不包含可直接上线的已构建 `dist` 资产。部署时应下载上表中的 `search-next-*.zip`。
:::

解压后请将 Web、Admin 和 API 部署到各自目录，并确保它们来自同一个版本。上线前可对照 `release-manifest.json` 检查项目名、版本、文件名和文件大小，然后再按下文配置运行环境和 Nginx。

:::warning Release 暂不包含应用与网页壁纸
当前 GitHub Releases 只用于 Web、Admin、API 和文档等部署文件，不提供 `.snapp` 应用包或 `.snwall` 网页壁纸包。应用与网页壁纸需要先克隆源码，再分别参考 [应用脚手架](/guide/app-scaffold) 和 [网页壁纸开发](/guide/wallpaper-dev) 自行打包。
:::

## 部署目录与存储

生产部署建议把 API、用户端主站、管理后台和上传目录分清楚：

```text
/var/www/search-next/
  web/                 # 用户端 dist
  admin/               # 管理端 dist
  api/                 # API 构建产物和启动目录
    assets/uploads/    # 默认本地上传目录
      apps/<name>/<version>/...
```

API 运行目录下的 `.env` 中，本地存储路径通常配置为：

```env
local_storage_path=./assets/uploads
```

应用包上传后，图标和入口文件会放在：

```text
api/assets/uploads/apps/<name>/<version>/
```

接口返回给前端的资源路径是：

```text
/static/apps/<name>/<version>/icon.svg
```

因此 Nginx 的 `/static/` 必须映射到 API 启动目录下的 `assets/uploads/`，不要映射到 `assets/uploads/apps/`。如果你把 `local_storage_path` 改成了绝对路径或共享持久化目录，Nginx 的 `alias` 也必须改成同一个目录。

## 用户端域名

```nginx
server {
  listen 80;
  server_name search.example.com;

  root /var/www/search-next/web;
  index index.html;

  # ^~ 防止面板或安全模板中的正则 location 拦截 /api/.../runtime/...。
  location ^~ /api/ {
    proxy_pass http://127.0.0.1:5151/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location ^~ /static/ {
    alias /var/www/search-next/api/assets/uploads/;
    try_files $uri =404;

    add_header Access-Control-Allow-Origin * always;
    add_header Cross-Origin-Resource-Policy cross-origin always;
  }

  location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate" always;
  }

  location ^~ /assets/ {
    try_files $uri =404;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
  }

  location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache, must-revalidate" always;
  }
}
```

## 管理端域名

如果管理端使用独立域名，需要同样配置 `/api/` 和 `/static/`：

```nginx
server {
  listen 80;
  server_name admin.example.com;

  root /var/www/search-next/admin;
  index index.html;

  # ^~ 防止面板或安全模板中的正则 location 拦截 /api/.../runtime/...。
  location ^~ /api/ {
    proxy_pass http://127.0.0.1:5151/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location ^~ /static/ {
    alias /var/www/search-next/api/assets/uploads/;
    try_files $uri =404;

    add_header Access-Control-Allow-Origin * always;
    add_header Cross-Origin-Resource-Policy cross-origin always;
  }

  location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate" always;
  }

  location ^~ /assets/ {
    try_files $uri =404;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
  }

  location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache, must-revalidate" always;
  }
}
```

## 不能直接访问上传目录时

如果 Nginx 和 API 不在同一台机器，或 Nginx 没有权限读取 API 使用的 `assets/uploads/`，可以改用反向代理：

```nginx
location ^~ /static/ {
  proxy_pass http://127.0.0.1:5151;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

这种方式不会把 API 服务域名暴露给浏览器，浏览器请求的仍然是当前前端域名下的 `/static/...`。

## SPA 路由回退

用户端主站和管理后台都是前端 SPA。`/login`、`/dashboard`、`/store/widget` 等路径不是服务器上的真实文件，而是前端路由。

主站域名和管理端域名都需要配置：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

如果缺少这段配置，直接访问或刷新 `/login`、`/dashboard` 等页面时，Nginx 会按真实文件查找，找不到就返回 404。

## 网页壁纸运行接口

网页壁纸的入口、预览和包内资源由 API 动态提供，路径形式为：

```text
/api/tabs/desktop/wallpaper/runtime/<id>/<revision>/entry
/api/tabs/desktop/wallpaper/runtime/<id>/<revision>/preview
/api/tabs/desktop/wallpaper/runtime/<id>/<revision>/assets/...
```

这些请求不使用 `/static/`，也不应直接映射网页壁纸的存储目录。API 会读取资源，并为入口 HTML 注入运行桥接代码和安全响应头。

部分面板或安全模板会自动添加拦截 `/runtime/` 目录的正则 `location`。普通的 `location /api/` 仍可能被该正则覆盖，因此用户端和管理端都应使用 `location ^~ /api/`。如果普通 API 正常，但网页壁纸运行接口返回 Nginx 的 HTML 404，可以检查完整配置：

```bash
nginx -T 2>&1 | grep -n -C 4 -i runtime
```

## 常见 404 原因

- 只给管理端配置了 `/static/`，用户端域名没有配置。
- `alias` 写成了 `assets/uploads/apps/`，导致 `/static/apps/...` 被拼成 `assets/uploads/apps/apps/...`。
- API 的 `local_storage_path` 和 Nginx 的 `alias` 指向了不同目录。
- 上传目录没有持久化，重启或重新部署后文件丢失。
- `alias` 末尾缺少 `/`。
- `/api/` 未使用 `^~`，被面板或安全模板中针对 `/runtime/` 的正则规则覆盖，导致网页壁纸入口或预览返回 Nginx HTML 404。
- 缺少 `location / { try_files $uri $uri/ /index.html; }`，导致刷新 `/login`、`/dashboard` 等前端路由 404。

上线后可以用应用图标验证：

```text
https://search.example.com/static/apps/<name>/<version>/icon.svg
https://admin.example.com/static/apps/<name>/<version>/icon.svg
```

两个地址都能访问，上传应用在用户端和管理端才都会正常显示。
