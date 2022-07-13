/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-13 15:21:06
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-13 16:43:31
 */

import { SNDB } from '@/utils/db';

export interface NavigationData {
  type: 'page' | 'drawer';
  cols: 2 | 3 | 4;
}

export const setNavigation = (data: Partial<NavigationData>) => {
  const userId = localStorage.getItem('account');
  const res = SNDB.findOne({ userId });

  return res ? SNDB.update({ userId }, data) : SNDB.inset({ userId, ...data });
};

export const getNavigation = (): NavigationData => {
  const userId = localStorage.getItem('account');

  return SNDB.findOne({ userId });
};
