# 部署与 Nginx 配置

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
