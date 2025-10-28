import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRequest } from "ahooks";
import { UserInfo, AuthContextValue, LoginResponse, LoginFormData, RegisterFormData } from "../types/auth";
import { postLogin, postRegister, postLogout } from "../services/auth";
import { getToken, setToken, setRefreshToken } from "../utils/token";
import { notification } from "../utils/globalNotification";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初始化时检查本地存储的用户信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        const userStr = localStorage.getItem("user_info") || sessionStorage.getItem("user_info");

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

  // 使用 useRequest 封装登录
  const { loading: loginLoading, runAsync: runLogin } = useRequest(
    async (data: LoginFormData) => {
      return await postLogin({ email: data.email, password: data.password });
    },
    { manual: true }
  );

  const login = async (data: LoginFormData): Promise<LoginResponse> => {
    try {
      const res = await runLogin(data);

      const userPayload: UserInfo = {
        _id: res._id,
        username: res.username,
        email: data.email,
        createdAt: res.createdAt,
      };

      const response: LoginResponse = {
        success: true,
        message: "登录成功",
        user: userPayload,
        token: res.access_token,
        refreshToken: res.refresh_token,
      };

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        setToken(response.token);
        if (response.refreshToken) setRefreshToken(response.refreshToken);
        localStorage.setItem("user_info", JSON.stringify(response.user));
      }

      return response;
    } catch (error: any) {
      return { success: false, message: error.message || "登录失败" };
    }
  };

  // 使用 useRequest 封装注册
  const { loading: registerLoading, runAsync: runRegister } = useRequest(
    async (data: RegisterFormData) => {
      return await postRegister({
        email: data.email,
        password: data.password,
        captcha: Number(data.captcha) || undefined,
        invitationCode: "",
      });
    },
    { manual: true }
  );

  const register = async (data: RegisterFormData): Promise<LoginResponse> => {
    try {
      const res = await runRegister(data);

      const userPayload: UserInfo = {
        _id: String(res._id ?? Date.now()),
        username: data.username,
        email: data.email,
        createdAt: new Date(),
      };

      const response: LoginResponse = {
        success: true,
        message: "注册成功",
        user: userPayload,
        token: res.access_token,
        refreshToken: res.refresh_token,
      };

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        setToken(response.token);
        if (response.refreshToken) setRefreshToken(response.refreshToken);
        localStorage.setItem("user_info", JSON.stringify(response.user));
      }

      return response;
    } catch (error: any) {
      return { success: false, message: error.message || "注册失败" };
    }
  };

  // 登出
  const logout = async () => {
    try {
      await postLogout({});

      // 清除状态
      setUser(null);
      setIsAuthenticated(false);

      // 清除本地存储
      localStorage.removeItem("user_info");
      sessionStorage.removeItem("user_info");

      // 通过全局通知抛出登出成功事件
      notification?.success({ message: "已成功登出" });

      return { success: true, message: "登出成功" };
    } catch (error: any) {
      // 通过全局通知抛出登出失败事件
      notification?.error({ message: error?.message || "登出失败" });
      return { success: false, message: error.message || "登出失败" };
    }
  };

  // 更新用户信息
  const updateUser = (userData: Partial<UserInfo>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // 更新本地存储
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
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
    registerLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
