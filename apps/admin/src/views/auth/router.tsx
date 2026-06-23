import { RouteObject } from "react-router";
import LoginView from "./login";
import RegisterView from "./register";

export const AuthPaths = {
  login: "/login",
  register: "/register",
};

const AuthRouter: RouteObject[] = [
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
