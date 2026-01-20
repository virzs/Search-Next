import { createRoot } from "react-dom/client";
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Theme } from "@radix-ui/themes";

import "./index.css";
import Index from "./pages/index";
import { App, ConfigProvider } from "antd";
import theme from "./theme/config";
import { AuthProvider } from "./contexts/AuthContext";
import { AppConfigProvider } from "./contexts/ConfigContext";
import { GlobalNotificationProvider } from "./utils/globalNotification";
import { DesktopThemeProvider } from "./contexts/DesktopThemeContext";
import defaultAppRoutes from "./pages/index/components/default-apps/routes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    children: [...defaultAppRoutes],
  },
]);

createRoot(document.getElementById("root")!).render(
  <Theme>
    <App>
      <GlobalNotificationProvider />
      <ConfigProvider theme={theme}>
        <AuthProvider>
          <AppConfigProvider>
            <DesktopThemeProvider>
              <RouterProvider router={router} />
            </DesktopThemeProvider>
          </AppConfigProvider>
        </AuthProvider>
      </ConfigProvider>
    </App>
  </Theme>,
);

// 让外部纯 JS 小组件复用宿主项目的 React 和 ReactDOM
// 避免重复打包 React，确保共享同一实例
(globalThis as any).React = (globalThis as any).React || React;
(globalThis as any).ReactDOM = (globalThis as any).ReactDOM || ReactDOMClient;
