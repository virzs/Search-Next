/*
 * @Author: Vir
 * @Date: 2021-07-25 18:40:38
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-17 16:18:42
 */

import { WebsiteClassify } from './types/classify';

/**
 * 网站
 * @type { string } id - 网站id
 * @type { string } name - 网站名称
 * @type { string } url - 网站域名
 * @typeof { WebsiteClassify } classify - 网站分类
 * @type { string } intro - 简介
 * @type { string } icon - 图标地址
 * @type { string } color - 网站主题色
 * @type { boolean } isShow - 是否显示
 */
export interface Website {
  id: string;
  name: string;
  url: string;
  classify: WebsiteClassify[];
  intro?: string;
  icon?: string;
  color?: string;
  isShow?: boolean;
}

export type NavigationType = 'website' | 'navigation';

/**
 * 导航
 */
export interface Navigation {
  id: string;
  name: string;
  intro?: string;
  path?: string;
  url?: string;
  icon?: any;
  color?: string;
  isShow?: boolean;
  type?: NavigationType;
  children?: Website[] | Navigation[] | '';
}
