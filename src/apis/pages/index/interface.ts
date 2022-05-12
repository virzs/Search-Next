/*
 * @Author: Vir
 * @Date: 2022-05-10 11:30:22
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-10 17:12:13
 */

import { NavigationType } from '@/data/account/interface';

export interface IndexPageWeatherSetting {
  show: boolean;
  interval: number;
}

/**
 * @name 首页设置相关
 */
export interface IndexPageSetting {
  navBar: {
    left: {
      weather: IndexPageWeatherSetting;
    };
    right: {
      navigation: {
        show: boolean;
        type: NavigationType;
      };
      setting: {
        show: boolean;
      };
    };
  };
  content: {
    logo: {
      show: boolean;
    };
    searchBar: {
      show: boolean;
    };
    commonWebsite: {
      show: boolean;
    };
  };
  footer: {
    show: boolean;
    text: string;
  };
}

export interface IndexWeatherParams {
  userId: string;
  show: boolean;
  interval: number;
}
