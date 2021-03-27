/*
 * @Author: Vir
 * @Date: 2021-03-27 16:37:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-27 16:55:20
 */

import mainData, { CopyrightType } from '@/data/main/index';
import { ResultTypes } from '@/typings/result';

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
