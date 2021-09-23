/*
 * @Author: Vir
 * @Date: 2021-08-23 13:39:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-03 16:22:47
 */

// 常用npm包推荐
const npmPackages = [
  {
    id: 'c253f71d654349f0839a1c59e00dd12a',
    name: '通用',
    intro: '通用的 npm 包，基本不限制使用框架',
    path: 'general',
    isShow: true,
    children: [
      {
        id: '5b9fe6e235674cd6a247fbb7ea803cb1',
        name: '文件下载',
        path: 'download',
        isShow: true,
        children: [
          {
            id: 'a669eda7f4f848a9bda2b1c0aa6a4f61',
            name: 'js-file-downloader',
            npm: 'https://www.npmjs.com/package/js-file-downloader',
            repository: 'https://github.com/AleeeKoi/js-file-downloader',
            intro: '扩展浏览器下载文件操作',
            isShow: true,
          },
        ],
      },
      {
        id: 'e688b26519984bd9b03cab0058349bba',
        name: '日期处理',
        intro: '',
        path: 'date',
        isShow: true,
        children: [
          {
            id: 'bcef02d38bad4bd4b9498e669c139d4b',
            name: 'dayjs',
            npm: 'https://www.npmjs.com/package/dayjs',
            repository: 'https://github.com/iamkun/dayjs',
            intro:
              'Day.js 是一个轻量的处理时间和日期的 JavaScript 库，和 Moment.js 的 API 设计保持完全一样. 如果您曾经用过 Moment.js, 那么您已经知道如何使用 Day.js',
            isShow: true,
          },
          {
            id: '7b51bd4d0c454217b6a32b62fb94ff56',
            name: 'Moment.js',
            npm: 'https://www.npmjs.com/package/moment',
            repository: 'http://momentjs.cn/',
            intro: '用于解析、验证、操作和格式化日期的JavaScript日期库。',
            isShow: true,
          },
        ],
      },
      {
        id: '6a865c984e8844f6a3b30e8c7c6935a7',
        name: '数字处理',
        intro: '',
        path: 'number',
        isShow: true,
        children: [
          {
            id: 'de8300345977430abdee384f88175a13',
            name: 'countup',
            npm: 'https://www.npmjs.com/package/countup.js',
            repository: 'https://github.com/inorganik/countUp.js',
            intro: '数字滚动效果',
            isShow: true,
          },
        ],
      },
      {
        id: 'a6961f44fb5d484bb1a927b3d4e8f3fe',
        name: '字符串处理',
        intro: '',
        path: 'string',
        isShow: true,
        children: [
          {
            id: '2973652ed9c5498aabe7077b8defa2de',
            name: 'qs',
            npm: 'https://www.npmjs.com/package/qs',
            repository: 'https://github.com/ljharb/qs',
            intro: '一个简单易用的字符串解析和格式化库',
            isShow: true,
          },
        ],
      },
      {
        id: '1a32d499d956435b8187970ca0ac9255',
        name: 'Storage 存储',
        intro:
          '基于 localStorage、sessionStorage 和 IndexedDB，用于扩展浏览器存储操作。',
        path: 'storage',
        isShow: true,
        children: [
          {
            id: 'eed05cd51ab941b48f4ce69fabb9383c',
            name: 'lowdb',
            npm: 'https://www.npmjs.com/package/lowdb',
            repository: 'https://github.com/typicode/lowdb',
            intro:
              '实现基于Storage的小型本地JSON数据库(支持Node, Electron和浏览器)',
            isShow: true,
          },
          {
            id: '9037f7bfc6e746e8b4c38caff1f0e732',
            name: 'alasql',
            npm: 'https://www.npmjs.com/package/alasql',
            repository: 'https://github.com/agershun/alasql',
            intro:
              'AlaSQL.js -用于浏览器和Node.js的JavaScript SQL数据库。处理传统关系表和嵌套JSON数据(NoSQL)。从localStorage、IndexedDB或Excel导出、存储和导入数据。',
            isShow: true,
          },
          {
            id: 'deefcd005fe14e1c9d8979c385fdad3d',
            name: 'localForage',
            npm: 'https://www.npmjs.com/package/localforage',
            repository: 'https://github.com/localForage/localForage',
            intro:
              'localForage 是一个快速简单的 JavaScript 存储库。 它通过使用类似于 localStorage 的简单 API 来使用异步存储（IndexedDB 或 WebSQL)），进而改善你的 Web 应用程序的离线体验。',
            isShow: true,
          },
          {
            id: '3f9d0f5b53de4ef98a7bb265371e3f7f',
            name: 'pouchdb',
            npm: 'https://www.npmjs.com/package/pouchdb',
            repository: 'https://github.com/pouchdb/pouchdb',
            intro:
              'PouchDB 是一个浏览器内数据库，允许应用程序在本地保存数据，以便用户即使在离线时也可以享受应用程序的所有功能。另外，数据在客户端之间是同步的，因此用户可以随时随地保持最新状态。',
            isShow: true,
          },
          {
            id: '490c1dc7de41439fa48fda506c8a77f7',
            name: 'rxdb',
            npm: 'https://www.npmjs.com/package/rxdb',
            repository: 'https://github.com/pubkey/rxdb',
            intro:
              'RxDB（Reactive Database 的缩写）是 NoSQL 数据库，用于 JavaScript 应用程序，如网站，混合应用程序，Electron Apps，Progressive Web Apps 和 Node.js。响应式意味着你不仅可以查询当前状态，还可以订阅所有状态更改，比如查询的结果或文档的单个字段。',
            isShow: true,
          },
          {
            id: '5e629c2ec60549118722881c61b75a91',
            name: 'nedb',
            npm: 'https://www.npmjs.com/package/nedb',
            repository: 'https://github.com/louischatriot/nedb',
            intro:
              'NeDB 是一个 JavaScript 数据库，能够运行在 Node.js、nw.js、Electron 和浏览器环境。它是使用纯的 JavaScript 实现，不依赖其它库，提供的 API 是 MongoDB API 的子集，重要的是它的速度非常快。',
            isShow: true,
          },
          {
            id: '505d95829f954e60b1da77a5925c25e3',
            name: 'nedb',
            npm: 'https://www.npmjs.com/package/dexie',
            repository: 'https://github.com/dfahlander/Dexie.js',
            intro:
              'Dexie.js 是 IndexedDB 的包装库，它提供了一套经过精心设计的 API，强大的错误处理，较强的可扩展性，此外它能够跟踪数据变化，支持 KeyRange (搜索不区分大小写，可设置匹方式和 OR 操作)。',
            isShow: true,
          },
        ],
      },
    ],
  },
];

export default npmPackages;
