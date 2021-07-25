/*
 * @Author: Vir
 * @Date: 2021-06-21 21:22:07
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-22 16:25:37
 */

import { SettingType } from './interface';

const defaultSetting = {
  background: {},
  topSite: {
    show: true,
    size: 8,
  },
};

// 存储本地
const setStorage = (data: SettingType) => {
  return localStorage.setItem('setting_data', JSON.stringify(data));
};

// 读取
const getStorage = (): SettingType => {
  return JSON.parse(
    localStorage.getItem('setting_data') || `${defaultSetting}`,
  );
};

// 更新设置 model模块 data该模块的设置数据
const updateSetting = <K extends keyof SettingType, D extends SettingType[K]>(
  model: K,
  data: D,
) => {
  let settingData = getStorage();
  settingData[model] = data;
  setStorage(settingData);
};

// 恢复默认
const restoreDefault = () => {
  setStorage(defaultSetting);
};
