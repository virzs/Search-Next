/*
 * @Author: Vir
 * @Date: 2021-07-25 11:19:14
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-25 23:18:04
 */

import { Build, Code, Description, Group } from '@material-ui/icons';
import { Navigation } from './interface';

const navigations: Navigation[] = [
  {
    id: 'aa4c4b672c8a47d2b2289b60eb3c82b1',
    name: '社交',
    path: 'social',
    icon: <Group />,
    color: '',
    isShow: true,
    children: [
      {
        id: '4e1c3a03242b4361a22a4daf8ced88bf',
        name: '新浪微博',
        url: 'https://www.weibo.com/',
        icon: 'weibo',
        color: '#ff8140',
        isShow: true,
      },
      {
        id: '68178f885c7b44e78ddc0be67b478644',
        name: '百度贴吧',
        url: 'https://tieba.baidu.com/',
        icon: 'tieba',
        color: '#3385ff',
        isShow: true,
      },
      {
        id: '854c6ae11b334bdbb0cd6c71c8598533',
        name: '简书',
        url: 'https://www.jianshu.com/',
        icon: 'jianshu',
        color: '#ea6f5a',
        isShow: true,
      },
      {
        id: 'f24d86cb6b9d44c5a2b9cf5bc7f4ee1e',
        name: '知乎',
        url: 'https://www.zhihu.com/',
        icon: 'zhihu',
        color: '#0084ff',
        isShow: true,
      },
      {
        id: '210638b8452c4163a34ea3b62f41ff51',
        name: 'Facebook',
        url: 'https://www.facebook.com/',
        icon: 'facebook',
        color: '#4267b2',
        isShow: true,
      },
      {
        id: '7e99a1ce468943c8bfb27421b7015022',
        name: 'Twitter',
        url: 'https://twitter.com/',
        icon: 'twitter',
        color: 'rgb(29, 161, 242)',
        isShow: true,
      },
    ],
  },
  {
    id: '0151319abdb6435688d4d3082a4f69f5',
    name: '开发',
    path: 'develop',
    icon: <Code />,
    color: '',
    isShow: true,
    children: [
      {
        id: '038ce5a511564b74a02b566e1ad02e61',
        name: 'React',
        url: 'https://react.docschina.org/',
        intro: '用于构建用户界面的 JavaScript 库',
        icon: 'react',
        color: '#61DAFB',
        isShow: true,
      },
      {
        id: '553324cb3a614441b23ae13082412d45',
        name: 'VusJs',
        url: 'https://v3.cn.vuejs.org/',
        intro: '渐进式 JavaScript 框架',
        icon: 'vuejs',
        color: '#41B883',
        isShow: true,
      },
      {
        id: '879a26836b83420898d1e4daf45b5035',
        name: 'AngularJS',
        url: 'https://www.angularjs.net.cn/',
        intro: '一个开发动态Web应用的框架。',
        icon: 'angularjs',
        color: '#E23237',
        isShow: true,
      },
    ],
  },
  {
    id: '597891a55a2545b29b6c6af63e319d4c',
    name: '工具',
    path: 'tools',
    icon: <Build />,
    color: '',
    isShow: true,
    children: [
      {
        id: '47e97fedff2d40779e072dc6ee7ddd16',
        name: 'VS Code',
        url: 'https://code.visualstudio.com/',
        intro: 'Code editing. Redefined.',
        icon: 'vscode',
        color: '#22A5F1',
        isShow: true,
      },
      {
        id: '5e5f263d87564a8289a111cd7113ba00',
        name: 'Jetbrains',
        url: 'https://www.jetbrains.com/',
        intro: 'Essential tools for software developers and teams',
        icon: 'jetbrains',
        color: '#080809',
        isShow: true,
      },
      {
        id: '7ceff82cbfc7472687e3bf637107ebfb',
        name: 'HBuilderX',
        url: 'https://www.dcloud.io/hbuilderx.html',
        intro: 'HBuilderX 是轻如编辑器、强如IDE的合体版本。',
        icon: 'hubilderx',
        color: '#1A9F35',
        isShow: true,
      },
      {
        id: '83b6b56394114522be7c36d8c2a6bd2d',
        name: 'uTools',
        url: 'https://u.tools/',
        intro: '你的生产力工具集',
        icon: 'utools',
        color: '#172B4D',
        isShow: true,
      },
      {
        id: '42a414464d7847d586bd58ee6c83a147',
        name: 'typora',
        url: 'https://typora.io/',
        intro: 'A TRULY MINIMAL MARKDOWN EDITOR.',
        icon: 'typora',
        color: '#999999',
        isShow: true,
      },
    ],
  },
];

export default navigations;
