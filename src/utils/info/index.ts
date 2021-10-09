/*
 * @Author: Vir
 * @Date: 2021-10-08 21:44:26
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-09 14:53:11
 */

import Bowser from 'bowser';

export const getUA = () => {
  const uaStr = navigator.userAgent;
  const parser = Bowser.parse(uaStr);
  return parser;
};
