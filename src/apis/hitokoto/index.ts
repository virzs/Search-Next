/*
 * @Author: Vir
 * @Date: 2021-06-02 11:36:37
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-02 14:09:29
 */

import axios from 'axios';
import { HitokotoParamsType } from './interface';

export const hitokoto = (params: HitokotoParamsType) => {
  return axios.get('https://v1.hitokoto.cn', {
    params: { encode: 'json', ...params },
  });
};
