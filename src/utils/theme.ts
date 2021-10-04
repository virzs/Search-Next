/*
 * @Author: Vir
 * @Date: 2021-10-04 17:12:15
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-05 00:54:57
 */

export type THEME_LIGHT = 'light';

export type THEME_DARK = 'dark';

export type THEME_INVERSE = 'inverse';

export type ThemeValues = THEME_LIGHT | THEME_DARK | THEME_INVERSE;

export interface ThemeItemType {
  id: string;
  show: boolean;
  label: string;
  value: ThemeValues;
}

export const THEME: { [x: string]: ThemeValues } = {
  THEME_LIGHT: 'light',
  THEME_DARK: 'dark',
  THEME_INVERSE: 'inverse',
};

export const themeList: ThemeItemType[] = [
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
  console.log('del', has, body);
  if (has && body) {
    body.className = theme;
  } else if (!has && body) {
    body.className = '';
  }
  // console.log(body?.classList);
};
