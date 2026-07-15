import { RequestMethod } from '@nestjs/common';

const REQUEST_METHOD_NAMES: Partial<Record<RequestMethod, string>> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
  [RequestMethod.PUT]: 'PUT',
  [RequestMethod.DELETE]: 'DELETE',
  [RequestMethod.PATCH]: 'PATCH',
  [RequestMethod.OPTIONS]: 'OPTIONS',
  [RequestMethod.HEAD]: 'HEAD',
};

export const getRequestMethodName = (
  method: RequestMethod | undefined,
): string | null => {
  if (method === undefined) {
    return null;
  }
  return REQUEST_METHOD_NAMES[method] ?? null;
};

export const normalizePermissionPath = (path?: string): string => {
  if (!path) {
    return '/';
  }

  const normalized = path.trim().replace(/\/+/g, '/');
  const withLeadingSlash = normalized.startsWith('/')
    ? normalized
    : `/${normalized}`;

  if (withLeadingSlash.length === 1) {
    return withLeadingSlash;
  }

  return withLeadingSlash.replace(/\/+$/g, '');
};

export const joinRoutePaths = (...parts: string[]): string => {
  const path = parts
    .map((part) => part?.trim?.() ?? '')
    .filter(Boolean)
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');

  return normalizePermissionPath(path);
};

export const toPathList = (path?: string | string[]): string[] => {
  if (Array.isArray(path)) {
    return path.length > 0 ? path : [''];
  }
  return [path ?? ''];
};

export const getRoutePermissionPaths = (
  controllerPath?: string | string[],
  handlerPath?: string | string[],
): string[] => {
  const paths = new Set<string>();

  for (const controller of toPathList(controllerPath)) {
    for (const handler of toPathList(handlerPath)) {
      paths.add(joinRoutePaths(controller, handler));
    }
  }

  return [...paths];
};
