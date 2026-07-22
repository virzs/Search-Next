export const personalizationRoute = {
  segment: {
    root: "personalization",
    detail: "detail/:id",
    wallpaper: "wallpaper",
    wallpaperCategory: "wallpaper/category/:id",
    wallpaperCollection: "wallpaper/collection/:id",
    my: "my",
    myCreate: "my/create",
    myEdit: "my/edit/:id",
    myThemeCreate: "my/theme/create",
    myThemeEdit: "my/theme/edit/:id",
  },
  path: {
    root: "/personalization",
    detail: (themeId: string) =>
      `/personalization/detail/${encodeURIComponent(themeId)}`,
    wallpaper: "/personalization/wallpaper",
    wallpaperCategory: (categoryId: string) =>
      `/personalization/wallpaper/category/${encodeURIComponent(categoryId)}`,
    wallpaperCollection: (collectionId: string) =>
      `/personalization/wallpaper/collection/${encodeURIComponent(collectionId)}`,
    my: "/personalization/my",
    myCreate: "/personalization/my/create",
    myEdit: (id: string) =>
      `/personalization/my/edit/${encodeURIComponent(id)}`,
    myThemeCreate: "/personalization/my/theme/create",
    myThemeEdit: (id: string) =>
      `/personalization/my/theme/edit/${encodeURIComponent(id)}`,
  },
} as const;
