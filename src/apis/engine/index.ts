/*
 * @Author: Vir
 * @Date: 2022-01-14 14:28:58
 * @Last Modified by: Vir
 * @Last Modified time: 2022-03-16 17:25:58
 */

import { authDefaultData } from '@/data/account/default';
import { Engine } from '@/data/account/interface';
import engine, { WebsiteEngineTemplete } from '@/data/engine';
import classify, { SearchEngineClassifyTemplete } from '@/data/engine/classify';
import {
  SearchEngine,
  SearchEngineClassify,
  SearchEngineClassifyToApiUse,
  SearchEngineClassifyWithChildren,
} from '@/data/engine/types';
import { filterObj } from '@/utils/common';
import StorageDB from 'bsdb';
import { getAuthDataByKey, updateAuthDataByKey } from '../auth';

export const BaseDB = new StorageDB({
  storage: localStorage,
  database: 'database',
});

export const EngineClassifyDB = BaseDB.get('engine_classify');

export const EngineDB = BaseDB.get('engine');

export type AddClassifyData = Omit<SearchEngineClassifyToApiUse, 'isShow'>;

export interface EditClassifyData extends AddClassifyData {
  _id: string;
}

// 获取网站所有分类
export const getClassifyApi = () => {
  const userId = localStorage.getItem('account');
  return new Promise((res, rej) => {
    const result = EngineClassifyDB.find({ userId });
    if (result.length === 0) {
      EngineClassifyDB.inset(classify.map((i) => ({ ...i, ...{ userId } })));
      res(classify.concat(result));
    } else {
      result ? res(result) : rej(result);
    }
  });
};

// 添加分类
export const addClassifyApi = (data: AddClassifyData) => {
  const userId = localStorage.getItem('account');
  const { _id: tId, ...templete } = SearchEngineClassifyTemplete;
  return new Promise((res, rej) => {
    const result = EngineClassifyDB.inset({
      ...templete,
      ...data,
      userId,
    });
    result ? res(result) : rej(result);
  });
};

// 修改分类
export const editClassifyApi = ({ _id: id, ...data }: EditClassifyData) => {
  const userId = localStorage.getItem('account');
  return new Promise((res, rej) => {
    const g = EngineClassifyDB.findOne(id);
    !g && rej('分类不存在');
    const result = EngineClassifyDB.update(id, {
      ...data,
      userId,
    });
    result ? res(result) : rej(result);
  });
};

// 删除分类
export const delClassifyApi = (id: string) => {
  const userId = localStorage.getItem('account');
  return new Promise((res, rej) => {
    const result = EngineClassifyDB.remove({ _id: id, userId });
    result ? res(result) : rej(result);
  });
};

// 设置分类是否显示
export const showClassifyApi = (id: string, isShow: boolean) => {
  return new Promise((res, rej) => {
    const show = EngineClassifyDB.find({ isShow: true });
    show && show.length === 1 && rej('最少需要显示一个分类');
    const result = EngineClassifyDB.update(id, { isShow });
    result ? res(result) : rej(result);
  });
};

export type baseEngineData = Omit<
  SearchEngine,
  'sugurl' | 'icon' | 'isShow' | 'isSelected' | 'count' | 'sort' | 'userId'
>;

export type addEngineData = Omit<baseEngineData, '_id'>;

export interface editEngineData extends addEngineData {
  _id: string;
}

// 新增一个搜索引擎
export const addEngineApi = (data: addEngineData) => {
  const userId = localStorage.getItem('account');
  return new Promise((res, rej) => {
    const { _id, ...templete } = WebsiteEngineTemplete;
    const result = EngineDB.inset({ ...templete, ...data, userId });
    result ? res(result) : rej(result);
  });
};

// 修改搜索引擎
export const editEngineApi = ({ _id: id, ...data }: editEngineData) => {
  const userId = localStorage.getItem('account');
  return new Promise((res, rej) => {
    const g = EngineDB.findOne(id);
    !g && rej('搜索引擎不存在');
    const result = EngineDB.update(id, { ...data, userId });
    result ? res(result) : rej(result);
  });
};

// 删除搜索引擎
export const delEngineApi = (id: string) => {
  const userId = localStorage.getItem('account');
  return new Promise((res, rej) => {
    const result = EngineDB.remove({ _id: id, userId });
    result ? res(result) : rej(result);
  });
};

// 设置搜索引擎是否显示
export const showEngineApi = (id: string, isShow: boolean) => {
  return new Promise((res, rej) => {
    const show = EngineDB.find({ isShow: true });
    show && show.length === 1 && rej('最少需要显示一个分类');
    const result = EngineDB.update(id, { isShow });
    result ? res(result) : rej(result);
  });
};

export interface FullSearchEngine extends Omit<SearchEngine, 'classifyId'> {
  classify?: SearchEngineClassify;
}

// 获取搜索引擎列表
export const getEngineListApi = (classifyId?: string) => {
  const userId = localStorage.getItem('account');
  return new Promise<FullSearchEngine[]>((res, rej) => {
    if (classifyId) {
      const classify: SearchEngineClassify =
        EngineClassifyDB.findOne(classifyId);
      const result: SearchEngine[] = EngineDB.find({
        classifyId: {
          $eq: classifyId,
        },
        userId: {
          $eq: userId,
        },
      });
      if (!result || !classify) rej('error');
      const format = result.map((i) => {
        const { classifyId, ...data } = i;
        return { ...data, classify };
      });
      res(format);
    } else {
      const defData = engine;
      const classifyList: SearchEngineClassify[] = EngineClassifyDB.find({
        userId: { $eq: userId },
      });
      const result: SearchEngine[] = EngineDB.find({
        userId: { $eq: userId },
      });

      if (!result || !classifyList) rej('error');

      if (!defData.every((i) => result.find((j) => j._id === i._id))) {
        // 向列表添加默认数据
        defData.forEach((i) => {
          if (!result.find((j) => j._id === i._id)) {
            const n = { ...i, userId: userId as string };
            result.unshift(n);
            EngineDB.inset(n);
          }
        });
      }

      // 向每项添加关联的分类并排序
      const format = result
        .map((i) => {
          const { classifyId, ...data } = i;
          const classify = classifyList.find((j) => j._id === classifyId);
          return { ...data, classify };
        })
        .sort((a, b) => {
          if (a.sort === -1 || b.sort === -1) return 1;
          return a.sort - b.sort;
        });
      res(format);
    }
  });
};

// 获取所有分类及对应的搜索引擎且 isShow = true
export const getClassifyEngineListApi = () => {
  const userId = localStorage.getItem('account');
  return new Promise<SearchEngineClassifyWithChildren[]>((res, rej) => {
    const classifyList: SearchEngineClassify[] = EngineClassifyDB.find({
      userId: { $eq: userId },
    });
    const result: SearchEngine[] = EngineDB.find({
      userId: { $eq: userId },
    });
    if (!result || !classifyList) rej('error');

    let privClassifyList = classifyList.length > 0 ? classifyList : classify;
    let privEngineList = result.length > 0 ? result : engine;

    const format = privClassifyList
      .map((i) => {
        const { _id: classifyId } = i;
        const engine = privEngineList.filter(
          (j) => j.classifyId === classifyId && j.isShow,
        );
        return { ...i, children: engine };
      })
      .filter((i) => i.children.length > 0);
    res(format);
  });
};

export interface SearchEngineData extends FullSearchEngine {
  createdTime: string;
  updatedTime: string;
}

// 获取搜索引擎详情
export const getEngineDetailApi = (id: string) => {
  return new Promise<SearchEngineData>((res, rej) => {
    const currentEngine =
      EngineDB.findOne(id) || engine.find((i) => i._id === id);
    const engineClassify =
      EngineClassifyDB.findOne(currentEngine?.classifyId) ||
      classify.find((i) => i._id === currentEngine?.classifyId);
    if (!currentEngine || !engineClassify) rej('error');
    const result = { ...currentEngine, classify: engineClassify };
    delete result.classifyId;
    res(result);
  });
};

// 搜索引擎计数
export const setEngineCountApi = (id: string) => {
  return new Promise((res, rej) => {
    const detail = EngineDB.findOne(id);
    if (!detail) rej('error');
    const result = EngineDB.update(id, {
      count: detail.count + 1,
    });
    res(result);
  });
};

export interface AccountEngine extends Engine {
  engine: SearchEngineData;
}

// 获取当前用户选中的搜索引擎
export const getAccountEngineApi = () => {
  return new Promise<AccountEngine>(async (res, rej) => {
    const userId = localStorage.getItem('account');
    if (!userId) rej('用户未登录');
    const result = getAuthDataByKey(userId || '', 'engine');
    let checkedResult = {} as Engine;
    checkedResult = result ? result : authDefaultData.engine;
    const engineData = (
      checkedResult?.selected
        ? await getEngineDetailApi(checkedResult?.selected)
        : engine.find((i) => i.isSelected)
    ) as SearchEngineData;
    const lastResult = { ...checkedResult, engine: engineData };
    !result &&
      updateAuthDataByKey(userId || '', 'engine', {
        ...checkedResult,
        selected: engineData?._id,
      });
    res({ ...lastResult, engine: engineData });
  });
};

// 设置当前用户搜索引擎设置
export const setAccountEngineApi = (val: AccountEngine) => {
  return new Promise((res, rej) => {
    const userId = localStorage.getItem('account');
    if (!userId) rej('用户未登录');
    const result = updateAuthDataByKey(userId || '', 'engine', val);
    result ? res(result) : rej(result);
  });
};

// 设置当前用户搜索引擎设置，除了搜索引擎
export const setAccountEngineExceptApi = (val: Omit<Engine, 'selected'>) => {
  return new Promise(async (res, rej) => {
    const keys = ['mode', 'indexCount', 'sortType'];
    const localEngineSetting = await getAccountEngineApi();
    const result = await setAccountEngineApi({
      ...localEngineSetting,
      ...filterObj(val, keys),
    });
    result ? res(result) : rej(result);
  });
};

// 单独设置当前用户选中的搜索引擎
export const setAccountCurretEngineApi = (id: string) => {
  return new Promise(async (res, rej) => {
    const localEngineSetting = await getAccountEngineApi();
    const result = await setAccountEngineApi({
      ...localEngineSetting,
      selected: id,
    });
    result ? res(result) : rej(result);
  });
};
