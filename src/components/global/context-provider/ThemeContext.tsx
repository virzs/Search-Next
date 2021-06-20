/*
 * @Author: Vir
 * @Date: 2021-03-21 10:56:59
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-20 15:47:50
 */

import React from 'react';

// 主题

export type ThemeType = 'light' | 'dark';

const ThemeContext = React.createContext<ThemeType>('light');

export interface ThemeContextPropTypes {
  theme?: ThemeType;
}

export const ThemeContextProvider: React.FC<ThemeContextPropTypes> = ({
  children,
  theme,
}) => (
  <ThemeContext.Consumer>
    {(originTheme) => (
      <ThemeContext.Provider value={theme || originTheme}>
        {children}
      </ThemeContext.Provider>
    )}
  </ThemeContext.Consumer>
);

export default ThemeContext;
