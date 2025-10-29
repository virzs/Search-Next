import React, { createContext, ReactNode, useEffect } from "react";
import { useRequest } from "ahooks";
import { getUserLimit, UserLimit } from "@/services/desktop";
import useAuth from "@/hooks/useAuth";

interface ConfigContextValue {
  userLimit: UserLimit | null;
  loadingUserLimit: boolean;
  refreshUserLimit: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

interface AppConfigProviderProps {
  children: ReactNode;
}

export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const {
    data: userLimit,
    loading: loadingUserLimit,
    runAsync: runUserLimit,
  } = useRequest(getUserLimit, { manual: true });

  useEffect(() => {
    // 每次认证状态变化时刷新用户限制（接口为公共端点）
    runUserLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const refreshUserLimit = async () => {
    await runUserLimit();
  };

  const value: ConfigContextValue = {
    userLimit: userLimit ?? null,
    loadingUserLimit,
    refreshUserLimit,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export default ConfigContext;
