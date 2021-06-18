import instance from '@/utils/request';
/*
 * @Author: Vir
 * @Date: 2021-06-06 22:01:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-16 13:50:33
 */

export interface bingImgParamsType {
  size?: number;
  hsh?: string;
}

// 获取bing随机壁纸
export const bingImg = (params?: bingImgParamsType) => {
  return instance.get('/v1/resource/bing/random', {
    params,
  });
};
