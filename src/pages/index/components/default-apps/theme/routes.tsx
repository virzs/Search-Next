import { themeRoute } from "./route-paths";
import ThemeModalRoute from "./index";
import ThemeView, { ThemeDetailView } from "./views/theme";
import WallpaperView from "./views/wallpaper";

export const themeRoutes = {
  path: themeRoute.segment.root,
  element: <ThemeModalRoute />,
  children: [
    { index: true, element: <ThemeView /> },
    { path: themeRoute.segment.detail, element: <ThemeDetailView /> },
    { path: themeRoute.segment.wallpaper, element: <WallpaperView /> },
  ],
};
