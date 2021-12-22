# Search导航页Next版

## **原项目：**[Search](https://github.com/virzs/Search)

Search项目的React版本，相较于原项目从原生js更改为React，引入新的设计和交互，原项目已实现或未实现的内容将移植到此项目,并且此项目将加入更多新功能。

## 在线地址

[Search Next](http://dev.search.virs.xyz)

在线地址中内容可能不会保持最新，如需查看最新效果请clone该项目运行。

另外，在线地址中为开发环境，仅用于展示功能，不保证数据在每个版本兼容。

## 在线交流

QQ群：859791575

欢迎提供意见或建议

## 启动项目

需要nodejs（版本不限，建议最新）、yarn（npm也可以）

安装依赖：

```bash
yarn
```

启动项目：

```bash
yarn dev
```

编译项目：

```bash
yarn build
```

代码重复率分析：

``` bash
yarn jscpd
```

部署项目：

项目需要后端接口支持，后端部分详见文末说明。

## 截图（21/11/2）

![image-20211102144351320](https://raw.githubusercontent.com/virzs/cloud/project/img/202111021443364.png)

![image-20211102144434101](https://raw.githubusercontent.com/virzs/cloud/project/img/202111021444272.png)

![image-20211102144456377](https://raw.githubusercontent.com/virzs/cloud/project/img/202111021444525.png)

![image-20211102144519551](https://raw.githubusercontent.com/virzs/cloud/project/img/202111021445686.png)

![image-20211102144540528](https://raw.githubusercontent.com/virzs/cloud/project/img/202111021445722.png)

[历史截图](./docs/历史版本图片.md)

## Star趋势

[![Stargazers over time](https://starchart.cc/virzs/Search-Next.svg)](https://starchart.cc/virzs/Search-Next)

## 开发计划

详细内容请查看[开发计划](https://github.com/virzs/Search-Next/projects)

## 常见问题说明

为什么不支持在线账号？

- 服务器需要成本
- 目前处于开发过程中，功能变动比较多
- 涉及到在线账号等功能，需要为用户负责，目前没有太多精力专注在此方面

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
