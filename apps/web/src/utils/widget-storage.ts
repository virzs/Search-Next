export const WIDGET_STORAGE_KEY_PREFIX = "SEARCH_NEXT_WIDGET_STORAGE:";

const LEGACY_WIDGET_STORAGE_PREFIX = "widget:";

export const getWidgetStorageKey = (widgetId: string) =>
  `${WIDGET_STORAGE_KEY_PREFIX}${widgetId}`;

export const isWidgetStorageKey = (key: string) =>
  key.startsWith(WIDGET_STORAGE_KEY_PREFIX);

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

const writeWidgetStorageMap = (
  widgetId: string,
  values: Record<string, string>,
  storage: Storage = localStorage,
) => {
  const storageKey = getWidgetStorageKey(widgetId);
  if (Object.keys(values).length) {
    storage.setItem(storageKey, JSON.stringify(values));
  } else {
    storage.removeItem(storageKey);
  }
};

const getUtf8ByteSize = (value: string) => new TextEncoder().encode(value).length;

export const migrateLegacyWidgetStorage = (
  widgetId: string,
  storage: Storage = localStorage,
) => {
  const legacyPrefix = `${LEGACY_WIDGET_STORAGE_PREFIX}${widgetId}:`;
  const legacyKeys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(legacyPrefix)) legacyKeys.push(key);
  }

  if (!legacyKeys.length) return;

  const values = safeParseMap(storage.getItem(getWidgetStorageKey(widgetId)));
  for (const key of legacyKeys) {
    const fieldKey = key.slice(legacyPrefix.length);
    if (!fieldKey) continue;
    const value = storage.getItem(key);
    if (value !== null) values[fieldKey] = value;
  }

  writeWidgetStorageMap(widgetId, values, storage);
  legacyKeys.forEach((key) => storage.removeItem(key));
};

export const migrateAllLegacyWidgetStorage = (
  storage: Storage = localStorage,
) => {
  const widgetIds = new Set<string>();
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(LEGACY_WIDGET_STORAGE_PREFIX)) continue;
    const rest = key.slice(LEGACY_WIDGET_STORAGE_PREFIX.length);
    const separatorIndex = rest.indexOf(":");
    if (separatorIndex <= 0) continue;
    widgetIds.add(rest.slice(0, separatorIndex));
  }

  widgetIds.forEach((widgetId) => migrateLegacyWidgetStorage(widgetId, storage));
};

export const listWidgetStorageKeys = (storage: Storage = localStorage) => {
  migrateAllLegacyWidgetStorage(storage);

  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isWidgetStorageKey(key)) keys.push(key);
  }
  return keys.sort();
};

export const readWidgetStorageMap = (
  widgetId: string,
  storage: Storage = localStorage,
) => {
  migrateLegacyWidgetStorage(widgetId, storage);
  return safeParseMap(storage.getItem(getWidgetStorageKey(widgetId)));
};

export const getWidgetStorageStats = (
  widgetId: string,
  storage: Storage = localStorage,
) => {
  const values = readWidgetStorageMap(widgetId, storage);
  const serialized = JSON.stringify(values);
  const valueBytes = Object.values(values).reduce(
    (sum, value) => sum + getUtf8ByteSize(value),
    0,
  );
  return {
    key: getWidgetStorageKey(widgetId),
    keyCount: Object.keys(values).length,
    byteSize: getUtf8ByteSize(serialized),
    valueBytes,
    values,
  };
};

export const formatWidgetStorageSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const clearWidgetStorage = (
  widgetId: string,
  storage: Storage = localStorage,
) => {
  migrateLegacyWidgetStorage(widgetId, storage);
  const values = readWidgetStorageMap(widgetId, storage);
  storage.removeItem(getWidgetStorageKey(widgetId));
  return Object.keys(values);
};

export const getWidgetStorageItem = (
  widgetId: string,
  key: string,
  storage: Storage = localStorage,
) => {
  const values = readWidgetStorageMap(widgetId, storage);
  return values[key] ?? null;
};

export const setWidgetStorageItem = (
  widgetId: string,
  key: string,
  value: string,
  storage: Storage = localStorage,
) => {
  const values = readWidgetStorageMap(widgetId, storage);
  values[key] = value;
  writeWidgetStorageMap(widgetId, values, storage);
};

export const removeWidgetStorageItem = (
  widgetId: string,
  key: string,
  storage: Storage = localStorage,
) => {
  const values = readWidgetStorageMap(widgetId, storage);
  delete values[key];
  writeWidgetStorageMap(widgetId, values, storage);
};
