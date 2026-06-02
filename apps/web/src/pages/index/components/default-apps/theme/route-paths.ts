export const themeRoute = {
  segment: {
    root: "theme",
    detail: "detail/:id",
    wallpaper: "wallpaper",
    wallpaperCategory: "wallpaper/category/:id",
    my: "my",
    myCreate: "my/create",
    myEdit: "my/edit/:id",
  },
  path: {
    root: "/theme",
    detail: (themeId: string) => `/theme/detail/${encodeURIComponent(themeId)}`,
    wallpaper: "/theme/wallpaper",
    wallpaperCategory: (categoryId: string) =>
      `/theme/wallpaper/category/${encodeURIComponent(categoryId)}`,
    my: "/theme/my",
    myCreate: "/theme/my/create",
    myEdit: (id: string) => `/theme/my/edit/${encodeURIComponent(id)}`,
  },
} as const;
