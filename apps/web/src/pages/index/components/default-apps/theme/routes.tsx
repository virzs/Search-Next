import { themeRoute } from "./route-paths";
import ThemeModalRoute from "./index";
import ThemeView from "./views/theme";
import WallpaperView from "./views/wallpaper";
import ThemeDetailView from "./views/theme-detail";
import WallpaperCategoryView from "./views/wallpaper-category";
import ThemeMyView from "./views/my";
import ThemeMyEditorView from "./views/my-editor";

export const themeRoutes = {
  path: themeRoute.segment.root,
  element: <ThemeModalRoute />,
  children: [
    { index: true, element: <ThemeView /> },
    { path: themeRoute.segment.detail, element: <ThemeDetailView /> },
    {
      path: themeRoute.segment.wallpaperCategory,
      element: <WallpaperCategoryView />,
    },
    { path: themeRoute.segment.wallpaper, element: <WallpaperView /> },
    { path: themeRoute.segment.my, element: <ThemeMyView /> },
    { path: themeRoute.segment.myCreate, element: <ThemeMyEditorView /> },
    { path: themeRoute.segment.myEdit, element: <ThemeMyEditorView /> },
  ],
};
