/*
 * @Author: Vir
 * @Date: 2021-09-01 13:49:23
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-22 15:04:39
 */

import { authDefaultData } from '@/data/account/default';
import { AuthBackground, AuthData, AuthLogo } from '@/data/account/type';
import StorageDB from '@/utils/storage';

const BaseDB = new StorageDB({
  storage: localStorage,
  database: 'database',
});

export const AuthDB = BaseDB.get('auth');

// 获取账户列表 参数id查找除此id外的账户
export const findAccounts = (id?: string | null) => {
  let query = {} as { _id: { $ne: string } };

  if (id) {
    query._id = {
      $ne: id,
    };
  }

  return AuthDB.find(query);
};

// 获取单个账户
export const findAccount = (id: string) => {
  return AuthDB.findOne(id);
};

// 获取单个账户
export const findAccountByName = (name: string) => {
  let query = {
    username: {
      $eq: name,
    },
  };
  return AuthDB.findOne(query);
};

// 删除账户
export const delAccount = (id: string): any => {
  return AuthDB.remove(id);
};

// 修改账户
export const editAccount = (
  id: string,
  query: { username?: string; background?: AuthBackground },
) => {
  return AuthDB.update(id, query);
};

// 添加账户
export const addAccount = (data: any): any => {
  return AuthDB.inset(data);
};

// 账户总数
export const accountsCount = () => {
  return AuthDB.count();
};

// 获取账户中 logo 设置数据
export const logoSetting = (id: string): AuthLogo => {
  const account: AuthData = AuthDB.findOne(id);
  if (!account) throw new Error('未找到该账户');
  const logoSetting = account.logo;
  if (logoSetting) return logoSetting;
  AuthDB.update(id, { logo: authDefaultData.logo });
  return authDefaultData.logo as AuthLogo;
};

// 单独更新 logo 设置数据
export const updateLogoSetting = (id: string, data: AuthLogo) => {
  return AuthDB.update(id, { logo: data });
};
