/*
 * @Author: Vir
 * @Date: 2021-08-15 00:00:37
 * @Last Modified by: Vir
 * @Last Modified time: 2022-03-16 17:19:44
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
  navigation: {
    type: 'page',
  },
  message: {
    update: true,
  },
  latestVersion: '',
  beta: false,
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
  theme: {
    type: 'light',
    darkSettings: {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      sepia: 0,
    },
  },
};

export const settingDefaultData: SettingDefaultData = {
  background: '',
  showWebsite: true,
  language: 'zh-CN',
};
