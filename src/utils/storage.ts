/*
 * @Author: Vir
 * @Date: 2021-07-21 13:35:29
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-21 13:45:28
 */

import store from 'store';

interface StorageBootStrapConfig {
  /** 当前环境 */
  mode: 'session' | 'local';

  /** 超时时间 */
  timeout?: number;
}

class CustomStorage {
  private readStorage!: Storage;
  private config!: StorageBootStrapConfig;

  constructor() {
    if (!window) {
      throw new Error('当前环境非浏览器，无法消费全局window实例。');
    }
    if (!window.localStorage) {
      throw new Error('当前环境非无法使用localStorage');
    }
    if (!window.sessionStorage) {
      throw new Error('当前环境非无法使用sessionStorage');
    }
  }

  /**
   * 初始化Storage的数据
   * @param config StorageBootStrapConfig
   */
  bootStrap(config: StorageBootStrapConfig): void {
    switch (config.mode) {
      case 'session':
        this.readStorage = window.sessionStorage;
        break;

      default:
      case 'local':
        this.readStorage = window.localStorage;
        break;
    }
    this.config = config;
  }
}

const customStorage = new CustomStorage();

customStorage.bootStrap({
  mode: 'local',
  timeout: 3000,
});

export default customStorage;
