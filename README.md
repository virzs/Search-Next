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

## 插件

规划中，预计采用微前端方案

[Search Next Plugins](https://github.com/virzs/Search-Next-Plugins)

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

## 版权说明

### GPL-3.0 License

由 [Vir](https://github.com/virzs) 维护的 `Search-Next` 仓库及后端u你代码仓库默认遵循`GPL-3.0` 协议开源发布

下面简述由 `GPL-3.0` 带来的约束条款( 本处解释若无特别说明无 法律效益, 仅仅帮助了解协议大体内容, `GPL-3.0` 最终解释权应当归属自由软件基金会 )

1、确保软件自始至终都以开放源代码形式发布，保护开发成果不被窃取用作商业发售。任何一套软 件，只要其中使用了受 GPL 协议保护的第三方软件的源程序，并向非开发人员发布时，软件本身也就自动成为受 GPL 保护并且约束的实体。也就是说，此时它必须开放源代码。

2、GPL 大致就是一个左侧版权（Copyleft，或译为“反版权”、“版权属左”、“版权所无”、“版责”等）的体现。你可以去掉所有原作的版权 信息，只要你保持开源，并且随源代码、二进制版附上 GPL 的许可证就行，让后人可以很明确地得知此软件的授权信息。GPL 精髓就是，只要使软件在完整开源 的情况下，尽可能使使用者得到自由发挥的空间，使软件得到更快更好的发展。

3、无论软件以何种形式发布，都必须同时附上源代码。例如在 Web 上提供下载，就必须在二进制版本（如果有的话）下载的同一个页面，清楚地提供源代码下载的链接。如果以光盘形式发布，就必须同时附上源文件的光盘。

4、开发或维护遵循 GPL 协议开发的软件的公司或个人，可以对使用者收取一定的服务费用。但还是一句老话——必须无偿提供软件的完整源代码，不得将源代码与服务做捆绑或任何变相捆绑销售。

### 附加条款

此附加条款符合 `GPL-3.0` 协议并具有法律效益

禁止歪曲或隐藏代码的来源, 对于代码的所有修改, 要以合理形式标示出和原版的区别
禁止假借原作者名号, 进行包括但不限于宣传 销售的行为
我页面中必须出现带有完整原版权声明的文字, 并放置在醒目的位置
除此之外使用本项目造成的各种问题 纠纷, 原作者皆不负责
只要你遵循上述条款规定，您就可以自由使用并传播本源代码
