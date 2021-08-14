/*
 * @Author: Vir
 * @Date: 2021-03-27 16:37:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-19 13:43:18
 */

import mainData, { CopyrightType } from '@/data/main/index';
import { ResultTypes } from '@/typings/result';
import { replaceUrlHaveHttpsOrHttpToEmpty } from '@/utils/common';

interface CopyrightTypeWithVersion extends CopyrightType {
  version: string;
}

interface CopyrightResultTypes extends ResultTypes {
  data: CopyrightTypeWithVersion;
}

export const copyright = () => {
  const copyrightData = { version: mainData.version, ...mainData.copyright };
  return new Promise<CopyrightResultTypes>((resolve) => {
    resolve({ code: 200, msg: '获取成功', data: copyrightData });
  });
};

// 获取网站icon
export const getWebIconByUrl = (url?: string) => {
  let newUrl = replaceUrlHaveHttpsOrHttpToEmpty(url || '');
  return url
    ? `http://statics.dnspod.cn/proxy_favicon/_/favicon?domain=${newUrl}`
    : '';
};
