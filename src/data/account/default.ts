/*
 * @Author: Vir
 * @Date: 2021-08-15 00:00:37
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-24 14:14:32
 */

// 默认的用户数据

export type AuthBackgroundType = 'color' | 'random' | 'everyday' | 'link';

export interface AuthBackgroundRandomData {
  url: string;
  id: string;
  hsh: string;
  copyright: string;
  copyrightlink: string;
}

export interface AuthBackground {
  type: AuthBackgroundType; // 背景类型
  data?: AuthBackgroundRandomData; // 背景数据
}

export interface AuthData {
  _id?: string;
  username: string; // 用户名
  avatar?: string; // 头像
  type: 'local' | 'cloud'; // 账户类型 local本地 cloud云端
  createdTime?: string;
  updatedTime?: string;
  language: 'zh-CN' | 'en-US'; // 账户所选语言
  background: AuthBackground;
  sync: {
    setting: boolean; // 设置同步
    website: boolean; // 常用网址同步
    history: boolean; // 历史记录同步
  }; // 是否同步，默认false
}

export const authDefaultData: AuthData = {
  username: '默认账户',
  avatar: '',
  type: 'local',
  language: 'zh-CN',
  background: { type: 'color' },
  sync: {
    setting: false,
    website: false,
    history: false,
  },
};

export interface SettingDefaultData {
  background: any;
  showWebsite: boolean;
  language: 'zh-CN' | 'zn-US';
}

export const settingDefaultData: SettingDefaultData = {
  background: '',
  showWebsite: true,
  language: 'zh-CN',
};
