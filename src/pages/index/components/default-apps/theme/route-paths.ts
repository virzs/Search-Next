export const themeRoute = {
  segment: {
    root: "theme",
    detail: "detail/:id",
    wallpaper: "wallpaper",
  },
  path: {
    root: "/theme",
    detail: (themeId: string) => `/theme/detail/${encodeURIComponent(themeId)}`,
    wallpaper: "/theme/wallpaper",
  },
} as const;
