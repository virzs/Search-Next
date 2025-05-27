import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Theme } from "@radix-ui/themes";

import "./index.css";
import Index from "./pages/index";
import { ConfigProvider } from "antd";
import theme from "./theme/config";
import LoginPage from "./pages/login";

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
      <RouterProvider router={router} />
    </ConfigProvider>
  </Theme>
);
