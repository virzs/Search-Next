/*
 * @Author: Vir
 * @Date: 2021-09-01 15:20:59
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-15 17:39:16
 */

import { SBDB } from '@/utils/db';
import instance from '@/utils/request';

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

export interface Color {
  color?: string; // 当前颜色
  common?: string[]; // 最近选过的颜色
}

export interface Link {
  url: string;
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

// 获取bing随机壁纸
export const bingImg = (params?: bingImgParamsType) => {
  return instance.get('/v1/resource/bing/random', {
    params,
  });
};

export interface UseBackgroundTypeColorData {
  data?: Color;
  history?: Color[];
}

export interface UseBackgroundTypeBingData {
  data?: BingImage;
  history?: BingImage[];
}

export interface UseBackgroundTypePicsumData {
  data?: LoremPicsumImage;
  history?: LoremPicsumImage[];
}

export interface UseBackgroundTypeBingEverydayData {
  data?: BingImage;
  history?: BingImage[];
}

export interface UseBackgroundTypeLinkData {
  data?: Link;
  history?: Link[];
}

export interface Datas {
  color?: UseBackgroundTypeColorData;
  bing?: UseBackgroundTypeBingData;
  picsum?: UseBackgroundTypePicsumData;
  bing_everyday?: UseBackgroundTypeBingEverydayData;
  link?: UseBackgroundTypeLinkData;
}

export type BackgroundType = keyof Datas;

export interface UseBackgroundData extends Datas {
  type: BackgroundType;
}

// 获取最新壁纸/每日一图
export const latestImg = () => {
  return instance.get('/v1/resource/bing/latest');
};

export interface LoremPicsumParams {
  page: number;
}

export interface LoremPicsumImage {
  author: string;
  download_url: string;
  height: number;
  id: string;
  url: string;
  width: number;
}

// 获取 Lorem Picsum 图片列表
export const loremPicsumImg = (params: LoremPicsumParams) => {
  return instance.get('https://picsum.photos/v2/list', {
    params,
  });
};

// 设置背景
export const setBackgroundApi = (userId: string, data: UseBackgroundData) => {
  const localData = SBDB.findOne({ userId });
  if (localData) {
    return SBDB.update({ userId }, data);
  } else {
    return SBDB.inset({ userId, ...data });
  }
};

// 获取背景
export const getBackgroundApi = (userId: string) => {
  return SBDB.findOne({ userId });
};
