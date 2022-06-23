/*
 * @Author: Vir
 * @Date: 2022-06-09 14:58:05
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-15 13:59:48
 */
import React from 'react';
import colorList from '@/data/colors/windos11';
import { Alert } from '@mui/material';

function Color() {
  return (
    <div>
      <Alert severity="info">
        设置为纯色背景，在纯色设置时，会自动应用当前主题配色。
      </Alert>
    </div>
  );
}

export default Color;
