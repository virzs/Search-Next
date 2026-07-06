import { baseGetRequest, basePutRequestNoId } from "@/utils/axios";
import type { StorageBackupV1 } from "@/utils/storage";

export interface UserDataPluginSummary {
  appId: string;
  name?: string;
  version?: string;
  count: number;
}

export interface UserDataSyncInfo {
  hasSynced: boolean;
  payload: StorageBackupV1 | null;
  backups: Array<{
    _id: string;
    name?: string;
    payload: StorageBackupV1;
    byteSize: number;
    itemCount: number;
    pluginSummary: UserDataPluginSummary[];
    lastSyncedAt: string | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
  byteSize: number;
  itemCount: number;
  pluginSummary: UserDataPluginSummary[];
  lastSyncedAt: string | null;
  versionCount: number;
  maxSyncBackups: number;
  overLimit: boolean;
  canCreate: boolean;
  updatedAt?: string;
}

export const getUserDataSync = () =>
  baseGetRequest<UserDataSyncInfo>("/tabs/user-data/sync")();

export const putUserDataSync = (data: {
  payload: StorageBackupV1;
  backupId?: string;
  name?: string;
}) => basePutRequestNoId<UserDataSyncInfo>("/tabs/user-data/sync")(data);

export const renameUserDataSyncBackup = (id: string, name: string) =>
  basePutRequestNoId<UserDataSyncInfo>(`/tabs/user-data/sync/${id}/name`)({
    name,
  });
