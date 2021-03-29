/*
 * @Author: Vir
 * @Date: 2021-03-28 21:46:07
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-29 09:56:11
 */

import axios from 'axios';

// 获取github commit记录
export const commitList = (page: number = 1, size: number = 10) => {
  return axios.get('https://api.github.com/repos/virzs/Search-React/commits', {
    params: {
      page: page,
      per_page: size,
    },
  });
};
