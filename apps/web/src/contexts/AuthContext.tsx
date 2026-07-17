import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRequest } from "ahooks";
import {
  UserInfo,
  AuthContextValue,
  LoginResponse,
  LoginFormData,
  RegisterFormData,
} from "../types/auth";
import { postLogin, postRegister, postLogout } from "../services/auth";
import {
  getToken,
  removeRefreshToken,
  removeToken,
  setRefreshToken,
  setToken,
} from "../utils/token";
import { notification } from "../utils/globalNotification";
import { emailToGradient } from "../utils/emailGradient";
import { getLegalConfirmationPayload } from "../utils/legal-confirmation";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [coverGradientCss, setCoverGradientCss] = useState<string | null>(null);

  const completeAuthentication = (
    res: {
      _id?: string;
      username?: string;
      createdAt?: Date;
      access_token?: string;
      refresh_token?: string;
    },
    email: string,
    successMessage: string,
  ): LoginResponse => {
    if (!res._id || !res.username || !res.access_token) {
      return { success: false, message: successMessage };
    }
    const userPayload: UserInfo = {
      _id: res._id,
      username: res.username,
      email,
      createdAt: res.createdAt ?? new Date(),
    };
    setUser(userPayload);
    setIsAuthenticated(true);
    setToken(res.access_token);
    if (res.refresh_token) setRefreshToken(res.refresh_token);
    localStorage.setItem("user_info", JSON.stringify(userPayload));
    return {
      success: true,
      message: successMessage,
      user: userPayload,
      token: res.access_token,
      refreshToken: res.refresh_token,
    };
  };

  // 初始化时检查本地存储的用户信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        const userStr =
          localStorage.getItem("user_info") ||
          sessionStorage.getItem("user_info");

        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // 清除可能损坏的数据
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 根据用户邮箱生成封面；未登录时设为 null
  useEffect(() => {
    const email = user?.email?.trim().toLowerCase();
    if (email) {
      try {
        const cover = emailToGradient(email);
        setCoverGradientCss(cover.css);
      } catch (e) {
        console.log("🚀 ~ AuthProvider ~ e:", e);
        // 避免生成失败影响上下文使用
        setCoverGradientCss(null);
      }
    } else {
      setCoverGradientCss(null);
    }
  }, [user?.email]);

  // 使用 useRequest 封装登录
  const { loading: loginLoading, runAsync: runLogin } = useRequest(
    async (data: LoginFormData) => {
      return await postLogin({
        email: data.email,
        password: data.password,
        turnstileToken: data.turnstileToken,
        legalConfirmations: data.legalConfirmations,
        legalConfirmationLocale: data.legalConfirmationLocale,
      });
    },
    { manual: true },
  );

  const login = async (data: LoginFormData): Promise<LoginResponse> => {
    try {
      const res = await runLogin(data);

      return completeAuthentication(res, data.email, "登录成功");
    } catch (error: any) {
      const legalPayload = getLegalConfirmationPayload(error);
      if (legalPayload) {
        return {
          success: false,
          message: legalPayload.message || "请确认最新协议",
          legalConfirmationRequired: true,
          legalDocuments: legalPayload.documents,
        };
      }
      return { success: false, message: error.message || "登录失败" };
    }
  };

  // 使用 useRequest 封装注册
  const {
    loading: registerRequestLoading,
    runAsync: runRegister,
  } = useRequest(
    async (data: RegisterFormData) => {
      return await postRegister({
        username: data.username,
        email: data.email,
        password: data.password,
        captcha: Number(data.captcha) || undefined,
        invitationCode: data.invitationCode ?? "",
        turnstileToken: data.turnstileToken,
        legalConfirmations: data.legalConfirmations,
        legalConfirmationLocale: data.legalConfirmationLocale,
      });
    },
    { manual: true },
  );

  const register = async (data: RegisterFormData): Promise<LoginResponse> => {
    try {
      const registerResponse = await runRegister(data);

      if (registerResponse.access_token) {
        return completeAuthentication(
          registerResponse,
          data.email,
          "注册成功",
        );
      }

      const loginResponse = await login({
        email: data.email,
        password: data.password,
        turnstileToken: data.turnstileToken,
        legalAccepted: data.legalAccepted,
        legalConfirmations: data.legalConfirmations,
        legalConfirmationLocale: data.legalConfirmationLocale,
      });

      if (!loginResponse.success) {
        return {
          ...loginResponse,
          message: `注册成功，但自动登录失败：${loginResponse.message}`,
        };
      }

      return {
        ...loginResponse,
        message: "注册成功",
      };
    } catch (error: any) {
      const legalPayload = getLegalConfirmationPayload(error);
      if (legalPayload) {
        return {
          success: false,
          message: legalPayload.message || "请确认最新协议",
          legalConfirmationRequired: true,
          legalDocuments: legalPayload.documents,
        };
      }
      return { success: false, message: error.message || "注册失败" };
    }
  };

  // 登出
  const logout = async () => {
    try {
      await postLogout({});

      // 通过全局通知抛出登出成功事件
      notification?.success({ message: "已成功登出" });

      return { success: true, message: "登出成功" };
    } catch (error: any) {
      // 即使服务端会话已过期或网络异常，也允许用户退出本地账号。
      notification?.warning({
        message: "本地账号已退出",
        description: error?.message || "服务端退出请求失败",
      });
      return { success: true, message: "本地账号已退出" };
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      removeToken();
      removeRefreshToken();
      localStorage.removeItem("user_info");
      sessionStorage.removeItem("user_info");
    }
  };

  // 更新用户信息
  const updateUser = (userData: Partial<UserInfo>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // 更新本地存储
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (token) {
        if (localStorage.getItem("auth_token")) {
          localStorage.setItem("user_info", JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem("user_info", JSON.stringify(updatedUser));
        }
      }
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    loginLoading,
    registerLoading: registerRequestLoading || loginLoading,
    coverGradientCss,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
