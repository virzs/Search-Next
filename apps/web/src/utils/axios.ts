import axios, { AxiosRequestConfig } from "axios";
import { getApiPrefix } from "./utils";
import { postRefreshToken } from "../services/auth";
import { notification } from "./globalNotification";
import { getRefreshToken, getToken, setRefreshToken, setToken } from "./token";
import { LEGAL_CONFIRMATION_REQUIRED_EVENT } from "./legal-confirmation";

const axiosInstance = axios.create({});

// Token刷新队列管理
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

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
    if (!error.response) {
      return Promise.reject(error);
    }
    const requestUrl = String(error.config?.url ?? "");
    if (
      error.response.status === 428 &&
      error.response.data?.code === "LEGAL_CONFIRMATION_REQUIRED"
    ) {
      window.dispatchEvent(
        new CustomEvent(LEGAL_CONFIRMATION_REQUIRED_EVENT, {
          detail: error.response.data,
        }),
      );
    }
    if (error.response.status === 400) {
      const errMsg = error.response.data.message;
      notification.error({
        message: 400,
        description: errMsg,
      });
    }
    if (error.response.status === 500 && requestUrl.includes("/auth/refresh-token")) {
      // TODO: 处理刷新token失败的情况
    }
    if (
      error.response.status === 401 &&
      !requestUrl.includes("/auth/refresh-token") &&
      originalRequest &&
      !originalRequest?._retry
    ) {
      const refreshToken = getRefreshToken();
      if ([null, undefined, ""].includes(refreshToken)) {
        // TODO: 处理刷新token为空的情况
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 如果正在刷新token，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // 刷新成功后重试原请求
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        postRefreshToken({
          refreshToken: refreshToken as string,
        })
          .then((res) => {
            if (res.access_token) {
              setToken(res.access_token);
              console.log("Access token refreshed!");
              if (res.refresh_token) {
                console.log("Refresh token updated!");
                setRefreshToken(res.refresh_token);
              }
              // 处理队列中的请求
              processQueue(null, res.access_token);
              resolve(axiosInstance(originalRequest));
            } else {
              processQueue(new Error("Token refresh failed"), null);
              reject(error);
            }
          })
          .catch((err) => {
            processQueue(err, null);
            // TODO: 处理刷新token失败的情况
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
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
        description: error.response.data.message ?? "无法访问服务器，请稍后再试",
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
  async (id: number | string | Array<number | string>, data?: object, params: object = {}) =>
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

export const baseDeleteRequestNoId =
  <T = any>(url: string, options?: AxiosRequestConfig) =>
  async (data?: object, params: object = {}) =>
    axiosInstance<T, T>(getApiPrefix(url), {
      ...options,
      method: "DELETE",
      params: {
        ...getBaseParams(),
        ...params,
      },
      data,
    });

export default axiosInstance;
