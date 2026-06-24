import { baseDeleteRequest, baseGetRequest } from "@/utils/axios";

export interface AdminUserDataPluginSummary {
  widgetId: string;
  name?: string;
  version?: string;
  count: number;
}

export interface AdminUserDataSyncRecord {
  _id: string;
  hasSynced: boolean;
  latestBackupId?: string;
  latestBackupName?: string;
  user: {
    _id: string;
    username?: string;
    email?: string;
    nickname?: string;
  } | null;
  byteSize: number;
  totalByteSize: number;
  itemCount: number;
  versionCount: number;
  maxSyncBackups: number;
  overLimit: boolean;
  pluginSummary: AdminUserDataPluginSummary[];
  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserDataSyncVersion {
  _id: string;
  userId: string;
  name?: string;
  byteSize: number;
  itemCount: number;
  pluginSummary: AdminUserDataPluginSummary[];
  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getUserDataSyncAdmin = (params: any) =>
  baseGetRequest<{
    data: AdminUserDataSyncRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>("/tabs/user-data/sync/admin")(params);

export const getUserDataSyncAdminVersions = (userId: string) =>
  baseGetRequest<AdminUserDataSyncVersion[]>(
    `/tabs/user-data/sync/admin/${userId}/versions`,
  )();

export const deleteUserDataSyncAdminVersion = (id: string) =>
  baseDeleteRequest<AdminUserDataSyncVersion>(
    "/tabs/user-data/sync/admin/versions",
  )(id);
