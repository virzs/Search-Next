/*
 * @Author: Vir
 * @Date: 2021-12-13 17:54:54
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-13 17:56:36
 */

import { deepCopy } from './common';

// 更新默认数据

class UpdateData {
  constructor() {}

  object(source: any = {}, data: any = {}) {
    const deepData = deepCopy(data);
    Object.keys(source).forEach((i) => {
      if (!deepData[i]) {
        deepData[i] = source[i];
      }
    });
    return deepData;
  }
}

export default UpdateData;
