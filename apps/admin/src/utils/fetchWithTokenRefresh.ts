import { getToken, getRefreshToken, setToken, setRefreshToken } from "./token";
import { postRefreshToken } from "../services/auth";
import { history } from "./history";

/**
 * 带有token过期重试功能的fetch封装
 * @param url 请求URL
 * @param options fetch选项
 * @param maxRetries 最大重试次数，默认为1
 * @returns Promise<Response>
 */
export const fetchWithTokenRefresh = async (
  url: string,
  options: RequestInit = {},
  maxRetries: number = 1
): Promise<Response> => {
  const token = getToken();

  // 添加Authorization头
  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, requestOptions);

    // 如果是401错误且还有重试次数，尝试刷新token
    if (response.status === 401 && maxRetries > 0) {
      const refreshToken = getRefreshToken();

      if (!refreshToken || [null, undefined, ""].includes(refreshToken)) {
        // 没有refreshToken，跳转到登录页
        history.replace("/login");
        window.location.reload();
        throw new Error("No refresh token available");
      }

      try {
        // 刷新token
        const refreshResult = await postRefreshToken({
          refreshToken: refreshToken as string,
        });

        if (refreshResult.access_token) {
          setToken(refreshResult.access_token);
          console.log("Access token refreshed!");

          if (refreshResult.refresh_token) {
            console.log("Refresh token updated!");
            setRefreshToken(refreshResult.refresh_token);
          }

          // 使用新token重新发起请求
          const newHeaders = {
            ...options.headers,
            Authorization: `Bearer ${refreshResult.access_token}`,
          };

          return await fetch(url, {
            ...options,
            headers: newHeaders,
          });
        } else {
          throw new Error("Failed to refresh token");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // 刷新失败，跳转到登录页
        history.replace("/login");
        window.location.reload();
        throw refreshError;
      }
    }

    return response;
  } catch (error) {
    // 网络错误或其他错误，直接抛出
    throw error;
  }
};

/**
 * 创建一个带有token刷新功能的OpenAI客户端fetch函数
 * @param getProviderId 获取提供商ID的回调函数
 * @returns fetch函数
 */
export const createOpenAIFetchWithTokenRefresh = (getProviderId: () => string) => {
  return async (_: string | URL | Request, options?: RequestInit) => {
    const providerId = getProviderId(); // 每次请求时动态获取最新的providerId
    const headers = {
      ...options?.headers,
      "x-provider-id": providerId,
    };

    return fetchWithTokenRefresh("/api/ai/playground", {
      method: options?.method || "POST",
      headers,
      body: options?.body,
    });
  };
};
