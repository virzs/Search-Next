/*
 * @Author: Vir
 * @Date: 2021-06-07 15:14:41
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-12 18:13:30
 */

import { AxiosRequestConfig, CustomSuccessData } from 'axios';

declare module 'axios' {
  // 定制业务相关的网络请求响应格式， T 是具体的接口返回类型数据
  export interface CustomSuccessData<T> {
    code: number;
    msg?: string;
    message?: string;
    data?: T;
    [keys: string]: any;
  }
}

// 泛型接口
export interface Get {
  <T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<
    CustomSuccessData<T>
  >;
}

export interface requestOptionsType {
  headers?: object;
  method: any;
  url: string;
  data?: object;
  params?: object;
}
