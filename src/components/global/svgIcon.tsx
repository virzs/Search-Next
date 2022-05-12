/*
 * @Author: Vir
 * @Date: 2022-05-11 10:11:06
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-11 14:40:47
 */
import React, { FC } from 'react';

export interface SvgIconProps {
  name: any;
  prefix?: string;
  color?: string;
  width?: number;
  height?: number;
}

const SvgIcon: FC<SvgIconProps> = (props) => {
  const {
    name,
    prefix = 'icon',
    color = '#333',
    width = 24,
    height = 24,
    ...rest
  } = props;

  const symbolId = `#${prefix}-${name}`;

  return (
    <svg {...rest} width={width} height={height} aria-hidden="true">
      <use href={symbolId} fill={color} />
    </svg>
  );
};

export default SvgIcon;
