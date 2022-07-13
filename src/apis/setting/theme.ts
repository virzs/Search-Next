/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-08 11:42:16
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-13 14:21:09
 */
import { STDB } from '../../utils/db';

export type ThemeType = 'system' | 'light' | 'dark';

export interface DarkThemeSettings {
  brightness: number;
  contrast: number;
  grayscale: number;
  sepia: number;
}

export interface ThemeData {
  type: ThemeType;
  darkSettings: DarkThemeSettings;
}

export const setTheme = (data: ThemeData) => {
  const userId = localStorage.getItem('account');
  const res = STDB.findOne({ userId });
  return res ? STDB.update({ userId }, data) : STDB.inset({ userId, ...data });
};

export const getTheme = (): ThemeData | undefined => {
  const userId = localStorage.getItem('account');
  const result = STDB.findOne({ userId });

  return result;
};
