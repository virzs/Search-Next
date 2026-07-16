export const settingsRoute = {
  segment: {
    root: "settings",
    account: "account",
    personalization: "personalization",
    search: "search",
    thirdParty: "third-party",
    language: "language",
    backup: "backup",
    backupStorage: "backup/storage",
    backupStorageApps: "backup/storage/apps",
    backupStorageDetail: "backup/storage/:backupId",
    about: "about",
    developer: "developer",
    wildcard: "*",
  },
  path: {
    root: "/settings",
    account: "/settings/account",
    personalization: "/settings/personalization",
    search: "/settings/search",
    thirdParty: "/settings/third-party",
    language: "/settings/language",
    backup: "/settings/backup",
    backupStorage: "/settings/backup/storage",
    backupStorageApps: "/settings/backup/storage/apps",
    about: "/settings/about",
    developer: "/settings/developer",
  },
} as const;

export const getSettingsBackupStoragePath = (backupId?: string) =>
  backupId
    ? `${settingsRoute.path.backupStorage}/${backupId}`
    : settingsRoute.path.backupStorage;
