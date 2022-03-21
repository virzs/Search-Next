/*
 * @Author: Vir
 * @Date: 2022-03-16 15:48:40
 * @Last Modified by:   Vir
 * @Last Modified time: 2022-03-16 15:48:40
 */

import { authDefaultData } from '@/data/account/default';
import { Theme } from '@/data/account/interface';
import { getAuthDataByKey, updateAuthDataByKey } from '../auth';

// 获取当前用户主题数据
export const getUserThemeSetting = () => {
  return new Promise<Theme>((resolve, reject) => {
    const id = localStorage.getItem('account');
    const result = getAuthDataByKey(id || '', 'theme');
    if (!result) {
      updateAuthDataByKey(id || '', 'theme', authDefaultData.theme);
      resolve(authDefaultData.theme as Theme);
    } else {
      resolve(result);
    }
  });
};

// 更新当前用户主题数据
export const updateUserThemeSetting = (data: Theme) => {
  return new Promise<Theme>((resolve, reject) => {
    const id = localStorage.getItem('account');
    const result = updateAuthDataByKey(id || '', 'theme', data);
    resolve(result);
  });
};
