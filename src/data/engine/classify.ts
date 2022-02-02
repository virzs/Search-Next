/*
 * @Author: Vir
 * @Date: 2022-01-16 15:39:56
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-17 13:55:31
 */

import { SearchEngineClassify } from './types';

export const SearchEngineClassifyTemplete: SearchEngineClassify = {
  _id: '',
  name: '',
  value: '',
  sort: -1,
  isShow: true,
  isDefault: false,
  userId: '',
  description: '',
};

export default [
  {
    _id: '6c77e19433a1416d851ef898e0db5707',
    name: '常用',
    value: 'common',
    description: '',
    sort: 0,
    isShow: true,
    isDefault: true,
    userId: '',
  },
] as SearchEngineClassify[];
