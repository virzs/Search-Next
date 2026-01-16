export const storeRoute = {
  segment: {
    root: "store",
    website: "website",
    widget: "widget",
    websiteCollection: "collection/:id",
    websiteDetail: "detail/:id",
    wildcard: "*",
  },
  path: {
    root: "/store",
    website: {
      root: "/store/website",
      collection: (collectionId: string) =>
        `/store/website/collection/${encodeURIComponent(collectionId)}`,
      detail: (websiteId: string) =>
        `/store/website/detail/${encodeURIComponent(websiteId)}`,
    },
    widget: "/store/widget",
  },
} as const;

