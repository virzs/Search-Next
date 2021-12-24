/*
 * @Author: Vir
 * @Date: 2021-12-18 23:10:06
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-19 20:56:38
 */

import websiteIconApis from '@/data/website';
import StorageDB from 'bsdb';

const BaseDB = new StorageDB({
  storage: localStorage,
  database: 'database',
});

export const OtherApisDB = BaseDB.get('otherApis');

type OtherApiType = 'icon';

interface OtherIconApiParams {
  userId: string;
  apiId: string;
  type: OtherApiType;
}

interface GetOtherIconApiParams {
  userId: string;
  type: OtherApiType;
}

// 设置 website icon api
export const setOtherIconApi = (params: OtherIconApiParams) => {
  const res = OtherApisDB.findOne({ userId: params.userId, type: params.type });
  if (res) {
    return OtherApisDB.update(res._id, params);
  } else {
    return OtherApisDB.inset(params);
  }
};

// 获取 website icon api
export const getOtherIconApi = (params: GetOtherIconApiParams) => {
  const res = OtherApisDB.findOne({ userId: params.userId, type: params.type });
  if (res) {
    const data = websiteIconApis.find((i) => i.id === res.apiId);
    return { ...res, ...data };
  } else {
    const newRecord = OtherApisDB.inset({
      ...params,
      apiId: websiteIconApis[0].id,
    });

    return {
      ...newRecord,
      ...websiteIconApis[0],
    };
  }
};
