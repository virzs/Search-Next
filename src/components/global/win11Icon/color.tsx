/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-28 09:44:32
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-28 09:47:09
 */
import React from 'react';
import SvgIcon, { SvgIconProps } from '../svgIcon';

const nameList = ['bing'];

export interface ColorProps extends SvgIconProps {
  name: keyof typeof nameList;
}

function Color() {
  return <SvgIcon prefix="win11Color" name="bing" />;
}

export default Color;
