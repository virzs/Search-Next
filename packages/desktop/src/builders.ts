import type {
  DesktopAppConfig,
  DesktopAppSource,
  DesktopAppSourceConfigSnapshot,
  DesktopItemData,
  DesktopSortItem,
  LocalizedStringList,
  LocalizedText,
  ResolveDesktopAssetUrl,
} from "./types";

const getWindowOrigin = () =>
  typeof window === "undefined" ? "http://localhost" : window.location.origin;

const withAppVersionToken = (url: string, app: DesktopAppSource) => {
  const snapshot = app.configSnapshot as
    | DesktopAppSourceConfigSnapshot
    | undefined;
  const token = [app.packageName, snapshot?.version, app.version, app.updatedAt]
    .filter((item) => typeof item === "string" && item)
    .join(":");
  if (!token) return url;

  try {
    const nextUrl = new URL(url, getWindowOrigin());
    nextUrl.searchParams.set("snAppVersion", token);
    return nextUrl.href;
  } catch {
    return url;
  }
};

export const buildAppEntryUrl = (
  app: DesktopAppSource,
  resolveAssetUrl: ResolveDesktopAssetUrl,
  options?: { includeVersionToken?: boolean },
): string | null => {
  const snapshot = app.configSnapshot as
    | DesktopAppSourceConfigSnapshot
    | undefined;
  const rawEntry = app.entryUrl || snapshot?.entryUrl;
  if (rawEntry) {
    const url = resolveAssetUrl(rawEntry);
    return options?.includeVersionToken === false
      ? url
      : withAppVersionToken(url, app);
  }

  if (!app.entryFileName) return null;

  const matchedFile = app.files?.find(
    (file) => file.name === app.entryFileName && file.url,
  );
  if (matchedFile?.url) {
    const url = resolveAssetUrl(matchedFile.url);
    return options?.includeVersionToken === false
      ? url
      : withAppVersionToken(url, app);
  }

  if (app.dir) {
    const url = resolveAssetUrl(`/uploads/${app.dir}/${app.entryFileName}`);
    return options?.includeVersionToken === false
      ? url
      : withAppVersionToken(url, app);
  }

  return null;
};

const getSnappAppIconUrlFromEntry = (
  app: DesktopAppSource,
  resolveAssetUrl: ResolveDesktopAssetUrl,
) => {
  if (app.sourceType !== "snapp") return null;

  const snapshot = app.configSnapshot as
    | DesktopAppSourceConfigSnapshot
    | undefined;
  const appIcon = snapshot?.appIcon || app.appIcon;
  if (appIcon?.type === "custom") return null;
  const src =
    appIcon?.type === "image" && appIcon.src ? appIcon.src : "icon.svg";

  if (
    /^https?:\/\//i.test(src) ||
    src.startsWith("//") ||
    src.startsWith("/")
  ) {
    return resolveAssetUrl(src);
  }

  const entryUrl = buildAppEntryUrl(app, resolveAssetUrl);
  if (!entryUrl) return null;

  try {
    const url = new URL(src, entryUrl);
    url.search = "";
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
};

export const getAppIconUrl = (
  app: DesktopAppSource,
  resolveAssetUrl: ResolveDesktopAssetUrl,
): string | null => {
  const snapshot = app.configSnapshot as
    | DesktopAppSourceConfigSnapshot
    | undefined;
  const appIcon = snapshot?.appIcon || app.appIcon;
  if (appIcon?.type === "custom") return null;

  const entryIconUrl = getSnappAppIconUrlFromEntry(app, resolveAssetUrl);
  if (entryIconUrl) return entryIconUrl;

  const url =
    app.appIconUrl ||
    (typeof snapshot?.appIconUrl === "string"
      ? snapshot.appIconUrl
      : undefined) ||
    app.iconUrl ||
    app.icon?.url;
  if (!url || typeof url !== "string") return null;
  return resolveAssetUrl(url);
};

const getAppId = (app: DesktopAppSource, fallbackId?: string) =>
  fallbackId || app._id || app.id || "";

const buildAppConfig = (
  app: DesktopAppSource,
  options: {
    appId?: string;
    name?: string;
    entry?: string | null;
    description?: string;
    displayName?: string;
    displayNameI18n?: LocalizedText;
    descriptionI18n?: LocalizedText;
    tags?: string[];
    tagsI18n?: LocalizedStringList;
    sizeId?: string;
    appIconUrl?: string | null;
    resolveAssetUrl: ResolveDesktopAssetUrl;
  },
): DesktopAppConfig | null => {
  const snapshot = app.configSnapshot as
    | DesktopAppSourceConfigSnapshot
    | undefined;
  const appId = getAppId(app, options.appId);
  const name = options.name || snapshot?.name || app.name || appId;
  const entry = options.entry ?? buildAppEntryUrl(app, options.resolveAssetUrl);
  if (!appId || !entry) return null;

  return {
    id: appId,
    name,
    entry,
    props: { title: name },
    displayName:
      options.displayName ?? snapshot?.displayName ?? app.displayName,
    displayNameI18n:
      options.displayNameI18n ??
      snapshot?.displayNameI18n ??
      app.displayNameI18n,
    settingsSchema: snapshot?.settingsSchema || app.settingsSchema,
    sizeConfigs: snapshot?.sizeConfigs?.length
      ? snapshot.sizeConfigs
      : app.sizeConfigs,
    defaultSizeId:
      options.sizeId || snapshot?.defaultSizeId || app.defaultSizeId || "2x2",
    pagePaths: snapshot?.pagePaths ?? app.pagePaths,
    supportAppMode: Boolean(snapshot?.supportAppMode ?? app.supportAppMode),
    appIcon: snapshot?.appIcon ?? app.appIcon,
    appIconUrl:
      options.appIconUrl ?? getAppIconUrl(app, options.resolveAssetUrl),
    sourceType: app.sourceType,
    version: snapshot?.version ?? app.version,
    author: snapshot?.author ?? app.author,
    description:
      options.description ?? snapshot?.description ?? app.description,
    descriptionI18n:
      options.descriptionI18n ??
      snapshot?.descriptionI18n ??
      app.descriptionI18n,
    tags: options.tags ?? snapshot?.tags ?? app.tags,
    tagsI18n: options.tagsI18n ?? snapshot?.tagsI18n ?? app.tagsI18n,
  };
};

export const buildAppLauncherDesktopItem = (
  app: DesktopAppSource,
  options: {
    instanceId: string | number;
    appId?: string;
    name?: string;
    description?: string;
    displayName?: string;
    displayNameI18n?: LocalizedText;
    descriptionI18n?: LocalizedText;
    tags?: string[];
    tagsI18n?: LocalizedStringList;
    resolveAssetUrl: ResolveDesktopAssetUrl;
  },
): DesktopSortItem<DesktopItemData> | null => {
  const appIconUrl = getAppIconUrl(app, options.resolveAssetUrl);
  const appConfig = buildAppConfig(app, { ...options, appIconUrl });
  if (!appConfig) return null;

  return {
    id: options.instanceId,
    type: "app",
    dataType: `app-launcher:${appConfig.id}`,
    data: {
      name: appConfig.name,
      ...(appIconUrl ? { icon: appIconUrl } : {}),
      appConfig,
    },
  };
};

export const buildSizedAppDesktopItem = (
  app: DesktopAppSource,
  options: {
    instanceId: string | number;
    appId?: string;
    name?: string;
    description?: string;
    displayName?: string;
    displayNameI18n?: LocalizedText;
    descriptionI18n?: LocalizedText;
    tags?: string[];
    tagsI18n?: LocalizedStringList;
    sizeId?: string;
    resolveAssetUrl: ResolveDesktopAssetUrl;
  },
): DesktopSortItem<DesktopItemData> | null => {
  const appConfig = buildAppConfig(app, options);
  if (!appConfig) return null;
  const appType = `app:${appConfig.id}`;

  return {
    id: options.instanceId,
    type: appType,
    dataType: appType,
    config: options.sizeId ? { sizeId: options.sizeId } : undefined,
    data: {
      name: appConfig.name,
      appConfig,
    },
  };
};

export const buildWebsiteDesktopItem = (options: {
  id: string | number;
  name: string;
  url: string;
  icon?: string | null;
  iconColor?: string;
}): DesktopSortItem<DesktopItemData> => ({
  id: options.id,
  type: "app",
  data: {
    name: options.name,
    ...(options.icon ? { icon: options.icon } : {}),
    ...(options.iconColor ? { iconColor: options.iconColor } : {}),
    url: options.url,
  },
});
