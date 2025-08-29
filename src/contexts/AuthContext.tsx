import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserInfo, AuthContextValue, LoginResponse } from "../types/auth";

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
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user_info");

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

  // 登录
  const login = async (email: string, password: string, remember?: boolean): Promise<LoginResponse> => {
    try {
      // 这里应该调用实际的登录API
      // 模拟API调用
      const response = await new Promise<LoginResponse>((resolve) => {
        setTimeout(() => {
          // 模拟登录成功
          const mockUser: UserInfo = {
            _id: Date.now().toString(),
            username: email.split("@")[0],
            email: email,
            createdAt: new Date(),
          };

          resolve({
            success: true,
            message: "登录成功",
            user: mockUser,
            token: `mock-token-${Date.now()}`,
          });
        }, 1000);
      });

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);

        // 保存到本地存储
        if (remember) {
          localStorage.setItem("auth_token", response.token);
          localStorage.setItem("user_info", JSON.stringify(response.user));
        } else {
          sessionStorage.setItem("auth_token", response.token);
          sessionStorage.setItem("user_info", JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "登录失败",
      };
    }
  };

  // 注册
  const register = async (
    username: string,
    email: string,
    password: string,
    captcha?: string
  ): Promise<LoginResponse> => {
    try {
      // 这里应该调用实际的注册API
      // 模拟API调用
      const response = await new Promise<LoginResponse>((resolve) => {
        setTimeout(() => {
          // 模拟注册成功
          const mockUser: UserInfo = {
            _id: Date.now().toString(),
            username: username,
            email: email,
            createdAt: new Date(),
          };

          resolve({
            success: true,
            message: "注册成功",
            user: mockUser,
            token: `mock-token-${Date.now()}`,
          });
        }, 1000);
      });

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);

        // 注册成功后自动保存到本地存储
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user_info", JSON.stringify(response.user));
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "注册失败",
      };
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 这里可以调用登出API

      // 清除状态
      setUser(null);
      setIsAuthenticated(false);

      // 清除本地存储
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("user_info");

      return { success: true, message: "登出成功" };
    } catch (error: any) {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
