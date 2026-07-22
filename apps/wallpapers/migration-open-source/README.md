# Migration / 候鸟 · Search Next 网页壁纸

这是 [Migration-OpenSource](https://github.com/sdhhhyu-glitch/Migration-OpenSource) 的 Search Next `.snwall` 网页壁纸适配版本。

- 作者：Tukine（GitHub: `sdhhhyu-glitch`）
- 项目地址：https://github.com/sdhhhyu-glitch/Migration-OpenSource
- 原项目简介：使用 HTML5 Canvas 与原生 JavaScript 实现的 3D 生成艺术体验，结合自研渲染管线、Boids 鸟群算法、低多边形环境和沉浸式镜头，呈现候鸟跨越不同气候与地貌的迁徙。
- 许可：MIT，完整许可见 [LICENSE](./LICENSE)。

## 壁纸适配

- 页面加载后自动开始迁徙，并保持自动镜头和自动场景过渡。
- 移除了开始、开局场景、自由镜头、音乐、诗句开关、全屏、横屏锁定和屏幕常亮等手动操作。
- 保留桌面空白区域中的鼠标/触控鸟群跟随反馈。
- 不发起外部网络请求；音频资源保留在源码目录用于尊重原项目结构，但不会在壁纸运行时播放，也不会打入 `.snwall`。
- 接收 `search-next-wallpaper-v1` 环境消息，在页面不可见时暂停时间推进。

## 文件

- `index.html`：自动运行的壁纸入口。
- `wallpaper.config.json`：包含作者、项目地址和简介的网页壁纸清单。
- `preview.webp`：Web 与 Admin 使用的静态预览图。
- `README.upstream.md`、`LICENSE`、`assets/`：上游项目说明、许可证和原始音频资源。

运行 `pnpm wallpaper:pack migration-open-source` 后，可上传的成品位于 `dist/wallpapers/migration-open-source-1.0.0.snwall`，打包阶段文件位于 `dist/wallpaper-build/migration-open-source`。
