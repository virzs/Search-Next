/*
 * @Author: Vir
 * @Date: 2021-11-19 17:45:40
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-21 20:55:28
 */

import { Classify } from './interface';

const classify: Classify[] = [
  {
    id: '6da7ce69c09a41999c167f658647a40a',
    name: '常用',
    path: 'common',
    intro: '常用网站推荐',
    subClassify: [
      {
        id: '17e0e9a9e45140059a1f1d038e93d206',
        name: '购物',
        path: 'shopping',
        intro: '常用购物网站推荐',
      },
      {
        id: 'b983b45559084171809949369559f725',
        name: '社交',
        path: 'social',
        intro: '常用社交网站推荐',
      },
    ],
  },
  {
    id: 'e9db130e300b4a85bdde455eb35ad12e',
    name: '工具',
    path: 'tools',
    intro: '软件，在线工具',
    subClassify: [
      {
        id: '39e6caea9ab24006888dc0e214abe9ae',
        name: '软件',
        path: 'software',
        intro: '软件官网',
      },
      {
        id: '4fa43caa7b794e28845384ab406fb2f6',
        name: '在线工具',
        path: 'onlineTools',
        intro: '在线工具',
      },
    ],
  },
];

export default classify;
