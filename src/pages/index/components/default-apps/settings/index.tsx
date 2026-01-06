import { createContext, FC, ReactNode, useContext, useMemo, useState } from "react";
import AccountView from "./views/account";
import BackupView from "./views/backup";
import { RiInbox2Fill, RiUserFill } from "@remixicon/react";
import { RiGlobalLine, RiInformationFill, RiKeyFill } from "@remixicon/react";
import { AppResponsiveOverlay, AppSidebar } from "@/components";
import AboutView from "./views/about";
import LanguageView from "./views/language";
import ThirdPartyView from "./views/third-party";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

interface Location {
  pathname: string;
}

interface RouterContextType {
  location: Location;
  navigate: (path: string) => void;
}

const SettingsRouterContext = createContext<RouterContextType | null>(null);

const useSettingsLocation = () => {
  const context = useContext(SettingsRouterContext);
  if (!context) {
    throw new Error("useSettingsLocation must be used within a SettingsMemoryRouter");
  }
  return context.location;
};

const useSettingsNavigate = () => {
  const context = useContext(SettingsRouterContext);
  if (!context) {
    throw new Error("useSettingsNavigate must be used within a SettingsMemoryRouter");
  }
  return context.navigate;
};

const SettingsMemoryRouter: FC<{ initialEntries?: string[]; children: ReactNode }> = ({
  initialEntries = ["/account"],
  children,
}) => {
  const [pathname, setPathname] = useState(initialEntries[0]);

  const value = useMemo(
    () => ({
      location: { pathname },
      navigate: (path: string) => setPathname(path),
    }),
    [pathname]
  );

  return <SettingsRouterContext.Provider value={value}>{children}</SettingsRouterContext.Provider>;
};

const CachedRoutes: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const CachedRoute: FC<{ path: string; children: ReactNode }> = ({ path, children }) => {
  const location = useSettingsLocation();
  const isActive = location.pathname.startsWith(path);

  return (
    <div
      style={{
        display: isActive ? "block" : "none",
        height: "100%",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

const UnderConstructionOverlay = () => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="w-[420px] max-w-[calc(100%-48px)] rounded-2xl border bg-white/70 p-6 shadow-xl">
        <div className="text-xs font-medium tracking-wide text-gray-600">示例</div>
        <div className="mt-2 text-2xl font-bold tracking-tight">开发中</div>
        <div className="mt-1 text-sm text-gray-600">该功能正在开发，敬请期待。</div>
        <div className="mt-5 grid gap-3">
          <div className="h-10 rounded-xl bg-gray-100" />
          <div className="h-24 rounded-xl bg-gray-100" />
          <div className="h-10 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
};

const SettingsView = () => {
  const location = useSettingsLocation();
  const navigate = useSettingsNavigate();
  const pathname = location.pathname;
  const activeMenuKey = pathname.startsWith("/third-party")
    ? "third-party"
    : pathname.startsWith("/language")
      ? "language"
      : pathname.startsWith("/backup")
        ? "backup"
        : pathname.startsWith("/about")
          ? "about"
          : "account";
  const showUnderConstruction =
    pathname.startsWith("/third-party") ||
    pathname.startsWith("/language") ||
    pathname.startsWith("/backup") ||
    pathname.startsWith("/about");

  return (
    <div className="h-full overflow-hidden flex">
      <AppSidebar
        header={
          <>
            <div className="text-xs font-medium tracking-wide mb-2">设置</div>
            <div className="text-2xl font-bold tracking-tight">偏好</div>
          </>
        }
        menuItems={[
          {
            key: "account",
            label: "账号",
            icon: <RiUserFill size={16} />,
          },
          {
            key: "third-party",
            label: "第三方服务",
            icon: <RiKeyFill size={16} />,
          },
          {
            key: "language",
            label: "语言",
            icon: <RiGlobalLine size={16} />,
          },
          {
            key: "backup",
            label: "备份与恢复",
            icon: <RiInbox2Fill size={16} />,
          },
          {
            key: "about",
            label: "关于",
            icon: <RiInformationFill size={16} />,
          },
        ]}
        activeMenuKey={activeMenuKey}
        onMenuSelect={(key) => navigate(`/${key}`)}
      />

      <div className="h-full w-0 grow overflow-hidden">
        <div className="relative h-full w-full overflow-hidden">
          <div className="h-full w-full overflow-y-auto">
            <CachedRoutes>
              <CachedRoute path="/account">
                <AccountView />
              </CachedRoute>
              <CachedRoute path="/third-party">
                <ThirdPartyView />
              </CachedRoute>
              <CachedRoute path="/language">
                <LanguageView />
              </CachedRoute>
              <CachedRoute path="/backup">
                <BackupView />
              </CachedRoute>
              <CachedRoute path="/about">
                <AboutView />
              </CachedRoute>
            </CachedRoutes>
          </div>
          {showUnderConstruction ? <UnderConstructionOverlay /> : null}
        </div>
      </div>
    </div>
  );
};

const Settings: FC<SettingsProps> = (props) => {
  return (
    <AppResponsiveOverlay wrapContent {...props}>
      <SettingsMemoryRouter initialEntries={["/account"]}>
        <SettingsView />
      </SettingsMemoryRouter>
    </AppResponsiveOverlay>
  );
};

export default Settings;
