/*
 * @Author: Vir
 * @Date: 2021-03-14 17:37:02
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-14 21:01:46
 */

import locale, { LocaleTypes } from './locale';

interface zhCNTypes {
  [x: string]: string;
}

let zh: zhCNTypes = {};

const zhCN = () => {
  locale.forEach((i: LocaleTypes) => (zh[i.id] = i.zhCN));
};

zhCN();

export default zh;
