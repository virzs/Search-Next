import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Theme } from "@radix-ui/themes";

import "./index.css";
import Index from "./pages/index";
import { App, ConfigProvider } from "antd";
import theme from "./theme/config";
import { AuthProvider } from "./contexts/AuthContext";
import { AppConfigProvider } from "./contexts/ConfigContext";
import { GlobalNotificationProvider } from "./utils/globalNotification";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <Theme>
    <App>
      <GlobalNotificationProvider />
      <ConfigProvider theme={theme}>
        <AuthProvider>
          <AppConfigProvider>
            <RouterProvider router={router} />
          </AppConfigProvider>
        </AuthProvider>
      </ConfigProvider>
    </App>
  </Theme>
);
