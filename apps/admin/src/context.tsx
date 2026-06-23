import { createContext, useContext, useId } from "react";
import useTheme, { Theme } from "./hooks/useTheme";

export interface LayoutProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  realTheme: Theme;
  appId: string;
}

const defaultLayoutProps: LayoutProps = {
  theme: Theme.Light,
  setTheme: () => {},
  realTheme: Theme.Light,
  appId: "",
};

const RootLayoutContext = createContext<LayoutProps>(defaultLayoutProps);

export const RootLayoutProvider = ({ children }: any) => {
  const { theme, realTheme, setTheme } = useTheme();

  const appId = `css-var-${useId()}`;

  return (
    <RootLayoutContext.Provider
      value={{
        theme,
        setTheme,
        realTheme,
        appId,
      }}
    >
      {children}
    </RootLayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(RootLayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
