import { personalizationRoute } from "./route-paths";
import PersonalizationModalRoute from "./index";
import ThemeView from "./views/theme";
import WallpaperView from "./views/wallpaper";
import ThemeDetailView from "./views/theme-detail";
import WallpaperCategoryView from "./views/wallpaper-category";
import ThemeMyView from "./views/my";
import ThemeMyEditorView from "./views/my-editor";
import ThemeMyThemeEditorView from "./views/my-theme-editor";

export const personalizationRoutes = {
  path: personalizationRoute.segment.root,
  element: <PersonalizationModalRoute />,
  children: [
    { index: true, element: <ThemeView /> },
    { path: personalizationRoute.segment.detail, element: <ThemeDetailView /> },
    {
      path: personalizationRoute.segment.wallpaperCategory,
      element: <WallpaperCategoryView />,
    },
    { path: personalizationRoute.segment.wallpaper, element: <WallpaperView /> },
    { path: personalizationRoute.segment.my, element: <ThemeMyView /> },
    { path: personalizationRoute.segment.myCreate, element: <ThemeMyEditorView /> },
    { path: personalizationRoute.segment.myEdit, element: <ThemeMyEditorView /> },
    {
      path: personalizationRoute.segment.myThemeCreate,
      element: <ThemeMyThemeEditorView />,
    },
    {
      path: personalizationRoute.segment.myThemeEdit,
      element: <ThemeMyThemeEditorView />,
    },
  ],
};
