import { themeRoute } from "./route-paths";
import ThemeModalRoute from "./index";
import ThemeView from "./views/theme";
import WallpaperView from "./views/wallpaper";
import ThemeDetailView from "./views/theme-detail";

export const themeRoutes = {
  path: themeRoute.segment.root,
  element: <ThemeModalRoute />,
  children: [
    { index: true, element: <ThemeView /> },
    { path: themeRoute.segment.detail, element: <ThemeDetailView /> },
    { path: themeRoute.segment.wallpaper, element: <WallpaperView /> },
  ],
};
