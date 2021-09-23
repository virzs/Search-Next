/*
 * @Author: Vir
 * @Date: 2021-06-07 13:54:26
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-12 18:13:14
 */
import axios from 'axios';

//axios默认配置
const instance = axios.create({
  baseURL: 'http://api.virs.xyz',
  timeout: 10000,
  validateStatus: (status: number) => status >= 200 && status <= 500,
});

//在请求或响应被 then 或 catch 处理前拦截。
instance.interceptors.request.use(
  (config) => {
    // 设置请求头
    config['headers'] = {};
    return config;
  },
  (error) => {
    const response = error.response;
    // 根据返回的http状态码做不同的处理
    switch (response?.status) {
      case 401:
        // token失效
        break;
      case 403:
        // 没有权限
        break;
      case 500:
        // 服务端错误
        break;
      case 503:
        // 服务端错误
        break;
      default:
        break;
    }
    return Promise.reject(error);
  },
);

//响应拦截器，处理请求后的数据
instance.interceptors.response.use(
  (res) => {
    // 处理返回数据
    return res;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default instance;

export const GetRequest = () => {};

export const PostRequest = () => {};

export const PutRequest = () => {};

export const DelRequest = () => {};
