/*
 * @Author: Vir
 * @Date: 2021-06-21 13:44:58
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-21 14:45:20
 */

export type THEME_LIGHT = 'theme-light';

export type THEME_DARK = 'theme-dark';

export type THEME_ON_BACKGROUND = 'theme-on-background';

export type ThemeValues = THEME_LIGHT | THEME_DARK | THEME_ON_BACKGROUND;

export interface ThemeItemType {
  id: string;
  show: boolean;
  label: string;
  value: ThemeValues;
}

export type ThemeListType = ThemeItemType[];
