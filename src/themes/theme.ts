/*
 * @Author: Vir
 * @Date: 2021-06-21 13:37:06
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-21 14:46:30
 */
import { ThemeListType, ThemeValues } from './theme.d';

export const THEME: { [x: string]: ThemeValues } = {
  THEME_LIGHT: 'theme-light',
  THEME_DARK: 'theme-dark',
  THEME_ON_BACKGROUND: 'theme-on-background',
};

export const themeList: ThemeListType = [
  {
    id: '194b85049e73439f85c19f7b2dd1bb00',
    show: true,
    label: '浅色',
    value: THEME.THEME_LIGHT,
  },
  {
    id: 'ed1f8895ab7a46e78603bfa974ac35c2',
    show: true,
    label: '深色',
    value: THEME.THEME_DARK,
  },
  {
    id: '62d5ab1461b244a286431d909ff6c6b9',
    show: false,
    label: '背景',
    value: THEME.THEME_ON_BACKGROUND,
  },
];

// 应用主题 has是否应用主题 theme主题名
export const setTheme = (
  has?: boolean,
  theme: ThemeValues = THEME.THEME_ON_BACKGROUND,
) => {
  const body = document.getElementById('root');
  if (has && body) {
    body.className = theme;
  } else if (!has && body) {
    body.className = '';
  }
};
