import { createRoot } from "react-dom/client";
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Theme } from "@radix-ui/themes";
import { I18nextProvider } from "react-i18next";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { ZsI18nProvider } from "zs_library";

import "./index.css";
import "zs_library/style.css";
import "./theme/foundations.css";
import DesktopNextIndex from "./pages/index";
import { App, ConfigProvider } from "antd";
import { createThemeConfig } from "./theme/config";
import { AuthProvider } from "./contexts/AuthContext";
import { AppConfigProvider } from "./contexts/ConfigContext";
import { GlobalNotificationProvider } from "./utils/globalNotification";
import { DesktopThemeProvider } from "./contexts/DesktopThemeContext";
import { AppProvider } from "./contexts/AppContext";
import defaultAppRoutes from "./pages/index/components/default-apps/routes";
import useDesktopTheme from "./hooks/useDesktopTheme";
import { i18n, useI18n, type AppLanguage } from "./i18n";
import { installAppThemeCssVariables } from "./theme/tokens";
import { useConfig } from "./hooks/useConfig";
import {
  DEFAULT_THEME_COLOR,
  installAccentThemeCssVariables,
} from "./theme/color";
import { applyWebSiteMetadata } from "./utils/siteMetadata";

installAppThemeCssVariables();

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
  const { language } = useI18n();
  const { projectInfo } = useConfig();
  const themeColor = projectInfo?.site?.themeColor || DEFAULT_THEME_COLOR;
  const themeConfig = React.useMemo(
    () => createThemeConfig(resolvedColorScheme, themeColor),
    [resolvedColorScheme, themeColor],
  );

  React.useEffect(() => {
    installAccentThemeCssVariables(themeColor, resolvedColorScheme);
  }, [resolvedColorScheme, themeColor]);

  React.useEffect(() => {
    applyWebSiteMetadata(projectInfo);
  }, [projectInfo]);

  return (
    <Theme appearance={resolvedColorScheme}>
      <ZsI18nProvider language={language}>
        {/* Keep Search Next translations bound to the app i18n under zs_library's provider. */}
        <I18nextProvider i18n={i18n}>
          <ConfigProvider
            locale={antdLocales[language]}
            theme={themeConfig}
            button={{ autoInsertSpace: false }}
          >
            <App>{children}</App>
          </ConfigProvider>
        </I18nextProvider>
      </ZsI18nProvider>
    </Theme>
  );
};

const antdLocales: Record<AppLanguage, typeof zhCN> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <AuthProvider>
      <AppConfigProvider>
        <DesktopThemeProvider>
          <ThemedConfigProvider>
            <GlobalNotificationProvider />
            <AppProvider>
              <RouterProvider router={router} />
            </AppProvider>
          </ThemedConfigProvider>
        </DesktopThemeProvider>
      </AppConfigProvider>
    </AuthProvider>
  </I18nextProvider>,
);

// 让外部纯 JS 应用复用宿主项目的 React 和 ReactDOM
// 避免重复打包 React，确保共享同一实例
(globalThis as any).React = (globalThis as any).React || React;
(globalThis as any).ReactDOM = (globalThis as any).ReactDOM || ReactDOMClient;
