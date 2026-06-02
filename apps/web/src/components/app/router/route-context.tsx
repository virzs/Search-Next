import { createContext, useContext } from "react";

const AppRouteContext = createContext<unknown>(null);

export const AppRouteContextProvider = AppRouteContext.Provider;

export const useAppRouteContext = <T,>() => {
  const value = useContext(AppRouteContext);
  if (!value) {
    throw new Error("useAppRouteContext must be used within AppRouteContextProvider");
  }
  return value as T;
};

