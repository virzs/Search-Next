import { ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useOutlet, useOutletContext } from "react-router";
import AppRoutedContainer from "../routed-container";
import type { AppSidebarMenuItem, AppSidebarProps, AppSidebarSearchProps } from "../sidebar";
import { AppRouteContextProvider } from "../router/route-context";

type KeepAlivePage = {
  key: string;
  element: ReactNode;
};

const KeepAliveOutlet = ({
  activeKey,
  maxSize,
}: {
  activeKey: string;
  maxSize?: number;
}) => {
  const outlet = useOutlet();
  const [pages, setPages] = useState<KeepAlivePage[]>([]);

  useEffect(() => {
    if (!outlet) return;
    setPages((prev) => {
      const existingIndex = prev.findIndex((p) => p.key === activeKey);
      if (existingIndex >= 0) {
        const current = prev[existingIndex];
        if (current?.element === outlet) return prev;
        const next = prev.slice();
        next[existingIndex] = { key: activeKey, element: outlet };
        return next;
      }
      const next = [...prev, { key: activeKey, element: outlet }];
      if (maxSize && next.length > maxSize) return next.slice(next.length - maxSize);
      return next;
    });
  }, [activeKey, maxSize, outlet]);

  const activePage = pages.find((p) => p.key === activeKey);
  const activeElement = outlet ?? activePage?.element;
  if (!activeElement) return null;

  const ordered = pages.some((p) => p.key === activeKey)
    ? pages
    : [...pages, { key: activeKey, element: activeElement }];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {ordered.map((p) => {
        const isActive = p.key === activeKey;
        return (
          <div
            key={p.key}
            className="absolute inset-0"
            style={{
              display: isActive ? "block" : "none",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            {isActive ? activeElement : p.element}
          </div>
        );
      })}
    </div>
  );
};

export interface AppRoutedOverlayMenuItem extends AppSidebarMenuItem {
  path: string;
  match?: (pathname: string) => boolean;
}

export interface AppRoutedOverlaySidebarProps
  extends Omit<AppSidebarProps, "menuItems" | "activeMenuKey" | "onMenuSelect" | "search"> {
  menuItems?: AppRoutedOverlayMenuItem[];
  search?: Omit<AppSidebarSearchProps, "value" | "onChange"> & { initialValue?: string };
}

export interface AppRoutedOverlayProps<ParentContext = unknown, RouteContext = unknown> {
  title?: ReactNode;
  closeTo?: string;
  wrapContent?: boolean;
  sidebarProps?: AppRoutedOverlaySidebarProps;
  outletWrapperClassName?: string;
  suspenseFallback?: ReactNode;
  children?: ReactNode;
  keepAlive?: {
    enabled?: boolean;
    maxSize?: number;
    getKey?: (args: {
      pathname: string;
      activeMenuItem: AppRoutedOverlayMenuItem | null;
    }) => string;
  };
  getRouteContext?: (args: {
    parentContext: ParentContext;
    location: ReturnType<typeof useLocation>;
    search: { value: string; setValue: (value: string) => void };
    activeMenuItem: AppRoutedOverlayMenuItem | null;
  }) => RouteContext;
}

const resolveActiveMenuItem = (
  pathname: string,
  menuItems: AppRoutedOverlayMenuItem[] | undefined,
) => {
  const items = menuItems ?? [];
  if (!items.length) return null;
  const scored = items
    .map((item) => {
      const match = item.match ? item.match(pathname) : pathname.startsWith(item.path);
      if (!match) return null;
      const score = (item.match ? 10_000 : 0) + item.path.length;
      return { item, score };
    })
    .filter(Boolean) as { item: AppRoutedOverlayMenuItem; score: number }[];

  if (!scored.length) return items[0] ?? null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item ?? items[0] ?? null;
};

const AppRoutedOverlay = <ParentContext, RouteContext>({
  title,
  closeTo = "/",
  wrapContent,
  sidebarProps,
  outletWrapperClassName,
  suspenseFallback = <div className="p-6 text-sm text-gray-500">Loading...</div>,
  children,
  keepAlive,
  getRouteContext,
}: AppRoutedOverlayProps<ParentContext, RouteContext>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();
  const parentContext = useOutletContext<ParentContext>();
  const [searchValue, setSearchValue] = useState(sidebarProps?.search?.initialValue ?? "");

  const activeMenuItem = useMemo(
    () => resolveActiveMenuItem(location.pathname, sidebarProps?.menuItems),
    [location.pathname, sidebarProps?.menuItems],
  );

  const activeMenuKey = activeMenuItem?.key;

  const resolvedSidebarProps = useMemo<AppSidebarProps | undefined>(() => {
    if (!sidebarProps) return undefined;
    const menuItems = (sidebarProps.menuItems ?? []).map((item) => {
      const { path, match, ...rest } = item;
      void path;
      void match;
      return rest;
    });
    return {
      ...sidebarProps,
      menuItems,
      activeMenuKey,
      onMenuSelect: (key) => {
        const item = (sidebarProps.menuItems ?? []).find((i) => i.key === key);
        if (item) navigate(item.path);
      },
      search: sidebarProps.search
        ? {
            ...sidebarProps.search,
            value: searchValue,
            onChange: setSearchValue,
          }
        : undefined,
    };
  }, [activeMenuKey, navigate, searchValue, sidebarProps]);

  const keepAliveKey = useMemo(() => {
    if (!keepAlive?.enabled) return null;
    if (keepAlive.getKey) {
      return keepAlive.getKey({ pathname: location.pathname, activeMenuItem });
    }
    return location.pathname;
  }, [activeMenuItem, keepAlive, location.pathname]);

  const routeContextValue = useMemo(() => {
    if (!getRouteContext) return null;
    return getRouteContext({
      parentContext,
      location,
      search: { value: searchValue, setValue: setSearchValue },
      activeMenuItem,
    });
  }, [activeMenuItem, getRouteContext, location, parentContext, searchValue]);

  const content = children ? (
    children
  ) : keepAliveKey ? (
    <KeepAliveOutlet activeKey={keepAliveKey} maxSize={keepAlive?.maxSize} />
  ) : (
    <div className={outletWrapperClassName}>{outlet}</div>
  );

  return (
    <AppRoutedContainer
      open
      onClose={() => navigate(closeTo)}
      title={title}
      wrapContent={wrapContent}
      sidebarProps={resolvedSidebarProps}
    >
      <Suspense fallback={suspenseFallback}>
        {getRouteContext ? (
          <AppRouteContextProvider value={routeContextValue}>{content}</AppRouteContextProvider>
        ) : (
          content
        )}
      </Suspense>
    </AppRoutedContainer>
  );
};

export default AppRoutedOverlay;
