/*
 * @Author: Vir
 * @Date: 2021-03-27 16:37:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-19 15:49:23
 */

import mainData, { CopyrightType } from '@/data/main/index';
import { ResultTypes } from '@/typings/index';
import { replaceUrlHaveHttpsOrHttpToEmpty } from '@/utils/common';
import { getOtherIconApi } from '../setting/otherApis';

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
  const userId = localStorage.getItem('account');
  const iconApiData = getOtherIconApi({
    userId: userId ?? '',
    type: 'icon',
  });
  return url ? `${iconApiData.url}${newUrl}` : '';
};
