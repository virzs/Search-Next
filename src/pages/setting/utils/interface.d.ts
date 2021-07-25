/*
 * @Author: Vir
 * @Date: 2021-06-22 16:17:35
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-22 17:48:02
 */

import { BingImage } from '@/apis/bing/interface';

export interface TopSites {
  show: boolean;
  size: number;
}

export type Background = BingImage | {};

export interface SettingType {
  background: Background;
  topSite: TopSites;
}
