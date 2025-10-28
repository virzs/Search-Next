import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Theme } from "@radix-ui/themes";

import "./index.css";
import Index from "./pages/index";
import { App, ConfigProvider } from "antd";
import theme from "./theme/config";
import LoginPage from "./pages/login";
import { AuthProvider } from "./contexts/AuthContext";
import { GlobalNotificationProvider } from "./utils/globalNotification";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <Theme>
    <App>
      <GlobalNotificationProvider />
      <ConfigProvider theme={theme}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ConfigProvider>
    </App>
  </Theme>
);
