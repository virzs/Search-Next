/*
 * @Author: Vir
 * @Date: 2021-09-03 14:26:02
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-03 15:46:12
 */

import StorageDB from '@/utils/storage';

const BaseDB = new StorageDB({
  storage: localStorage,
  database: 'database',
});

const SiteDB = BaseDB.get('site');

export interface Site {
  _id: string;
  name: string;
  url: string;
  count: number;
}

export interface AddSite {
  name: string; //名称
  url: string; //网址
}

export const findSite = () => {
  const account = localStorage.getItem('account');
  const result = SiteDB.find(
    {
      userId: {
        $eq: account,
      },
    },
    {
      sort: {
        count: -1,
      },
    },
  );

  return result;
};

export const addSite = (params: AddSite) => {
  const account = localStorage.getItem('account');
  const result = SiteDB.inset({ ...params, count: 0, userId: account });

  return result;
};

export const editSite = (id: string, params: AddSite) => {
  const result = SiteDB.update(id, params);

  return result;
};

export const addCount = (id: string) => {
  const data = SiteDB.findOne(id);
  const result = SiteDB.update(id, { ...data, count: data.count + 1 });

  return result;
};

// 删除
export const delSite = (id: string) => {
  const site = SiteDB.find(id);
  const result = SiteDB.remove(id);
  sessionStorage.setItem('site-repeal', JSON.stringify(site));

  return result;
};

// 撤销删除
export const repeal = () => {
  let item = {};
  let session = sessionStorage.getItem('site-repeal');
  if (session !== null) {
    item = JSON.parse(session);
    sessionStorage.removeItem('site-repeal');
  }
  const result = SiteDB.inset(item);

  return result;
};
