/*
 * @Author: Vir
 * @Date: 2021-03-14 17:34:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-22 09:13:25
 */

export interface LocaleTypes {
  id: string;
  zhCN: string;
  enUS: string;
}

export interface SelectLocalesTypes {
  label: string;
  value: string;
}

export const selectLocalesValue: SelectLocalesTypes[] = [
  {
    label: '中文',
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
];

export default [
  {
    id: 'MAIN_SEARCH',
    zhCN: '搜索',
    enUS: 'Search',
  },
  {
    id: 'MAIN_SEARCH_PLACEHOLDER',
    zhCN: '请输入搜索内容',
    enUS: 'Please enter search content',
  },
] as LocaleTypes[];
