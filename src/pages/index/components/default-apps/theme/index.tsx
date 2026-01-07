import { AppResponsiveOverlay, AppSidebar } from "@/components";
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import ThemeView from "./views/theme";
import WallpaperView from "./views/wallpaper";

export interface ThemeModalProps {
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

const PersonalizationRouterContext = createContext<RouterContextType | null>(
  null,
);

const usePersonalizationLocation = () => {
  const context = useContext(PersonalizationRouterContext);
  if (!context) {
    throw new Error(
      "usePersonalizationLocation must be used within a PersonalizationMemoryRouter",
    );
  }
  return context.location;
};

const usePersonalizationNavigate = () => {
  const context = useContext(PersonalizationRouterContext);
  if (!context) {
    throw new Error(
      "usePersonalizationNavigate must be used within a PersonalizationMemoryRouter",
    );
  }
  return context.navigate;
};

const PersonalizationMemoryRouter: FC<{
  initialEntries?: string[];
  children: ReactNode;
}> = ({ initialEntries = ["/"], children }) => {
  const [pathname, setPathname] = useState(initialEntries[0]);

  const value = useMemo(
    () => ({
      location: { pathname },
      navigate: (path: string) => setPathname(path),
    }),
    [pathname],
  );

  return (
    <PersonalizationRouterContext.Provider value={value}>
      {children}
    </PersonalizationRouterContext.Provider>
  );
};

const CachedRoutes: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const CachedRoute: FC<{ path: string; children: ReactNode }> = ({
  path,
  children,
}) => {
  const location = usePersonalizationLocation();
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

const PersonalizationModalContent: FC = () => {
  const navigate = usePersonalizationNavigate();
  const location = usePersonalizationLocation();
  const activeMenuKey = location.pathname.startsWith("/wallpaper")
    ? "wallpaper"
    : "theme";

  return (
    <div className="flex h-full w-full overflow-hidden backdrop-blur-3xl">
      <AppSidebar
        header={<div className="text-2xl font-bold tracking-tight">个性化</div>}
        menuItems={[
          {
            key: "theme",
            label: "主题",
          },
          {
            key: "wallpaper",
            label: "壁纸",
          },
        ]}
        activeMenuKey={activeMenuKey}
        onMenuSelect={(key) => navigate(`/${key}`)}
      />

      <div className="flex-1 overflow-auto p-6">
        <CachedRoutes>
          <CachedRoute path="/theme">
            <ThemeView />
          </CachedRoute>
          <CachedRoute path="/wallpaper">
            <WallpaperView />
          </CachedRoute>
        </CachedRoutes>
      </div>
    </div>
  );
};

const ThemeModal = ({ open, onClose }: ThemeModalProps) => {
  return (
    <AppResponsiveOverlay
      open={open}
      onClose={onClose}
      title="个性化"
      wrapContent
    >
      <PersonalizationMemoryRouter initialEntries={["/theme"]}>
        <PersonalizationModalContent />
      </PersonalizationMemoryRouter>
    </AppResponsiveOverlay>
  );
};

export default ThemeModal;
