import axios from 'axios';
/*
 * @Author: Vir
 * @Date: 2021-06-06 22:01:45
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-14 23:00:59
 */

export interface bingImgParamsType {
  size?: number;
}

// 获取bing随机壁纸
export const bingImg = (params?: bingImgParamsType) => {
  return axios.get('/v1/resource/bing/random', {
    params,
  });
};
