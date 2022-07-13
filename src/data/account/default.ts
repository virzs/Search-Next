/*
 * @Author: vir virs98@outlook.com
 * @Date: 2021-09-22 14:38:03
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-13 16:53:18
 */

// ! 账户默认数据

import { AuthData, SettingDefaultData } from './interface';

export const authDefaultData: AuthData = {
  username: '默认账户',
  avatar: '',
  type: 'local',
  language: 'zh-CN',
  logo: {
    show: true,
    type: 'clock',
    zoom: true,
    config: {
      clock: {
        type: 'clock1',
      },
      text: {
        title: '',
        subTitle: '',
      },
      image: {
        url: '',
      },
    },
  },
  message: {
    update: true,
  },
  latestVersion: '',
  sync: {
    setting: false,
    website: false,
    history: false,
  },
  engine: {
    mode: 'default',
    indexCount: 4,
    sortType: 'default',
  },
};

export const settingDefaultData: SettingDefaultData = {
  background: '',
  showWebsite: true,
  language: 'zh-CN',
};
