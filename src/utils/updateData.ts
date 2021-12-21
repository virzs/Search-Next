/*
 * @Author: Vir
 * @Date: 2021-12-13 17:54:54
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-13 17:56:36
 */

import { deepCopy } from './common';

// 更新默认数据

class UpdateData {
  source: any; // 模板数据
  constructor(source: any) {
    this.source = source;
  }

  private objRecursion(source: any = {}, data: any = {}) {
    const deepData = deepCopy(data);
    const dataKeys = Object.keys(deepData);
    const sourceKeys = Object.keys(source);

    let newObj: { [x: string]: any } = {};

    sourceKeys.forEach((i) => {
      if (deepData[i] === undefined) {
        // 模板数据中 i 在数据源中不存在时
        newObj[i] = source[i];
      } else {
        // 模板数据中 i 在数据源中存在时
        newObj[i] = deepData[i];
      }
      // 模板数据中 i 为 Object 类型时向下检查
      if (source[i] instanceof Object) {
        if (Object.keys(source[i]).length !== Object.keys(deepData[i]).length) {
          newObj[i] = this.objRecursion(source[i], deepData[i]);
        }
      }
    });

    return newObj;
  }

  object(data: any = {}) {
    const result = this.objRecursion(this.source, data);

    return result;
  }
}

export default UpdateData;
