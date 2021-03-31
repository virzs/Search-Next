/*
 * @Author: Vir
 * @Date: 2021-03-14 17:34:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-31 20:44:14
 */
import updateRecordDialog from './modules/components/update-record-dialog';
import index from './modules/pages';
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

// 页面相关
const pageLocales = [...index];

// 组件相关
const componentLocales = [...updateRecordDialog];

export default [...pageLocales, ...componentLocales] as LocaleTypes[];
