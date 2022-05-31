/*
 * @Author: Vir
 * @Date: 2021-11-16 11:17:47
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-30 10:53:02
 */

import { Website } from '../interface';

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
 * 后端
 * @desc 网站分类 - 后端
 */
export type REAREND = 'rear-end';

/**
 * 移动端
 * @desc 网站分类 - 移动端
 */
export type MT = 'mobile terminal';

/**
 * 设计
 * @desc 网站分类 - 设计
 */
export type DESIGN = 'design';

/**
 * 文档
 * @desc 网站分类 - 文档
 */
export type DOCUMENT = 'document';

/**
 * 包
 * @desc 网站分类 - 包
 */
export type PACKAGE = 'package';

/**
 * npm
 * @desc 网站分类 - npm
 */
export type NPM = 'npm';

/**
 * flutter
 * @desc 网站分类 - flutter
 */
export type FLUTTER = 'flutter';

/**
 * nodejs
 * @desc 网站分类 - nodejs
 */
export type NODEJS = 'nodejs';

/**
 * react
 * @desc 网站分类 - react
 */
export type REACT = 'react';

/**
 * 日期
 * @desc 网站分类 - 日期
 */
export type DATE = 'date';

/**
 * 博客
 * @desc 网站分类 - 博客
 */
export type BLOG = 'blog';

/**
 * 生活
 * @desc 网站分类 - 生活
 */
export type LIFE = 'life';

/**
 * 图书
 * @desc 网站分类 - 图书
 */
export type BOOK = 'book';

/**
 * 最近新增
 * @desc 网站分类 - 最近新增
 */
export type NEW = 'new';

/**
 * 图片处理
 * @desc 网站分类 - 图片处理
 */
export type IMAGE_PROCESS = 'imageProcess';

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
  | REAREND
  | MT
  | DOCUMENT
  | DESIGN
  | PACKAGE
  | NPM
  | FLUTTER
  | NODEJS
  | REACT
  | DATE
  | BLOG
  | LIFE
  | BOOK
  | NEW
  | IMAGE_PROCESS;
