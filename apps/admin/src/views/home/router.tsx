import { RouteObject } from "react-router";
import HomeView from ".";

export const HomePaths = {
  home: "/",
};

const HomeRouter: RouteObject = {
  path: HomePaths.home,
  element: <HomeView />,
};

export default HomeRouter;
