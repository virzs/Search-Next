# Search导航页React版

## **原项目：**[Search](https://github.com/virzs/Search)

Search项目的React版本，相较于原项目从原生js更改为React，方便更多的开发，同时支持多语言切换，原项目已实现或未实现的内容将移植到此项目。相较于原项目，此项目计划更换更美观的页面，更多的功能，甚至在后期支持登录同步。

## 启动项目

安装依赖：

```bash
$ yarn
```

启动项目：

```bash
$ yarn start
```

编译项目：

```bash
$ yarn build
```

## 截图（21/4/2）

![image-20210402152903082](http://imgs.virs.xyz/searchreact210402.png)

## 已确定的功能

**多语言：**

整体配置位置：`src/locales`

`locale.ts`文件中配置了默认的两种语言 ”中文“ 和 ”English“。

1. 添加语言：
   `selectLocalesValue`数组中新增同默认格式的配置
   默认导出的数组中为每一项配置新的`key&value`
   例：`zhCN: '中文'`
   然后新增一个对应语言的ts文件，参考默认的zh-CN.ts文件

2. 增加字段：
   例：

   ```
   {
   	id: 'Text',
   	zhCN: '文本',
   	enUS: 'Text'
   }
   ```

3. 使用：

   ```typescript
   import { useIntl } from 'react-intl';
   const intl = useIntl();
   
   intl.formatMessage({id:'Text'})
   ```

   

