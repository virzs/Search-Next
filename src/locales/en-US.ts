/*
 * @Author: Vir
 * @Date: 2021-03-14 17:37:06
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-14 21:02:02
 */

import locale, { LocaleTypes } from './locale';

interface enUSTypes {
  [x: string]: string;
}

let en: enUSTypes = {};

const enUS = () => {
  locale.forEach((i: LocaleTypes) => (en[i.id] = i.enUS));
};

enUS();

export default en;
