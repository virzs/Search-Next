import type { ReactNode } from "react";
import type { RouteObject } from "react-router";

export type DefaultAppRouteSearchGroup = "page" | "setting";

export interface RouteVisibilityContext {
  devModeEnabled?: boolean;
}

export interface RouteTextResolverContext {
  route: DefaultAppRouteDefinition;
  field: "title" | "description" | "keyword";
}

export type RouteTextResolver = (
  text: string,
  context: RouteTextResolverContext,
) => string;

export interface RouteMeta {
  title: string;
  description?: string;
  icon?: ReactNode;
  activeIcon?: ReactNode;
  keywords?: string[];
}

export type RouteSearchConfig =
  | false
  | {
      enabled: true;
      group: DefaultAppRouteSearchGroup;
      keywords?: string[];
      visible?: (context: RouteVisibilityContext) => boolean;
    };

export type RouteSidebarConfig =
  | false
  | {
      enabled: true;
      key?: string;
      match?: (pathname: string) => boolean;
      visible?: (context: RouteVisibilityContext) => boolean;
    };

export interface DefaultAppRouteDefinition {
  key: string;
  path: string;
  segment: string;
  index?: boolean;
  meta: RouteMeta;
  sidebar?: RouteSidebarConfig;
  search?: RouteSearchConfig;
  children?: DefaultAppRouteDefinition[];
}

export interface RouteSearchItem {
  key: string;
  title: string;
  description: string;
  path: string;
  group: DefaultAppRouteSearchGroup;
  keywords: string[];
  icon?: ReactNode;
}

export const resolveRouteText = (
  text: string,
  context: RouteTextResolverContext,
  resolver?: RouteTextResolver,
) => resolver?.(text, context) ?? text;

export const flattenRouteDefinitions = (
  routes: readonly DefaultAppRouteDefinition[],
): DefaultAppRouteDefinition[] =>
  routes.flatMap((route) => [
    route,
    ...flattenRouteDefinitions(route.children ?? []),
  ]);

const isVisible = (
  visible: ((context: RouteVisibilityContext) => boolean) | undefined,
  context: RouteVisibilityContext,
) => !visible || visible(context);

export const createSidebarMenuItems = (
  routes: readonly DefaultAppRouteDefinition[],
  options: {
    context?: RouteVisibilityContext;
    textResolver?: RouteTextResolver;
  } = {},
) => {
  const context = options.context ?? {};
  return flattenRouteDefinitions(routes)
    .filter((route) => {
      const sidebar = route.sidebar;
      return Boolean(
        typeof sidebar === "object" &&
          sidebar.enabled &&
          isVisible(sidebar.visible, context),
      );
    })
    .map((route) => {
      const sidebar = typeof route.sidebar === "object" ? route.sidebar : null;
      return {
        key: sidebar?.key ?? route.key,
        label: resolveRouteText(
          route.meta.title,
          { route, field: "title" },
          options.textResolver,
        ),
        path: route.path,
        icon: route.meta.icon,
        activeIcon: route.meta.activeIcon,
        match: sidebar?.match,
      };
    });
};

export const createRouteSearchItems = (
  routes: readonly DefaultAppRouteDefinition[],
  options: {
    context?: RouteVisibilityContext;
    textResolver?: RouteTextResolver;
  } = {},
): RouteSearchItem[] => {
  const context = options.context ?? {};
  return flattenRouteDefinitions(routes)
    .filter((route) => {
      const search = route.search;
      return Boolean(
        typeof search === "object" &&
          search.enabled &&
          isVisible(search.visible, context),
      );
    })
    .map((route) => {
      const search = typeof route.search === "object" ? route.search : null;
      const keywords = [
        ...(route.meta.keywords ?? []),
        ...(search?.keywords ?? []),
      ].map((keyword) =>
        resolveRouteText(
          keyword,
          { route, field: "keyword" },
          options.textResolver,
        ),
      );

      return {
        key: route.key,
        title: resolveRouteText(
          route.meta.title,
          { route, field: "title" },
          options.textResolver,
        ),
        description: route.meta.description
          ? resolveRouteText(
              route.meta.description,
              { route, field: "description" },
              options.textResolver,
            )
          : route.path,
        path: route.path,
        group: search?.group ?? "page",
        keywords,
        icon: route.meta.icon,
      };
    });
};

export const createRouteObjectsFromDefinitions = (
  routes: readonly DefaultAppRouteDefinition[],
  elements: Partial<Record<string, ReactNode>>,
): RouteObject[] =>
  routes.flatMap((route) => {
    const element = elements[route.key];
    const children = route.children
      ? createRouteObjectsFromDefinitions(route.children, elements)
      : undefined;

    if (element === undefined && !children?.length) return [];

    if (route.index) {
      return [{ index: true, element } as RouteObject];
    }

    return [
      {
        path: route.segment,
        element,
        children,
      } as RouteObject,
    ];
  });
