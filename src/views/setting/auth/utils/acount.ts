/*
 * @Author: Vir
 * @Date: 2021-09-20 17:07:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-20 17:08:59
 */

import { addAccount, findAccount } from '@/apis/auth';
import { authDefaultData } from '@/data/account/default';

// 不存在账户信息时设置
const noAccountSet = () => {
  const inset = addAccount(authDefaultData);
  localStorage.setItem('account', inset._id);
  return inset;
};

// 获取账户信息
export const getAccount = () => {
  const userId = localStorage.getItem('account');
  if (userId) {
    const user = findAccount(userId);
    return user ? user : noAccountSet();
  } else {
    return noAccountSet();
  }
};
