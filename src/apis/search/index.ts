/*
 * @Author: Vir
 * @Date: 2021-03-19 11:19:28
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-21 10:57:59
 */

import engine from '@/data/engine';
import { SearchEngine } from '@/data/engine/types';
import { ResultTypes } from '@/typings/index';

export interface SearchEngineResultTypes extends ResultTypes {
  data: SearchEngine[];
}

export const list = () => {
  return new Promise<SearchEngineResultTypes>((resolve) => {
    resolve({ code: 200, msg: '获取成功', data: engine });
  });
};

export const detail = (id: string) => {
  return new Promise<ResultTypes>((resolve) => {
    let item = engine.find((i) => i._id === id);
    if (item) {
      resolve({ code: 200, msg: '获取成功', data: item });
    } else {
      resolve({ code: 200, msg: '未获取到此搜索引擎', data: {} });
    }
  });
};
