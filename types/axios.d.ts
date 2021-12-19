/*
 * @Author: Vir
 * @Date: 2021-12-18 15:24:22
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-18 18:55:26
 */

import { AxiosInstance } from 'axios';

declare module 'axios' {
  export interface AxiosInstance {
    jsonp: (url: string, data?: any) => Promise<unknown>;
  }
}
