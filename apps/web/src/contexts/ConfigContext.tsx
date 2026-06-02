import React, { createContext, ReactNode, useEffect } from "react";
import { useRequest } from "ahooks";
import { getUserLimit, UserLimit } from "@/services/desktop";
import { getProjectPublicInfo, ProjectPublicInfo } from "@/services/system";
import useAuth from "@/hooks/useAuth";

interface ConfigContextValue {
  userLimit: UserLimit | null;
  loadingUserLimit: boolean;
  refreshUserLimit: () => Promise<void>;
  projectInfo: ProjectPublicInfo | null;
  loadingProjectInfo: boolean;
  refreshProjectInfo: () => Promise<void>;
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

  const {
    data: projectInfo,
    loading: loadingProjectInfo,
    runAsync: runProjectPublicInfo,
  } = useRequest(getProjectPublicInfo, { manual: true });

  useEffect(() => {
    // 每次认证状态变化时刷新用户限制（接口为公共端点）
    runUserLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    // 初始化获取项目公共信息（公共端点）
    runProjectPublicInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUserLimit = async () => {
    await runUserLimit();
  };

  const refreshProjectInfo = async () => {
    await runProjectPublicInfo();
  };

  const value: ConfigContextValue = {
    userLimit: userLimit ?? null,
    loadingUserLimit,
    refreshUserLimit,
    projectInfo: projectInfo ?? null,
    loadingProjectInfo,
    refreshProjectInfo,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export default ConfigContext;
