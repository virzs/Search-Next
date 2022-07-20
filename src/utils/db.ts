/*
 * @Author: vir virs98@outlook.com
 * @Date: 2022-07-03 20:39:14
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-14 11:00:43
 */

import StorageDB from 'bsdb';

// 默认数据库名称
export const BASE_DB_NAME = 'DB';

// 默认用户设置表名
export const DB_USER_SETTING_NAME = 'USER_SETTING';

// 默认用户设置主题表名
export const SETTING_THEME = `${DB_USER_SETTING_NAME}_THEME`;

// 默认用户设置天气表名
export const SETTING_WEATHER = `${DB_USER_SETTING_NAME}_WEATHER`;

// 默认用户设置背景表名
export const SETTING_BACKGROUND = `${DB_USER_SETTING_NAME}_BACKGROUND`;

// 默认用户设置预览体验渠道表名
export const SETTING_PREVIEW_CHANNEL = `${DB_USER_SETTING_NAME}_PREVIEW_CHANNEL`;

// 默认用户设置导航页表名
export const SETTING_NAVIGATION = `${DB_USER_SETTING_NAME}_NAVIGATION`;

// 默认用户设置消息表名
export const SETTING_MESSAGE = `${DB_USER_SETTING_NAME}_MESSAGE`;

export interface DB_BASE_COL {
  createdTime: string;
  updatedTime: string;
  _id: string;
}

export const DB = new StorageDB({
  storage: localStorage,
  database: 'DB',
});

/**
 * @name 用户设置主题
 */
export const STDB = DB.get(SETTING_THEME);

/**
 * @name 天气相关设置数据库
 * @desc 存储用户设置的天气相关设置
 */
export const SWDB = DB.get(SETTING_WEATHER);

/**
 * @name 背景相关设置数据库
 * @desc 存储用户设置的背景相关设置
 */
export const SBDB = DB.get(SETTING_BACKGROUND);

/**
 * @name 预览铜套相关设置数据库
 * @desc 存储用户设置的预览通道相关设置
 */
export const SPCDB = DB.get(SETTING_PREVIEW_CHANNEL);

/**
 * @name 导航页相关设置数据库
 * @desc 存储用户设置的导航页相关设置
 */
export const SNDB = DB.get(SETTING_NAVIGATION);

/**
 * @name 消息相关设置数据库
 * @desc 存储用户设置的消息相关设置
 */
export const SMDB = DB.get(SETTING_MESSAGE);
