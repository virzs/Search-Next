/*
 * @Author: Vir
 * @Date: 2021-09-20 17:07:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-15 15:54:48
 */

import { addAccount, editAccount, findAccount } from '@/apis/auth';
import { authDefaultData } from '@/data/account/default';
import UpdateData from '@/utils/updateData';

// 不存在账户信息时设置
const noAccountSet = () => {
  const inset = addAccount(authDefaultData);
  localStorage.setItem('account', inset._id);
  return inset;
};

// 获取账户信息，没有时自动新增一个，否则检查默认数据是否有更新并更新数据
export const getAccount = () => {
  const userId = localStorage.getItem('account');
  if (userId) {
    const user = findAccount(userId);
    // ! 账号存在时更新
    if (user) {
      const Update = new UpdateData();
      const result = Update.object(authDefaultData, user);
      editAccount(userId, result);
      return findAccount(userId);
    } else {
      return noAccountSet();
    }
  } else {
    return noAccountSet();
  }
};
