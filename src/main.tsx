import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Theme } from "@radix-ui/themes";

import "./index.css";
import Index from "./pages/index";
import { ConfigProvider } from "antd";
import theme from "./theme/config";
import LoginPage from "./pages/login";
import { AuthProvider } from "./contexts/AuthContext";

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
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  </Theme>
);
