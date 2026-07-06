export const APP_STORAGE_KEY_PREFIX = "SEARCH_NEXT_APP_STORAGE:";

const LEGACY_APP_STORAGE_KEY_PREFIX = "SEARCH_NEXT_WIDGET_STORAGE:";
const LEGACY_INLINE_APP_STORAGE_PREFIXES = ["widget:", "app:"];

export const getAppStorageKey = (appId: string) =>
  `${APP_STORAGE_KEY_PREFIX}${appId}`;

export const isAppStorageKey = (key: string) =>
  key.startsWith(APP_STORAGE_KEY_PREFIX);

const safeParseMap = (raw: string | null): Record<string, string> => {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([, value]) => typeof value === "string")
        .map(([key, value]) => [key, value as string]),
    );
  } catch {
    return {};
  }
};

const writeAppStorageMap = (
  appId: string,
  values: Record<string, string>,
  storage: Storage = localStorage,
) => {
  const storageKey = getAppStorageKey(appId);
  if (Object.keys(values).length) {
    storage.setItem(storageKey, JSON.stringify(values));
  } else {
    storage.removeItem(storageKey);
  }
};

const getUtf8ByteSize = (value: string) => new TextEncoder().encode(value).length;

export const migrateLegacyAppStorage = (
  appId: string,
  storage: Storage = localStorage,
) => {
  const legacyKeys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (
      key &&
      LEGACY_INLINE_APP_STORAGE_PREFIXES.some((prefix) =>
        key.startsWith(`${prefix}${appId}:`),
      )
    ) {
      legacyKeys.push(key);
    }
  }

  const oldMapKey = `${LEGACY_APP_STORAGE_KEY_PREFIX}${appId}`;
  const hasOldMap = storage.getItem(oldMapKey) !== null;

  if (!legacyKeys.length && !hasOldMap) return;

  const values = {
    ...safeParseMap(storage.getItem(oldMapKey)),
    ...safeParseMap(storage.getItem(getAppStorageKey(appId))),
  };
  for (const key of legacyKeys) {
    const matchedPrefix = LEGACY_INLINE_APP_STORAGE_PREFIXES.find((prefix) =>
      key.startsWith(`${prefix}${appId}:`),
    );
    if (!matchedPrefix) continue;
    const fieldKey = key.slice(`${matchedPrefix}${appId}:`.length);
    if (!fieldKey) continue;
    const value = storage.getItem(key);
    if (value !== null) values[fieldKey] = value;
  }

  writeAppStorageMap(appId, values, storage);
  storage.removeItem(oldMapKey);
  legacyKeys.forEach((key) => storage.removeItem(key));
};

export const migrateAllLegacyAppStorage = (
  storage: Storage = localStorage,
) => {
  const appIds = new Set<string>();
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;
    if (key.startsWith(LEGACY_APP_STORAGE_KEY_PREFIX)) {
      const appId = key.slice(LEGACY_APP_STORAGE_KEY_PREFIX.length);
      if (appId) appIds.add(appId);
      continue;
    }
    const matchedPrefix = LEGACY_INLINE_APP_STORAGE_PREFIXES.find((prefix) =>
      key.startsWith(prefix),
    );
    if (!matchedPrefix) continue;
    const rest = key.slice(matchedPrefix.length);
    const separatorIndex = rest.indexOf(":");
    if (separatorIndex > 0) appIds.add(rest.slice(0, separatorIndex));
  }

  appIds.forEach((appId) => migrateLegacyAppStorage(appId, storage));
};

export const listAppStorageKeys = (storage: Storage = localStorage) => {
  migrateAllLegacyAppStorage(storage);

  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isAppStorageKey(key)) keys.push(key);
  }
  return keys.sort();
};

export const readAppStorageMap = (
  appId: string,
  storage: Storage = localStorage,
) => {
  migrateLegacyAppStorage(appId, storage);
  return safeParseMap(storage.getItem(getAppStorageKey(appId)));
};

export const getAppStorageStats = (
  appId: string,
  storage: Storage = localStorage,
) => {
  const values = readAppStorageMap(appId, storage);
  const serialized = JSON.stringify(values);
  const valueBytes = Object.values(values).reduce(
    (sum, value) => sum + getUtf8ByteSize(value),
    0,
  );
  return {
    key: getAppStorageKey(appId),
    keyCount: Object.keys(values).length,
    byteSize: getUtf8ByteSize(serialized),
    valueBytes,
    values,
  };
};

export const formatAppStorageSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const clearAppStorage = (
  appId: string,
  storage: Storage = localStorage,
) => {
  migrateLegacyAppStorage(appId, storage);
  const values = readAppStorageMap(appId, storage);
  storage.removeItem(getAppStorageKey(appId));
  return Object.keys(values);
};

export const getAppStorageItem = (
  appId: string,
  key: string,
  storage: Storage = localStorage,
) => {
  const values = readAppStorageMap(appId, storage);
  return values[key] ?? null;
};

export const setAppStorageItem = (
  appId: string,
  key: string,
  value: string,
  storage: Storage = localStorage,
) => {
  const values = readAppStorageMap(appId, storage);
  values[key] = value;
  writeAppStorageMap(appId, values, storage);
};

export const removeAppStorageItem = (
  appId: string,
  key: string,
  storage: Storage = localStorage,
) => {
  const values = readAppStorageMap(appId, storage);
  delete values[key];
  writeAppStorageMap(appId, values, storage);
};
