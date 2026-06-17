export const storeRoute = {
  segment: {
    root: "store",
    search: "search",
    website: "website",
    widget: "widget",
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
    widget: "/store/widget",
    dev: "/store/dev",
  },
} as const;
