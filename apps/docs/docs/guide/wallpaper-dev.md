# 网页壁纸开发与打包

网页壁纸是运行在 Search Next 桌面背景中的离线 Web 页面。源码统一放在 `apps/wallpapers/<name>`，打包后生成可由 Admin 端上传的 `.snwall` 文件。

:::warning 当前需要从源码打包
GitHub Releases 暂不提供 `.snwall` 网页壁纸成品。开发或使用仓库内置网页壁纸时，需要先克隆源码并在本地打包。
:::

## 获取源码与安装依赖

```bash
git clone https://github.com/virzs/Search-Next.git
cd Search-Next
pnpm install --frozen-lockfile
```

所有命令都应在仓库根目录执行。可以复制现有壁纸作为参考，也可以创建一个新的 kebab-case 目录：

```text
apps/wallpapers/my-wallpaper/
  wallpaper.config.json
  index.html
  preview.webp
  assets/
```

## 配置文件

每个网页壁纸必须在目录根部提供 `wallpaper.config.json`：

```json
{
  "schemaVersion": 1,
  "name": "my-wallpaper",
  "version": "1.0.0",
  "entry": "index.html",
  "preview": "preview.webp",
  "packageFiles": ["assets"],
  "author": "Your Name",
  "projectUrl": "https://github.com/example/my-wallpaper",
  "description": "一个离线网页壁纸。"
}
```

配置约定：

- `name` 必须使用小写 kebab-case，并与目录名保持一致。
- `schemaVersion` 当前固定为 `1`。
- `entry` 是唯一的 HTML 入口，`preview` 是后台和 Web 端使用的静态预览图。
- `entry` 和 `preview` 会自动加入包内；其他 CSS、JavaScript、图片、字体、音视频或 WASM 资源通过 `packageFiles` 声明，可填写文件或目录。
- 所有路径必须是壁纸目录内的安全相对路径，不能使用绝对路径或 `..`。
- `projectUrl` 使用 HTTPS 地址，便于后台展示来源与授权信息。

## 本地开发与预览

网页壁纸可以使用仓库内的 Vite 启动静态开发服务器：

```bash
pnpm exec vite apps/wallpapers/my-wallpaper
```

根据终端输出打开本地地址，检查入口页面、动画、图片和字体是否正常。开发时还应确认：

- 页面在不同宽高下铺满容器，不依赖固定屏幕尺寸。
- 所有运行资源均在本地包内，不请求 CDN、在线字体、远程脚本或第三方接口。
- 页面不可依赖 Cookie、Local Storage 或宿主页面同源权限。
- 动画能够响应减少动态效果和页面可见性变化，页面隐藏时暂停不必要的渲染与音频。

实际运行时，壁纸位于无同源权限的沙箱 iframe 中。宿主通过 `search-next-wallpaper-v1` 消息通道同步主题、语言、减少动态效果和可见性状态；直接在浏览器预览时没有这些宿主消息，因此还需要在上传后进行一次集成验证。

## 构建与打包

打包单个网页壁纸：

```bash
pnpm wallpaper:pack my-wallpaper
```

打包全部网页壁纸：

```bash
pnpm wallpaper:pack:all
```

打包流程会读取配置并复制入口、预览图和 `packageFiles`，然后进行离线包校验。输出目录为：

```text
dist/wallpaper-build/my-wallpaper/          # 打包阶段文件
dist/wallpapers/my-wallpaper-1.0.0.snwall   # 最终上传包
```

`.snwall` 包需满足以下限制：

- 包内恰好有一个 HTML 文件，并且与 `entry` 一致。
- 文件总数不超过 500 个。
- 未压缩总大小不超过 80 MB，最终压缩包不超过 30 MB。
- 支持 HTML、CSS、JavaScript、JSON、图片、字体、音视频、WASM 等静态文件；不支持的文件扩展名会导致打包失败。

## 上传与验证

在 Admin 端进入 **新标签页 → 壁纸**，新增或编辑“网页壁纸”，上传：

```text
dist/wallpapers/<name>-<version>.snwall
```

后台会读取包内名称、版本、简介、作者、项目地址、入口和预览图。保存并启用后，在 Web 端完成以下检查：

1. 壁纸列表中的静态预览图可以显示。
2. 选中壁纸后，入口页面和所有包内资源可以加载。
3. 浅色/深色主题、窗口尺寸变化与减少动态效果状态表现正常。
4. 切换到其他标签页后高消耗动画和音频会暂停或降频。

如果上传成功但入口或预览返回 404，请检查 [部署与 Nginx 配置中的网页壁纸运行接口](/guide/deployment#网页壁纸运行接口)，不要把网页壁纸运行目录直接映射到 `/static/`。
