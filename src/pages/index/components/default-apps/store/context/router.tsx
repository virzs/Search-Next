import React, { createContext, useContext, useState, FC, ReactNode, useMemo } from "react";

interface Location {
  pathname: string;
}

interface RouterContextType {
  location: Location;
  navigate: (path: string) => void;
}

const StoreRouterContext = createContext<RouterContextType | null>(null);

export const useStoreLocation = () => {
  const context = useContext(StoreRouterContext);
  if (!context) {
    throw new Error("useStoreLocation must be used within a StoreMemoryRouter");
  }
  return context.location;
};

export const useStoreNavigate = () => {
  const context = useContext(StoreRouterContext);
  if (!context) {
    throw new Error("useStoreNavigate must be used within a StoreMemoryRouter");
  }
  return context.navigate;
};

export const StoreMemoryRouter: FC<{ initialEntries?: string[]; children: ReactNode }> = ({
  initialEntries = ["/"],
  children,
}) => {
  const [pathname, setPathname] = useState(initialEntries[0]);

  const value = useMemo(() => ({
    location: { pathname },
    navigate: (path: string) => setPathname(path),
  }), [pathname]);

  return (
    <StoreRouterContext.Provider value={value}>
      {children}
    </StoreRouterContext.Provider>
  );
};
