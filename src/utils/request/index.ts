/*
 * @Author: Vir
 * @Date: 2021-06-07 13:54:26
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-18 19:44:47
 */
import axios from 'axios';

//axios默认配置
const instance = axios.create({
  baseURL: 'https://api.search.virs.xyz',
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
    return res.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.jsonp = (url: string, data?: any) => {
  if (!url) throw new Error('url is necessary');
  const callback = 'CALLBACK' + Math.random().toString().substr(9, 18);
  const JSONP = document.createElement('script');
  JSONP.setAttribute('type', 'text/javascript');

  const headEle = document.getElementsByTagName('head')[0];

  let ret = '';
  if (data) {
    if (typeof data === 'string') ret = '&' + data;
    else if (typeof data === 'object') {
      for (let key in data)
        ret += '&' + key + '=' + encodeURIComponent(data[key]);
    }
    ret += '&_time=' + Date.now();
  }
  JSONP.src = `${url}?callback=${callback}${ret}`;
  const w = window as any;
  return new Promise((resolve, reject) => {
    w[callback] = (r: any) => {
      resolve(r);
      headEle.removeChild(JSONP);
      delete w[callback];
    };
    headEle.appendChild(JSONP);
  });
};

export const GetRequest = () => {};

export const PostRequest = () => {};

export const PutRequest = () => {};

export const DelRequest = () => {};

export const JsonpRequest = (url: string, data?: any) => {
  return instance.jsonp(url, data);
};

export default instance;
