import { AppResponsiveOverlay, AppSidebar, AppSegmented } from "@/components";
import { cx } from "@emotion/css";
import { FC, ReactNode, createContext, useContext, useMemo, useState } from "react";
import useDesktopTheme from "@/hooks/useDesktopTheme";

export interface ThemeModalProps {
  open: boolean;
  onClose: () => void;
}

const getThemePreview = (theme: any) => {
  const base = theme?.token?.base ?? {};
  const dock = theme?.token?.dock ?? {};
  const items = theme?.token?.items ?? {};

  return {
    background: base.backgroundColor ?? "rgba(255,255,255,0.18)",
    border: base.borderColor ?? "rgba(255,255,255,0.20)",
    text: base.textColor ?? "rgba(0,0,0,0.88)",
    hover: base.hoverColor ?? "rgba(0,0,0,0.06)",
    dock: dock.backgroundColor ?? "rgba(255,255,255,0.16)",
    iconBg: items.iconBackgroundColor ?? "rgba(0,0,0,0.08)",
  };
};

const ThemeCard = ({
  name,
  theme,
  active,
  onClick,
}: {
  name: string;
  theme: any;
  active: boolean;
  onClick: () => void;
}) => {
  const preview = getThemePreview(theme);
  const ringColor = active ? "rgba(22, 119, 255, 0.45)" : "transparent";

  return (
    <div
      role="button"
      tabIndex={0}
      className={cx(
        "rounded-2xl border p-4 transition select-none",
        "hover:opacity-95 active:opacity-90",
        "cursor-pointer"
      )}
      style={{
        background: preview.background,
        borderColor: preview.border,
        color: preview.text,
        boxShadow: `0 0 0 2px ${ringColor}`,
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{name}</div>
          <div className="text-xs opacity-70 mt-1">点击应用到桌面</div>
        </div>
        <div
          className="h-8 w-8 rounded-xl border flex items-center justify-center"
          style={{
            background: preview.dock,
            borderColor: preview.border,
          }}
        >
          <div className="h-3 w-3 rounded-full" style={{ background: preview.iconBg }} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="h-2 w-10 rounded-full" style={{ background: preview.hover }} />
        <div className="h-2 w-10 rounded-full" style={{ background: preview.dock }} />
        <div className="h-2 w-10 rounded-full" style={{ background: preview.iconBg }} />
      </div>
    </div>
  );
};

interface Location {
  pathname: string;
}

interface RouterContextType {
  location: Location;
  navigate: (path: string) => void;
}

const PersonalizationRouterContext = createContext<RouterContextType | null>(null);

const usePersonalizationLocation = () => {
  const context = useContext(PersonalizationRouterContext);
  if (!context) {
    throw new Error("usePersonalizationLocation must be used within a PersonalizationMemoryRouter");
  }
  return context.location;
};

const usePersonalizationNavigate = () => {
  const context = useContext(PersonalizationRouterContext);
  if (!context) {
    throw new Error("usePersonalizationNavigate must be used within a PersonalizationMemoryRouter");
  }
  return context.navigate;
};

const PersonalizationMemoryRouter: FC<{ initialEntries?: string[]; children: ReactNode }> = ({
  initialEntries = ["/"],
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

  return <PersonalizationRouterContext.Provider value={value}>{children}</PersonalizationRouterContext.Provider>;
};

const CachedRoutes: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const CachedRoute: FC<{ path: string; children: ReactNode }> = ({ path, children }) => {
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

const ThemeView: FC = () => {
  const { themes, activeThemeId, setActiveThemeId } = useDesktopTheme();
  const [activeKind, setActiveKind] = useState<"all" | "light" | "dark">("all");

  const filteredThemes = useMemo(() => {
    return activeKind === "all" ? themes : themes.filter((t) => (activeKind === "light" ? t.kind === "light" : t.kind === "dark"));
  }, [themes, activeKind]);

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">主题</div>
          <div className="text-xs text-gray-500 mt-1">选择一套主题应用到桌面</div>
        </div>
        <div className="flex items-center gap-3">
          <AppSegmented
            options={[
              { label: "全部", value: "all" },
              { label: "浅色", value: "light" },
              { label: "深色", value: "dark" },
            ]}
            value={activeKind}
            onChange={(v) => setActiveKind(v as any)}
            className="max-w-full overflow-auto"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThemes.map((t) => (
          <ThemeCard key={t.id} name={t.name} theme={t.theme} active={t.id === activeThemeId} onClick={() => setActiveThemeId(t.id)} />
        ))}
      </div>
    </>
  );
};

const WallpaperView: FC = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-sm text-gray-500">壁纸功能开发中</div>
    </div>
  );
};

const PersonalizationModalContent: FC = () => {
  const navigate = usePersonalizationNavigate();
  const location = usePersonalizationLocation();
  const activeMenuKey = location.pathname.startsWith("/wallpaper") ? "wallpaper" : "theme";

  return (
    <div className="flex h-full w-full overflow-hidden backdrop-blur-3xl">
      <AppSidebar
        header={
          <>
            <div className="text-xs font-medium tracking-wide mb-2">个性化</div>
            <div className="text-2xl font-bold tracking-tight">外观</div>
          </>
        }
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
    <AppResponsiveOverlay open={open} onClose={onClose} title="个性化" wrapContent>
      <PersonalizationMemoryRouter initialEntries={["/theme"]}>
        <PersonalizationModalContent />
      </PersonalizationMemoryRouter>
    </AppResponsiveOverlay>
  );
};

export default ThemeModal;
