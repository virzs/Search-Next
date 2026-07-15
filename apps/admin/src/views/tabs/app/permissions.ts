import { routeAuth } from "@/contexts/AccessContext";

export const APP_PERMISSIONS = {
  list: routeAuth("GET", "/tabs/app"),
  detail: routeAuth("GET", "/tabs/app/:id"),
  create: routeAuth("POST", "/tabs/app"),
  update: routeAuth("PUT", "/tabs/app/:id"),
  delete: routeAuth("DELETE", "/tabs/app/:id"),
  toggleEnable: routeAuth("PUT", "/tabs/app/:id/enable"),
  importPackage: routeAuth("POST", "/tabs/app/package"),
  versions: routeAuth("GET", "/tabs/app/:id/versions"),
  publishVersion: routeAuth(
    "PUT",
    "/tabs/app/:id/versions/:versionId/publish",
  ),
} as const;
