export const storeRoute = {
  segment: {
    root: "store",
    search: "search",
    website: "website",
    app: "app",
    widget: "widget",
    appCollection: "collection/:id",
    dev: "dev",
    websiteCollection: "collection/:id",
    websiteDetail: "detail/:id",
    wildcard: "*",
  },
  path: {
    root: "/store",
    search: "/store/search",
    website: {
      root: "/store/website",
      collection: (collectionId: string) =>
        `/store/website/collection/${encodeURIComponent(collectionId)}`,
      detail: (websiteId: string) =>
        `/store/website/detail/${encodeURIComponent(websiteId)}`,
    },
    app: "/store/app",
    widget: "/store/widget",
    appCollection: (collectionId: string) =>
      `/store/app/collection/${encodeURIComponent(collectionId)}`,
    dev: "/store/dev",
  },
} as const;
