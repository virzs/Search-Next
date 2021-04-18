/*
 * @Author: Vir
 * @Date: 2021-04-18 16:15:58
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-18 23:44:37
 */

import { getUuid } from '@/utils/common';
import { Effect, Reducer } from 'umi';

export interface SiteListType {
  id: string;
  name: string; //名称
  url: string; //网址
  count: number; //使用次数
}

export interface SitesStateType {
  list: SiteListType[];
}

export interface SitesModelType {
  namespace: string;
  state: SitesStateType;
  effects: {
    add: Effect;
  };
  reducers: {
    add: Reducer<any>;
  };
}

// 主页网站列表model
export default {
  namespace: 'sites',
  state: { list: [] },
  effects: {
    *add({ payload }, { put }) {
      console.log(payload);
      return put({ type: 'add', payload });
    },
  },
  reducers: {
    add(state, action) {
      const site = {
        id: getUuid(),
        count: 0,
        ...action.payload.item,
      };
      console.log(state.list);
      return { ...state, list: state.list.concat(site) };
    },
  },
} as SitesModelType;
