import {
  ReactNode,
  Suspense,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useOutlet,
  useOutletContext,
} from "react-router";
import AppRoutedContainer, {
  type AppRoutedContainerProps,
} from "../routed-container";
import { AppRoutedPageActiveContext } from "../routed-container/header-context";
import type {
  AppSidebarMenuItem,
  AppSidebarProps,
  AppSidebarSearchProps,
} from "../sidebar";
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
      if (maxSize && next.length > maxSize)
        return next.slice(next.length - maxSize);
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
            <AppRoutedPageActiveContext.Provider value={isActive}>
              {isActive ? activeElement : p.element}
            </AppRoutedPageActiveContext.Provider>
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

export interface AppRoutedOverlaySidebarProps extends Omit<
  AppSidebarProps,
  "menuItems" | "activeMenuKey" | "onMenuSelect" | "search"
> {
  menuItems?: AppRoutedOverlayMenuItem[];
  search?: Omit<AppSidebarSearchProps, "value" | "onChange"> & {
    initialValue?: string;
    redirectPath?: string;
    throttleWait?: number;
    emptyText?: ReactNode;
  };
}

export interface AppRoutedOverlayProps<
  ParentContext = unknown,
  RouteContext = unknown,
> {
  title?: ReactNode;
  closeTo?: string;
  wrapContent?: boolean;
  componentSize?: AppRoutedContainerProps["componentSize"];
  overlayProps?: AppRoutedContainerProps["overlayProps"];
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
      const match = item.match
        ? item.match(pathname)
        : pathname.startsWith(item.path);
      if (!match) return null;
      const score = (item.match ? 10_000 : 0) + item.path.length;
      return { item, score };
    })
    .filter(Boolean) as { item: AppRoutedOverlayMenuItem; score: number }[];

  if (!scored.length) return items[0] ?? null;
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item ?? items[0] ?? null;
};

const getSearchableText = (node: ReactNode): string => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getSearchableText).join(" ");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode; title?: ReactNode };
    return [props.title, props.children].map(getSearchableText).join(" ");
  }
  return "";
};

const useThrottledValue = <T,>(value: T, wait: number) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const latestValueRef = useRef(value);
  const lastRunAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latestValueRef.current = value;

    if (wait <= 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      lastRunAtRef.current = Date.now();
      setThrottledValue(value);
      return;
    }

    const now = Date.now();
    const elapsed = now - lastRunAtRef.current;

    const run = () => {
      timerRef.current = null;
      lastRunAtRef.current = Date.now();
      setThrottledValue(latestValueRef.current);
    };

    if (elapsed >= wait) {
      if (timerRef.current) clearTimeout(timerRef.current);
      run();
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(run, wait - elapsed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, wait]);

  return throttledValue;
};

const AppRoutedOverlay = <ParentContext, RouteContext>({
  title,
  closeTo = "/",
  wrapContent,
  componentSize,
  overlayProps,
  sidebarProps,
  outletWrapperClassName = "h-full w-full overflow-auto",
  suspenseFallback = (
    <div className="p-6 text-sm text-gray-500">Loading...</div>
  ),
  children,
  keepAlive,
  getRouteContext,
}: AppRoutedOverlayProps<ParentContext, RouteContext>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();
  const parentContext = useOutletContext<ParentContext>();
  const [searchValue, setSearchValue] = useState(
    sidebarProps?.search?.initialValue ?? "",
  );
  const searchRedirectPath = sidebarProps?.search?.redirectPath;
  const isSearchRoute = Boolean(
    searchRedirectPath &&
      (location.pathname === searchRedirectPath ||
        location.pathname.startsWith(`${searchRedirectPath}/`)),
  );
  const searchQueryValue = useMemo(() => {
    if (!isSearchRoute) return "";
    return new URLSearchParams(location.search).get("q") ?? "";
  }, [isSearchRoute, location.search]);
  const throttledSearchValue = useThrottledValue(
    searchValue,
    sidebarProps?.search?.throttleWait ?? 360,
  );
  const effectiveSearchValue = searchValue.trim() ? throttledSearchValue : "";
  const routeSearchValue = isSearchRoute
    ? searchQueryValue
    : effectiveSearchValue;
  const latestLocationRef = useRef(location);
  const latestNavigateRef = useRef(navigate);

  useEffect(() => {
    latestLocationRef.current = location;
  }, [location]);

  useEffect(() => {
    latestNavigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    if (!searchRedirectPath) return;

    if (isSearchRoute) {
      setSearchValue((current) =>
        current === searchQueryValue ? current : searchQueryValue,
      );
      return;
    }

    setSearchValue("");
  }, [isSearchRoute, searchQueryValue, searchRedirectPath]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (!value.trim() && searchRedirectPath && isSearchRoute) {
        navigate(searchRedirectPath, { replace: true });
      }
    },
    [isSearchRoute, navigate, searchRedirectPath],
  );

  const activeMenuItem = useMemo(() => {
    if (
      searchRedirectPath &&
      (location.pathname === searchRedirectPath ||
        location.pathname.startsWith(`${searchRedirectPath}/`))
    ) {
      return null;
    }

    return resolveActiveMenuItem(location.pathname, sidebarProps?.menuItems);
  }, [
    location.pathname,
    sidebarProps?.menuItems,
    searchRedirectPath,
  ]);

  const activeMenuKey = activeMenuItem?.key;

  const resolvedSidebarProps = useMemo<AppSidebarProps | undefined>(() => {
    if (!sidebarProps) return undefined;
    const filterQuery =
      sidebarProps.search && !sidebarProps.search.redirectPath
        ? searchValue.trim().toLowerCase()
        : "";
    const filteredMenuItems = filterQuery
      ? (sidebarProps.menuItems ?? []).filter((item) =>
          [item.key, getSearchableText(item.label)]
            .join(" ")
            .toLowerCase()
            .includes(filterQuery),
        )
      : (sidebarProps.menuItems ?? []);
    const menuItems = filteredMenuItems.map((item) => {
      const { path, match, ...rest } = item;
      void path;
      void match;
      return rest;
    });
    return {
      ...sidebarProps,
      menuItems,
      emptyText:
        filterQuery && sidebarProps.search?.emptyText
          ? sidebarProps.search.emptyText
          : sidebarProps.emptyText,
      activeMenuKey,
      onMenuSelect: (key) => {
        const item = (sidebarProps.menuItems ?? []).find((i) => i.key === key);
        if (item) {
          setSearchValue("");
          navigate(item.path);
        }
      },
      search: sidebarProps.search
        ? {
            ...sidebarProps.search,
            value: searchValue,
            onChange: handleSearchChange,
          }
        : undefined,
    };
  }, [activeMenuKey, handleSearchChange, navigate, searchValue, sidebarProps]);

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
      search: { value: routeSearchValue, setValue: handleSearchChange },
      activeMenuItem,
    });
  }, [
    activeMenuItem,
    handleSearchChange,
    getRouteContext,
    location,
    parentContext,
    routeSearchValue,
  ]);

  useEffect(() => {
    const query = effectiveSearchValue.trim();
    if (!searchRedirectPath || !query) return;

    const currentLocation = latestLocationRef.current;
    const currentIsSearchRoute =
      currentLocation.pathname === searchRedirectPath ||
      currentLocation.pathname.startsWith(`${searchRedirectPath}/`);
    const nextSearchParams = new URLSearchParams(
      currentIsSearchRoute ? currentLocation.search : "",
    );
    nextSearchParams.set("q", query);

    const nextUrl = `${searchRedirectPath}?${nextSearchParams.toString()}`;
    const currentUrl = `${currentLocation.pathname}${currentLocation.search}`;
    if (currentUrl === nextUrl) return;

    latestNavigateRef.current(nextUrl, { replace: currentIsSearchRoute });
  }, [effectiveSearchValue, searchRedirectPath]);

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
      navigationTitle={activeMenuItem?.label}
      wrapContent={wrapContent}
      componentSize={componentSize}
      overlayProps={overlayProps}
      sidebarProps={resolvedSidebarProps}
    >
      <Suspense fallback={suspenseFallback}>
        {getRouteContext ? (
          <AppRouteContextProvider value={routeContextValue}>
            {content}
          </AppRouteContextProvider>
        ) : (
          content
        )}
      </Suspense>
    </AppRoutedContainer>
  );
};

export default AppRoutedOverlay;
