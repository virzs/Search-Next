/*
 * @Author: Vir
 * @Date: 2021-09-01 15:20:59
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 17:31:01
 */

import instance from '@/utils/request';

import StorageDB from 'bsdb';

export interface BingImgListType {
  images: BingImage[];
  tooltips: Tooltips;
}

export interface BingImage {
  _id: string;
  startdate: string;
  fullstartdate: string;
  enddate: string;
  url: string;
  urlbase: string;
  copyright: string;
  copyrightlink: string;
  title: string;
  quiz: string;
  wp: boolean;
  hsh: string;
  drk: number;
  top: number;
  bot: number;
  hs: any[];
}

export interface Tooltips {
  loading: string;
  previous: string;
  next: string;
  walle: string;
  walls: string;
}

export interface bingImgParamsType {
  size?: number;
  hsh?: string;
}

const BaseDB = new StorageDB({
  storage: localStorage,
  database: 'database',
});

export const BackgroundDB = BaseDB.get('background');

// 获取bing随机壁纸
export const bingImg = (params?: bingImgParamsType) => {
  return instance.get('/v1/resource/bing/random', {
    params,
  });
};

// 获取最新壁纸/每日一图
export const latestImg = () => {
  return instance.get('/v1/resource/bing/latest');
};

export interface SetBackgroundParams {
  check: boolean; // 当前选中
  userId?: string; // 用户id
  url: string; // 背景url
  bgId: string; //背景id
  copyright: string; // 版权信息描述
  copyrightlink: string; // 版权信息链接
  hsh: string;
}

// 设置背景
// 设置背景考虑到主页加载，保留基础信息
// 每次选择完毕将当前用户选中的其他壁纸 check 状态设为 false
// params为空时，当前用户所有历史选择的背景 check 均为 false
export const setBackground = (userId: string, params?: SetBackgroundParams) => {
  let inset;
  if (params) {
    params.userId = userId;
    inset = BackgroundDB.inset(params);
  }
  let idQuery = params
    ? {
        _id: {
          $ne: inset._id,
        },
      }
    : {};
  BackgroundDB.update(
    {
      userId: {
        $eq: userId,
      },
      check: {
        $eq: true,
      },
      ...idQuery,
    },
    { check: false },
    { multi: true },
  );
  return inset;
};

// 获取当前用户使用的背景
export const checkedBg = (userId?: string | null) => {
  if (!userId) return null;
  const res = BackgroundDB.findOne({
    userId: {
      $eq: userId,
    },
    check: {
      $eq: true,
    },
  });

  return res;
};

// 获取选中背景历史
export const backgroundHistory = (userId: string) => {
  const res = BackgroundDB.find({
    userId: {
      $eq: userId,
    },
  });

  return res;
};
