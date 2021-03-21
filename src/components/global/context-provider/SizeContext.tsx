/*
 * @Author: Vir
 * @Date: 2021-03-20 23:10:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-20 23:29:13
 */

import React from 'react';

// 组件尺寸

export type SizeType = 'mini' | 'small' | 'medium' | 'large';

const SizeContext = React.createContext<SizeType>('medium');

export interface SizeContextPropTypes {
  size?: SizeType;
}

export const SizeContextProvider: React.FC<SizeContextPropTypes> = ({
  children,
  size,
}) => (
  <SizeContext.Consumer>
    {(originSize) => (
      <SizeContext.Provider value={size || originSize}>
        {children}
      </SizeContext.Provider>
    )}
  </SizeContext.Consumer>
);

export default SizeContext;
