/*
 * @Author: Vir
 * @Date: 2021-09-01 13:49:23
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-01 14:26:57
 */

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
export const editAccount = (id: string, query: { username: string }) => {
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
