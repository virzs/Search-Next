export const themeRoute = {
  segment: {
    root: "theme",
    detail: "detail/:id",
    wallpaper: "wallpaper",
    wallpaperCategory: "wallpaper/category/:id",
  },
  path: {
    root: "/theme",
    detail: (themeId: string) => `/theme/detail/${encodeURIComponent(themeId)}`,
    wallpaper: "/theme/wallpaper",
    wallpaperCategory: (categoryId: string) =>
      `/theme/wallpaper/category/${encodeURIComponent(categoryId)}`,
  },
} as const;
