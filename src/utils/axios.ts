import axios, { AxiosRequestConfig } from "axios";
import { notification } from "antd";
import { getApiPrefix } from "./utils";
import { getRefreshToken, getToken, setRefreshToken, setToken } from "./token";
import { postRefreshToken } from "../services/auth";

const axiosInstance = axios.create({});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    if (error.response.status === 400) {
      const errMsg = error.response.data.message;
      notification.error({
        message: 400,
        description: errMsg,
      });
    }
    if (error.response.status === 500 && error.config.url.includes("/auth/refresh-token")) {
      // history.replace("/login");
      window.location.reload();
    }
    console.log(originalRequest._retry);
    if (
      error.response.status === 401 &&
      !error.config.url.includes("/auth/refresh-token") &&
      originalRequest._retry === undefined
    ) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if ([null, undefined, ""].includes(refreshToken)) {
        // history.replace("/login");
        window.location.reload();
        return;
      }
      return postRefreshToken({
        refreshToken: refreshToken as string,
      })
        .then((res) => {
          if (res.access_token) {
            setToken(res.access_token);
            console.log("Access token refreshed!");
            if (res.refresh_token) {
              console.log("Access token refreshed!");
              setRefreshToken(res.refresh_token);
            }
            return axiosInstance(originalRequest);
          }
        })
        .catch(() => {
          // history.replace("/login");
          window.location.reload();
          return;
        });
    }
    if (error.response.status === 429) {
      notification.error({
        message: 429,
        description: "请求次数过多，请稍后再试！",
      });
    }
    if (error.response.status === 500) {
      notification.error({
        message: 500,
        description: error.response.data.message,
      });
    }
    return Promise.reject(error);
  }
);

export interface BaseParamsType {
  site_uid?: string;
}

export interface BaseInfo {
  id: number;
  name?: string;
}

export const getBaseParams = (): BaseParamsType => {
  return {};
};

export const baseGetRequest =
  <T = any>(url: string, options?: AxiosRequestConfig) =>
  async (params: object = {}) =>
    axiosInstance<T, T>(getApiPrefix(url), {
      ...options,
      method: "GET",
      params: {
        ...getBaseParams(),
        ...params,
      },
    });

export const baseDetailRequest =
  <T = any>(url: string, options?: AxiosRequestConfig) =>
  async (id: number | string | Array<number | string>, params: object = {}) =>
    axiosInstance<T, T>(getApiPrefix(url, id), {
      ...options,
      method: "GET",
      params: {
        ...getBaseParams(),
        ...params,
      },
    });

export const basePostRequest =
  <T = any>(url: string, options?: AxiosRequestConfig) =>
  async (data?: object, params: object = {}) =>
    axiosInstance<T, T>(getApiPrefix(url), {
      ...options,
      method: "POST",
      params: {
        ...getBaseParams(),
        ...params,
      },
      data,
    });

export const basePutRequest =
  <T = any>(url: string, options?: AxiosRequestConfig) =>
  async (id: number | string | Array<number | string>, data: object, params: object = {}) =>
    axiosInstance<T, T>(getApiPrefix(url, id), {
      ...options,
      method: "PUT",
      params: {
        ...getBaseParams(),
        ...params,
      },
      data,
    });

export const basePutRequestNoId =
  <T = any>(url: string, options?: AxiosRequestConfig) =>
  async (data: object, params: object = {}) =>
    axiosInstance<T, T>(getApiPrefix(url), {
      ...options,
      method: "PUT",
      params: {
        ...getBaseParams(),
        ...params,
      },
      data,
    });

export const baseDeleteRequest =
  <T = any>(url: string, options?: AxiosRequestConfig) =>
  async (id: number | string | Array<number | string>, params: object = {}) =>
    axiosInstance<T, T>(getApiPrefix(url, id), {
      ...options,
      method: "DELETE",
      params: {
        ...getBaseParams(),
        ...params,
      },
    });

// 扩展axios实例，添加jsonp方法
(axiosInstance as any).jsonp = (url: string, data?: any) => {
  if (!url) throw new Error("url is necessary");
  const callback = "CALLBACK" + Math.random().toString().substr(9, 18);
  const JSONP = document.createElement("script");
  JSONP.setAttribute("type", "text/javascript");

  const headEle = document.getElementsByTagName("head")[0];

  let ret = "";
  if (data) {
    if (typeof data === "string") ret = "&" + data;
    else if (typeof data === "object") {
      for (let key in data) ret += "&" + key + "=" + encodeURIComponent(data[key]);
    }
    ret += "&_time=" + Date.now();
  }
  JSONP.src = `${url}?callback=${callback}${ret}`;
  const w = window as any;
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      headEle.removeChild(JSONP);
      delete w[callback];
      reject(new Error("JSONP request timeout"));
    }, 5000);

    w[callback] = (r: any) => {
      clearTimeout(timeoutId);
      resolve(r);
      headEle.removeChild(JSONP);
      delete w[callback];
    };

    JSONP.onerror = () => {
      clearTimeout(timeoutId);
      headEle.removeChild(JSONP);
      delete w[callback];
      reject(new Error("JSONP script load error"));
    };

    headEle.appendChild(JSONP);
  });
};

export default axiosInstance;
