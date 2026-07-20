import {
  DEFAULT_PROJECT_THEME_COLOR,
  getPublicProject,
  type ProjectPublicData,
} from "@/services/system/project";
import { applyAdminSiteMetadata, DEFAULT_SITE_NAME } from "@/utils/siteMetadata";
import { useRequest } from "ahooks";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

interface SiteConfigContextValue {
  projectInfo: ProjectPublicData;
  loading: boolean;
  refreshSiteConfig: () => Promise<ProjectPublicData>;
}

const fallbackProject: ProjectPublicData = {
  name: DEFAULT_SITE_NAME,
  site: { themeColor: DEFAULT_PROJECT_THEME_COLOR },
};

const SiteConfigContext = createContext<SiteConfigContextValue | undefined>(
  undefined,
);

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const { data, loading, runAsync } = useRequest(getPublicProject);
  const projectInfo = data ?? fallbackProject;

  useEffect(() => {
    applyAdminSiteMetadata(projectInfo);
  }, [projectInfo]);

  const value = useMemo<SiteConfigContextValue>(
    () => ({
      projectInfo,
      loading,
      refreshSiteConfig: () => runAsync({}),
    }),
    [loading, projectInfo, runAsync],
  );

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return context;
};
