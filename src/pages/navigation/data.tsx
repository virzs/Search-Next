/*
 * @Author: Vir
 * @Date: 2021-07-25 11:19:14
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-25 23:18:04
 */

import { Code, Group } from '@material-ui/icons';
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
    children: [],
  },
];

export default navigations;
