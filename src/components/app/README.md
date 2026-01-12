# 默认应用组件

该目录提供“默认应用”通用的布局、侧边栏、路由叠层与过渡动画能力，供各个默认应用（如 store/theme/settings 等）复用。

## 目录说明

- content-container：应用内容容器，提供标题区/返回按钮/内容区域的通用布局
- responsive-overlay：基于响应式断点的 Overlay 容器（通常用于移动端 Drawer/Modal 形态）
- routed-container：带侧边栏与内容区的通用容器，配合 responsive-overlay 使用
- routed-overlay：基于 react-router Outlet 的“叠层应用”容器，支持侧边栏菜单、搜索、keep-alive 与路由上下文
- router：路由叠层与过渡动画基础组件
- segmented：应用内分段切换 UI（如顶部 Tabs/Segmented）
- sidebar：应用侧边栏（菜单 + 搜索）

## router 组件

- stacked-drawer-outlet：将路由 Outlet 作为“抽屉式”前后层切换，适合从列表进入详情的推进/返回过渡
- stacked-fade-outlet：将路由 Outlet 以“淡入淡出”方式叠层切换，适合 overlay 场景的轻量过渡
- stacked-fade-route-layout：在 base 与 outlet 间做淡出切换，并支持在指定值变化时自动关闭 overlay
- stacked-fade-stack：对任意 element 做淡入淡出叠层（不依赖 react-router）
- route-context：用于 routed-overlay 的路由上下文 Provider 与 hook（useAppRouteContext）

## 命名规范

- 目录名：kebab-case（xxx-xxx）
- 文件名：kebab-case（xxx-xxx.ts/tsx）
- 组件目录入口文件保持为 index.tsx，用于简化导入路径
