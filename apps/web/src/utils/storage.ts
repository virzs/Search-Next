import {
  isAppStorageKey,
  listAppStorageKeys,
  migrateAllLegacyAppStorage,
} from "./app-storage";

/**
 * 本地存储桌面配置 key
 */
export const DESKTOP_LIST_STORAGE_KEY = "SEARCH_NEXT_DESKTOP_LIST";
/**
 * 用户是否修改过桌面配置
 */
export const DESKTOP_LIST_MODIFIED_STORAGE_KEY =
  "SEARCH_NEXT_DESKTOP_LIST_MODIFIED";

/**
 * 用户个性化配置
 */
export const PERSONALIZATION_STORAGE_KEY = "SEARCH_NEXT_PERSONALIZATION";

/**
 * 已读通知 id 列表
 */
export const NOTICE_READ_IDS_STORAGE_KEY = "SEARCH_NEXT_NOTICE_READ_IDS";

/**
 * 用户自定义壁纸（渐变/图片链接）
 */
export const MY_WALLPAPERS_STORAGE_KEY = "SEARCH_NEXT_MY_WALLPAPERS";

/**
 * 用户自定义主题
 */
export const MY_THEMES_STORAGE_KEY = "SEARCH_NEXT_MY_THEMES";

/**
 * 已安装应用列表
 */
export const INSTALLED_APPS_STORAGE_KEY = "SEARCH_NEXT_INSTALLED_APPS";

/**
 * 开发者模式开关
 */
export const DEV_MODE_STORAGE_KEY = "SEARCH_NEXT_DEV_MODE";

/**
 * 开发者自定义应用列表
 */
export const DEV_APPS_STORAGE_KEY = "SEARCH_NEXT_DEV_APPS";

const LEGACY_INSTALLED_APPS_STORAGE_KEY = "SEARCH_NEXT_INSTALLED_WIDGETS";
const LEGACY_DEV_APPS_STORAGE_KEY = "SEARCH_NEXT_DEV_WIDGETS";

export const migrateLegacyAppKeys = (storage: Storage = localStorage) => {
  const pairs: Array<[string, string]> = [
    [LEGACY_INSTALLED_APPS_STORAGE_KEY, INSTALLED_APPS_STORAGE_KEY],
    [LEGACY_DEV_APPS_STORAGE_KEY, DEV_APPS_STORAGE_KEY],
  ];

  for (const [oldKey, newKey] of pairs) {
    const oldValue = storage.getItem(oldKey);
    if (oldValue !== null && storage.getItem(newKey) === null) {
      storage.setItem(newKey, oldValue);
    }
    if (oldValue !== null) storage.removeItem(oldKey);
  }
};

/**
 * 界面语言设置
 */
export const APP_LANGUAGE_STORAGE_KEY = "app-language";

/**
 * 聚焦搜索偏好设置
 */
export const UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY =
  "search-next:unified-search:preferences";

/**
 * 搜索引擎选择设置
 */
export const SEARCH_SELECTED_ENGINES_STORAGE_KEY =
  "search-next:unified-search:selected-engines";

/**
 * 聚焦搜索最近使用记录
 */
export const SEARCH_HISTORY_STORAGE_KEY = "search-next:unified-search:history";

export const SEARCH_NEXT_STORAGE_KEYS = [
  DESKTOP_LIST_STORAGE_KEY,
  DESKTOP_LIST_MODIFIED_STORAGE_KEY,
  PERSONALIZATION_STORAGE_KEY,
  NOTICE_READ_IDS_STORAGE_KEY,
  MY_WALLPAPERS_STORAGE_KEY,
  MY_THEMES_STORAGE_KEY,
  INSTALLED_APPS_STORAGE_KEY,
  DEV_MODE_STORAGE_KEY,
  DEV_APPS_STORAGE_KEY,
  APP_LANGUAGE_STORAGE_KEY,
  UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY,
  SEARCH_SELECTED_ENGINES_STORAGE_KEY,
  SEARCH_HISTORY_STORAGE_KEY,
] as const;

export const isSearchNextBackupKey = (key: string) =>
  SEARCH_NEXT_STORAGE_KEYS.includes(
    key as (typeof SEARCH_NEXT_STORAGE_KEYS)[number],
  ) || isAppStorageKey(key);

export const getSearchNextStorageKeys = (
  storage: Storage = localStorage,
): string[] => {
  migrateLegacyAppKeys(storage);
  migrateAllLegacyAppStorage(storage);
  return [...SEARCH_NEXT_STORAGE_KEYS, ...listAppStorageKeys(storage)];
};

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

export const createSearchNextStorageBackup = (
  storage: Storage = localStorage,
) => createStorageBackup(getSearchNextStorageKeys(storage), storage);

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

export const applySearchNextStorageBackup = (
  backup: StorageBackupV1,
  storage: Storage = localStorage,
  options?: { mode?: "strict" | "merge" },
) => {
  migrateLegacyAppKeys(storage);
  migrateAllLegacyAppStorage(storage);
  if (
    backup.items[LEGACY_INSTALLED_APPS_STORAGE_KEY] !== undefined &&
    backup.items[INSTALLED_APPS_STORAGE_KEY] === undefined
  ) {
    backup.items[INSTALLED_APPS_STORAGE_KEY] =
      backup.items[LEGACY_INSTALLED_APPS_STORAGE_KEY];
  }
  if (
    backup.items[LEGACY_DEV_APPS_STORAGE_KEY] !== undefined &&
    backup.items[DEV_APPS_STORAGE_KEY] === undefined
  ) {
    backup.items[DEV_APPS_STORAGE_KEY] = backup.items[LEGACY_DEV_APPS_STORAGE_KEY];
  }
  const backupAppKeys = Object.keys(backup.items).filter(isAppStorageKey);
  const keys = [
    ...SEARCH_NEXT_STORAGE_KEYS,
    ...new Set([...listAppStorageKeys(storage), ...backupAppKeys]),
  ];
  applyStorageBackup(backup, keys, storage, options);
};
