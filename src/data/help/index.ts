/*
 * @Author: Vir
 * @Date: 2021-11-04 16:53:18
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-04 17:18:04
 */
import commitWebsiteMd from './commit_website.md';

const helpData: any[] = [
  {
    name: '使用说明',
  },
  {
    name: '开发支持',
    children: [
      {
        name: '提交网站',
        content: commitWebsiteMd,
      },
    ],
  },
  {
    name: '反馈',
  },
];

export default helpData;
