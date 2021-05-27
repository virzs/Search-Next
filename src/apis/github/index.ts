/*
 * @Author: Vir
 * @Date: 2021-03-28 21:46:07
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-26 17:06:00
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

// 获取github releases记录
export const releasesList = (page: number = 1, size: number = 10) => {
  return axios.get('https://api.github.com/repos/virzs/Search-React/releases', {
    params: {
      page: page,
      per_page: size,
    },
  });
};
