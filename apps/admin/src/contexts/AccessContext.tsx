import { getCurrentUser, type CurrentUserInfo } from "@/services/user";
import { getUserInfo, setUserInfo } from "@/utils/userInfo";
import { useRequest } from "ahooks";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type PermissionAuth = boolean | string | string[] | null | undefined;

export interface PermissionItem {
  _id?: string;
  name?: string;
  url?: string;
  method?: string;
  type?: number;
  syncKey?: string;
  isStale?: boolean;
}

interface AccessContextValue {
  userInfo: CurrentUserInfo;
  permissions: PermissionItem[];
  isSuperAdmin: boolean;
  loading: boolean;
  refresh: () => void;
  setAccessUser: (user: CurrentUserInfo) => void;
}

const AccessContext = createContext<AccessContextValue>({
  userInfo: {},
  permissions: [],
  isSuperAdmin: false,
  loading: false,
  refresh: () => {},
  setAccessUser: () => {},
});

const normalizePermissionPath = (value?: string) => {
  if (!value) return "";
  const [path] = value.split("?");
  const normalized = path.trim().replace(/\/+/g, "/").replace(/\/$/, "");
  return normalized.startsWith("/") ? normalized || "/" : `/${normalized}`;
};

const normalizeMethod = (value?: string) => value?.trim().toUpperCase();

export const routeAuth = (method: string, url: string) =>
  `${normalizeMethod(method)}:${normalizePermissionPath(url)}`;

const getPermissionKeys = (permission: PermissionItem) => {
  const keys = new Set<string>();
  const method = normalizeMethod(permission.method);
  const url = normalizePermissionPath(permission.url);

  if (permission._id) keys.add(permission._id);
  if (permission.syncKey) keys.add(permission.syncKey);
  if (permission.name) keys.add(permission.name);
  if (url) keys.add(url);
  if (method && url) {
    keys.add(routeAuth(method, url));
    keys.add(`permission-route:${method}:${url}`);
  }

  return keys;
};

export const matchPermission = (auth: PermissionAuth, access: Pick<AccessContextValue, "isSuperAdmin" | "permissions">) => {
  if (auth === undefined || auth === null || auth === true) return true;
  if (auth === false) return false;
  if (access.isSuperAdmin) return true;

  const authList = Array.isArray(auth) ? auth : [auth];
  if (!authList.length) return false;

  const permissionKeys = new Set<string>();
  access.permissions
    .filter((permission) => !permission.isStale)
    .forEach((permission) => {
      getPermissionKeys(permission).forEach((key) => permissionKeys.add(key));
    });

  return authList.some((item) => {
    const key = item.includes(":") ? item : normalizePermissionPath(item);
    return permissionKeys.has(item) || permissionKeys.has(key);
  });
};

export const AccessProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfoState] = useState<CurrentUserInfo>(() => getUserInfo());

  const { loading, run } = useRequest(getCurrentUser, {
    manual: true,
    onSuccess: (data) => {
      setUserInfo(data);
      setUserInfoState(data);
    },
  });

  const value = useMemo<AccessContextValue>(() => {
    const permissions = userInfo?.permissions ?? [];
    const isSuperAdmin = Boolean(userInfo?.isSuperAdmin);

    return {
      userInfo,
      permissions,
      isSuperAdmin,
      loading,
      refresh: run,
      setAccessUser: (user) => {
        setUserInfo(user);
        setUserInfoState(user);
      },
    };
  }, [loading, run, userInfo]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess must be used within an AccessProvider");
  }
  return context;
};

export const useHasPermission = (auth: PermissionAuth) => {
  const access = useAccess();
  return matchPermission(auth, access);
};
