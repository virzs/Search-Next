import type { DesktopPage, DesktopRootItem, DesktopSortItem } from "./types";

export const createEmptyDesktopPages = (): DesktopPage[] => [
  { id: "page-1", type: "page", children: [] },
];

export const hasDesktopChildren = (
  items: Array<{ children?: unknown[] }> | undefined,
) =>
  Boolean(
    items?.some((item) => Array.isArray(item.children) && item.children.length),
  );

export const hasDesktopPagesContent = (pages: DesktopPage[]) =>
  pages.some((page) => page.children.length > 0);

export const hasDesktopRootsContent = (roots: DesktopRootItem[]) =>
  roots.some(
    (root) => Array.isArray(root.children) && root.children.length > 0,
  );

export const toDesktopPages = (
  list: DesktopRootItem[] | null | undefined,
): DesktopPage[] => {
  const pages = (Array.isArray(list) ? list : [])
    .filter((root) => root.type === "page")
    .map((root, index) => ({
      ...root,
      id: root.id ?? `page-${index + 1}`,
      type: "page",
      children: Array.isArray(root.children) ? root.children : [],
    }));

  return pages.length ? pages : createEmptyDesktopPages();
};

export const extractDockItems = (
  list: DesktopRootItem[] | null | undefined,
): DesktopSortItem[] => {
  const dockRoot = (Array.isArray(list) ? list : []).find(
    (root) => root.type === "dock" && root.id === "dock",
  );
  return Array.isArray(dockRoot?.children) ? dockRoot.children : [];
};

export const toDesktopRoots = (
  pages: DesktopPage[],
  dockItems: DesktopSortItem[] = [],
): DesktopRootItem[] => {
  const normalizedPages = pages.length ? pages : createEmptyDesktopPages();
  return [
    {
      id: "dock",
      type: "dock",
      children: dockItems,
    },
    ...normalizedPages.map((page, index) => ({
      ...page,
      id: page.id ?? `page-${index + 1}`,
      type: "page",
      children: Array.isArray(page.children) ? page.children : [],
    })),
  ];
};

export const preserveDesktopPageMetadata = (
  pages: DesktopPage[],
  previousPages: DesktopPage[],
): DesktopPage[] =>
  pages.map((page, index) => {
    const previous = previousPages[index];
    return {
      ...previous,
      ...page,
      id: previous?.id ?? page.id ?? `page-${index + 1}`,
      type: page.type ?? previous?.type ?? "page",
      config: page.config ?? previous?.config,
      data: page.data ?? previous?.data,
      children: page.children ?? [],
    };
  });
