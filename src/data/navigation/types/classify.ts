/*
 * @Author: Vir
 * @Date: 2021-11-16 11:17:47
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-17 16:20:30
 */

/**
 * 软件
 * @desc 网站分类 - 软件
 */
export type SOFTWARE = 'software';

/**
 * 在线工具
 * @desc 网站分类 - 在线工具
 */
export type ONLINETOOLS = 'onlineTools';

/**
 * 资讯
 * @desc 网站分类 - 资讯
 */
export type NEWS = 'news';

/**
 * 社交
 * @desc 网站分类 - 社交
 */
export type SOCIAL = 'social';

/**
 * 购物
 * @desc 网站分类 - 购物
 */
export type SHOPPING = 'shopping';

/**
 * 邮箱
 * @desc 网站分类 - 邮箱
 */
export type EMAIL = 'email';

/**
 * 视频
 * @desc 网站分类 - 视频
 */
export type VIDEO = 'video';

/**
 * 科技数码
 * @desc 网站分类 - 科技数码
 */
export type DIGITAL = 'digital';

/**
 * 图片
 * @desc 网站分类 - 图片
 */
export type PICTURE = 'picture';

/**
 * 社区
 * @desc 网站分类 - 社区
 */
export type COMMUNITY = 'community';

/**
 * 开发
 * @desc 网站分类 - 开发
 */
export type DEVELOP = 'develop';

/**
 * 图标
 * @desc 网站分类 - 图标
 */
export type ICONS = 'icons';

/**
 * 工具
 * @desc 网站分类 - 工具
 */
export type TOOLS = 'tools';

/**
 * 常用
 * @desc 网站分类 - 常用
 */
export type COMMON = 'common';

/**
 * 工作
 * @desc 网站分类 - 工作
 */
export type WORK = 'work';

/**
 * 前端
 * @desc 网站分类 - 前端
 */
export type FRONTEND = 'front-end';

/**
 * 设计
 * @desc 网站分类 - 设计
 */
export type DESIGN = 'design';

/**
 * 网站分类
 * @desc 网站全部分类
 */
export type WebsiteClassify =
  | SOFTWARE
  | ONLINETOOLS
  | NEWS
  | SOCIAL
  | SHOPPING
  | EMAIL
  | VIDEO
  | DIGITAL
  | PICTURE
  | COMMUNITY
  | DEVELOP
  | ICONS
  | TOOLS
  | COMMON
  | WORK
  | FRONTEND
  | DESIGN;

/**
 * 网站分类数据
 */
export interface Classify {
  id: string;
  name: string;
  path: WebsiteClassify;
  intro?: string;
  icon?: any;
  children: Classify[];
}
