import { RouteObject } from "react-router";
import LoginView from "./login";
import RegisterView from "./register";
import SetupView from "../setup";

export const AuthPaths = {
  login: "/login",
  register: "/register",
  setup: "/setup",
};

const AuthRouter: RouteObject[] = [
  {
    path: AuthPaths.setup,
    element: <SetupView />,
  },
  {
    path: AuthPaths.login,
    element: <LoginView />,
  },
  {
    path: AuthPaths.register,
    element: <RegisterView />,
  },
];

export default AuthRouter;
