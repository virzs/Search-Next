/*
 * @Author: Vir
 * @Date: 2021-11-19 17:45:40
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-28 16:10:34
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
      {
        id: 'eb22ec2f483c47fdb776451d540d01cc',
        name: '资讯',
        path: 'news',
        intro: '常用资讯网站推荐',
      },
    ],
  },
  {
    id: '19cc37a6fc924ae19112cef7c2e348eb',
    name: '资讯',
    path: 'news',
    intro: '',
    subClassify: [
      {
        id: 'a908cb2401da46b8890147862a5def23',
        name: '常用',
        path: 'common',
        intro: '',
      },
      {
        id: 'a57bc88ba97e46948fdde041da4954fe',
        name: '数码',
        path: 'digital',
        intro: '',
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
  {
    id: 'c3538088e0ed4ef8958f09c0b728adfe',
    name: '开发',
    path: 'develop',
    intro: '',
    subClassify: [
      {
        id: '74f09917fdc249fcb0b20ca5211a277f',
        name: '前端',
        path: 'front-end',
        intro: '',
      },
      {
        id: '305bc170bac34452b09f4c7bfd46523b',
        name: '后端',
        path: 'rear-end',
        intro: '',
      },
      {
        id: '66a7d3d3571d4cb58aae454ddb747293',
        name: '移动端',
        path: 'mobile terminal',
        intro: '',
      },
      {
        id: '40a3796a06a1448780adb7e2b3944576',
        name: '文档',
        path: 'document',
        intro: '',
      },
      {
        id: '411ae611bdb1455f910fe917ba9b0439',
        name: '社区',
        path: 'community',
        intro: '',
      },
      {
        id: '553c044927b1443ea388172989869a0e',
        name: '博客',
        path: 'blog',
        intro: '',
      },
    ],
  },
  {
    id: 'c99f76b6af884ba2be1be72fa072c290',
    name: '设计',
    path: 'design',
    intro: '',
    subClassify: [
      {
        id: 'c72c26bf74374433ab41f25003b7356b',
        name: '图标库',
        path: 'icons',
        intro: '',
      },
    ],
  },
];

export default classify;
