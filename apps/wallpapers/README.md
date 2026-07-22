# 网页壁纸

此目录存放 Search Next 网页壁纸的源码、授权说明和静态预览。

每个壁纸使用独立子目录，避免与 `apps/apps` 下的普通桌面应用混合，也不会参与 `build:apps`。

使用 `pnpm wallpaper:pack <name>` 打包单个壁纸，或使用 `pnpm wallpaper:pack:all` 打包全部壁纸。打包阶段文件会写入 `dist/wallpaper-build/<name>`，最终成品写入 `dist/wallpapers/<name>-<version>.snwall`。

`wallpaper.config.json` 可通过 `packageFiles` 指定需要复制进构建目录的相对文件或目录；入口和预览图始终自动包含。
