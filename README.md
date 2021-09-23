# Search导航页Next版

## **原项目：**[Search](https://github.com/virzs/Search)

Search项目的React版本，相较于原项目从原生js更改为React，引入新的设计和交互，原项目已实现或未实现的内容将移植到此项目,并且此项目将加入更多新功能。

## 在线地址

[Search Next](http://dev.search.virs.xyz)

在线地址中内容可能不会保持最新，如需查看最新效果请clone该项目运行。

另外，在线地址中为开发环境，仅用于展示功能，不保证数据在每个版本兼容。

## 开发计划

详细内容请查看[开发计划](https://github.com/virzs/Search-Next/projects)

## 启动项目

需要nodejs（版本不限，建议最新）、yarn（npm也可以）

安装依赖：

```bash
yarn
```

启动项目：

```bash
yarn start
```

编译项目：

```bash
yarn build
```

部署项目：

项目需要后端接口支持，后端部分详见文末说明。

## 功能

- 搜索
  - 切换搜索引擎
- 添加常用网址
- 设置
  - 切换背景（数据来源必应壁纸，分辨率1920x1080，每日更新一张新壁纸）
- 首次进入消息提示
- 导航页

## 截图（21/8/28）

支持导航功能

![image-20210828222701576](http://imgs.virs.xyz/image-20210828222701576.png)

![image-20210828222751416](http://imgs.virs.xyz/image-20210828222751416.png)

21/7/8

支持设置主页背景功能

![image-20210708104121952](http://imgs.virs.xyz/image-20210708104121952.png)

![image-20210708104145358](http://imgs.virs.xyz/image-20210708104145358.png)

21/6/3

支持首次进入消息提示功能

![屏幕截图 2021-06-03 155137.png](http://imgs.virs.xyz/searchreactindex)

21/4/2

支持基础搜索功能，切换搜索引擎

![image-20210402152903082](http://imgs.virs.xyz/searchreact210402.png)

## 组件说明

组件文件夹路径 `src/components`

- `material-ui-custom` 基于业务封装的 `material ui` 组件，如：`form 表单`、`card 卡片`、`dialog 对话框`、`popper 弹出提示工具`、`notistack 消息条`、`tabs 选项卡` 等。
- `global` 通用组件
- 其他组件

## 后端支持

部分内容需要配合该项目的后端接口部分

地址：[Search-Next-Nestjs-api](https://github.com/virzs/Search-Next-Nestjs-api)

新建 `development.env` 文件，按 `.env.example` 文件中内容配置

安装依赖 `yarn`

运行 `yarn start:dev`

其他命令详见后端项目

关于打包运行，可以参考

[nestJs项目打包部署的方法](https://www.cnblogs.com/xianxiaobo/p/12162309.html)

**多语言：**

VS Code 安装i18n Ally插件

## 引用资源

-----none------
