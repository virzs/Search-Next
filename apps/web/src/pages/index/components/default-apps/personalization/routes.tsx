import type { ReactNode } from "react";
import { createRouteObjectsFromDefinitions } from "../route-config";
import { personalizationRoute } from "./route-paths";
import PersonalizationModalRoute from "./index";
import ThemeView from "./views/theme";
import WallpaperView from "./views/wallpaper";
import ThemeDetailView from "./views/theme-detail";
import WallpaperCategoryView from "./views/wallpaper-category";
import ThemeMyView from "./views/my";
import ThemeMyEditorView from "./views/my-editor";
import ThemeMyThemeEditorView from "./views/my-theme-editor";
import { personalizationRouteDefinitions } from "./route-definitions";

const personalizationRouteElements = {
  "personalization.theme": <ThemeView />,
  "personalization.detail": <ThemeDetailView />,
  "personalization.wallpaper-category": <WallpaperCategoryView />,
  "personalization.wallpaper": <WallpaperView />,
  "personalization.my": <ThemeMyView />,
  "personalization.my-create": <ThemeMyEditorView />,
  "personalization.my-edit": <ThemeMyEditorView />,
  "personalization.my-theme-create": <ThemeMyThemeEditorView />,
  "personalization.my-theme-edit": <ThemeMyThemeEditorView />,
} satisfies Record<string, ReactNode>;

export const personalizationRoutes = {
  path: personalizationRoute.segment.root,
  element: <PersonalizationModalRoute />,
  children: createRouteObjectsFromDefinitions(
    personalizationRouteDefinitions,
    personalizationRouteElements,
  ),
};
