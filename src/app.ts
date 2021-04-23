/*
 * @Author: Vir
 * @Date: 2021-03-18 15:08:21
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-23 16:24:01
 */

import React from 'react';
import { getDvaApp, Reducer } from 'umi';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import NotistackWrapper from './components/material-ui-custom/notistack';

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

// 配置dva持久化存储
export const dva = {
  config: {
    onError(e: Error) {},
    onReducer(reducer: Reducer) {
      const persistConfig = {
        key: 'root',
        storage,
        whitelist: ['sites'],
        stateReconciler: autoMergeLevel2,
      };
      return persistReducer(persistConfig, reducer);
    },
  },
};

window.addEventListener('DOMContentLoaded', () => {
  const app = getDvaApp();
  persistStore(app._store);
});

//修改渲染时的根组件
export function rootContainer(container: React.ReactElement) {
  return React.createElement(NotistackWrapper, null, container);
}
