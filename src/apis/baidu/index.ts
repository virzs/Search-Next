/*
 * @Author: Vir
 * @Date: 2021-08-08 13:12:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-12 18:13:39
 */

import instance from '@/utils/request/index';

// 获取搜索提示词
export const baiduSug = (wd: string) => {
  return instance.get('/v1/resource/baidu/sug', {
    params: { wd },
  });
};
