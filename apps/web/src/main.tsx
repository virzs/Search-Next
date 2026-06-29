import { createRoot } from "react-dom/client";
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Theme } from "@radix-ui/themes";

import "./index.css";
import DesktopNextIndex from "./pages/index";
import { App, ConfigProvider } from "antd";
import { createThemeConfig } from "./theme/config";
import { AuthProvider } from "./contexts/AuthContext";
import { AppConfigProvider } from "./contexts/ConfigContext";
import { GlobalNotificationProvider } from "./utils/globalNotification";
import { DesktopThemeProvider } from "./contexts/DesktopThemeContext";
import { WidgetProvider } from "./contexts/WidgetContext";
import defaultAppRoutes from "./pages/index/components/default-apps/routes";
import useDesktopTheme from "./hooks/useDesktopTheme";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DesktopNextIndex />,
    children: [...defaultAppRoutes],
  },
]);

const ThemedConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { resolvedColorScheme } = useDesktopTheme();
  const themeConfig = React.useMemo(
    () => createThemeConfig(resolvedColorScheme),
    [resolvedColorScheme],
  );

  return (
    <Theme appearance={resolvedColorScheme}>
      <ConfigProvider theme={themeConfig}>
        <App>{children}</App>
      </ConfigProvider>
    </Theme>
  );
};

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AppConfigProvider>
      <DesktopThemeProvider>
        <ThemedConfigProvider>
          <GlobalNotificationProvider />
          <WidgetProvider>
            <RouterProvider router={router} />
          </WidgetProvider>
        </ThemedConfigProvider>
      </DesktopThemeProvider>
    </AppConfigProvider>
  </AuthProvider>,
);

// 让外部纯 JS 小组件复用宿主项目的 React 和 ReactDOM
// 避免重复打包 React，确保共享同一实例
(globalThis as any).React = (globalThis as any).React || React;
(globalThis as any).ReactDOM = (globalThis as any).ReactDOM || ReactDOMClient;
