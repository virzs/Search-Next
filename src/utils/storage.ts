/**
 * 本地存储桌面配置 key
 */
export const DESKTOP_LIST_STORAGE_KEY = "SEARCH_NEXT_DESKTOP_LIST";
/**
 * 用户是否修改过桌面配置
 */
export const DESKTOP_LIST_MODIFIED_STORAGE_KEY =
  "SEARCH_NEXT_DESKTOP_LIST_MODIFIED";

export const DESKTOP_THEME_STORAGE_KEY = "SEARCH_NEXT_DESKTOP_THEME";

export const PERSONALIZATION_STORAGE_KEY = "SEARCH_NEXT_PERSONALIZATION";

/**
 * 已读通知 id 列表
 */
export const NOTICE_READ_IDS_STORAGE_KEY = "SEARCH_NEXT_NOTICE_READ_IDS";

export const SEARCH_NEXT_STORAGE_KEYS = [
  DESKTOP_LIST_STORAGE_KEY,
  DESKTOP_LIST_MODIFIED_STORAGE_KEY,
  DESKTOP_THEME_STORAGE_KEY,
  PERSONALIZATION_STORAGE_KEY,
  NOTICE_READ_IDS_STORAGE_KEY,
] as const;

export const SEARCH_NEXT_BACKUP_FILE_MAGIC = "SEARCH_NEXT_BACKUP_V1";

export type StorageBackupV1 = {
  version: 1;
  createdAt: string;
  app?: "search-next";
  origin?: string;
  items: Record<string, string | null>;
};

export const createStorageBackup = (
  keys: readonly string[],
  storage: Storage = localStorage,
): StorageBackupV1 => {
  const items: Record<string, string | null> = {};
  for (const key of keys) {
    items[key] = storage.getItem(key);
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    app: "search-next",
    origin,
    items,
  };
};

const base64EncodeUtf8 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64DecodeUtf8 = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

export const stringifyStorageBackup = (backup: StorageBackupV1) => {
  const json = JSON.stringify(backup);
  const encoded = base64EncodeUtf8(json);
  return `${SEARCH_NEXT_BACKUP_FILE_MAGIC}\n${encoded}\n`;
};

export const parseStorageBackup = (text: string): StorageBackupV1 => {
  const trimmed = text.trim();
  if (!trimmed.startsWith(SEARCH_NEXT_BACKUP_FILE_MAGIC)) {
    throw new Error("不支持的备份文件格式");
  }

  const encoded = trimmed.slice(SEARCH_NEXT_BACKUP_FILE_MAGIC.length).trim();
  if (!encoded) throw new Error("备份文件内容为空");

  let jsonText: string;
  try {
    jsonText = base64DecodeUtf8(encoded);
  } catch {
    throw new Error("备份文件解码失败");
  }

  const parsed = JSON.parse(jsonText) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("备份文件格式不正确");
  }

  const record = parsed as Record<string, unknown>;
  if (record.version !== 1) {
    throw new Error("不支持的备份版本");
  }

  if (typeof record.createdAt !== "string") {
    throw new Error("备份文件缺少 createdAt");
  }

  if (!record.items || typeof record.items !== "object") {
    throw new Error("备份文件缺少 items");
  }

  const itemsRecord = record.items as Record<string, unknown>;
  for (const [key, value] of Object.entries(itemsRecord)) {
    if (value !== null && typeof value !== "string") {
      throw new Error(`备份项格式不正确: ${key}`);
    }
  }

  return record as StorageBackupV1;
};

export const applyStorageBackup = (
  backup: StorageBackupV1,
  keys: readonly string[],
  storage: Storage = localStorage,
  options?: { mode?: "strict" | "merge" },
) => {
  const mode = options?.mode ?? "strict";
  for (const key of keys) {
    if (mode === "merge" && !(key in backup.items)) continue;
    const value = backup.items[key];
    if (value === null || value === undefined) {
      storage.removeItem(key);
      continue;
    }
    storage.setItem(key, value);
  }
};
