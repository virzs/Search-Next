/*
 * @Author: Vir
 * @Date: 2021-03-18 15:08:21
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-21 16:43:12
 */

import React from 'react';
import { ThemeContext } from './components/global/context-provider';

interface RouterChangeTypes {
  location?: any;
  routes?: any;
  matchedRoutes?: any;
  action?: any;
}

// 路由更改
export function onRouteChange({
  location,
  routes,
  matchedRoutes,
  action,
}: RouterChangeTypes) {}

//修改渲染时的根组件
export function rootContainer(container: React.ReactElement) {
  return container;
}
