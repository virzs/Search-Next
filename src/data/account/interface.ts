/*
 * @Author: Vir
 * @Date: 2021-10-17 21:26:07
 * @Last Modified by: Vir
 * @Last Modified time: 2022-07-03 21:05:06
 */

import { ClockLogoType, LogoType } from '../logo';

// 默认的用户数据

// 账户类型
export type AuthType = 'local' | 'cloud';

// 语言
export type LanguageType = 'zh-CN' | 'en-US';

// 时钟类型设置
export interface ClockLogo {
  type: ClockLogoType;
}

// 文字类型设置
export interface TextLogo {
  title: string;
  subTitle: string;
}

// 图片类型设置
export interface ImageLogo {
  url: string;
}

export type LogoConfigType = {
  clock: ClockLogo;
  text: TextLogo;
  image: ImageLogo;
};

// Logo 数据
export interface AuthLogo {
  show: boolean;
  type: LogoType;
  zoom: boolean;
  config: LogoConfigType;
}

export type AccountUpdateMessageRemind = 'message' | 'notification' | 'popup';

// 搜索引擎设置
export interface Engine {
  mode: 'default' | 'custom';
  indexCount: number;
  sortType: 'default' | 'count';
  selected?: string;
}

export interface AuthData {
  _id?: string;
  username: string; // 用户名
  avatar?: string; // 头像
  type: AuthType; // 账户类型 local本地 cloud云端
  createdTime?: string;
  updatedTime?: string;
  language: LanguageType; // 账户所选语言
  logo?: AuthLogo;
  latestVersion: string;
  sync: {
    setting: boolean; // 设置同步
    website: boolean; // 常用网址同步
    history: boolean; // 历史记录同步
  }; // 是否同步，默认false
  engine?: Engine;
}

export interface SettingDefaultData {
  background: any;
  showWebsite: boolean;
  language: LanguageType;
}
