import { Button, Typography, message, Flex, Input, Modal, Select } from "antd";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { useRequest } from "ahooks";
import {
  RiApps2Line,
  RiArrowRightSLine,
  RiBrushLine,
  RiCloudLine,
  RiCodeSSlashLine,
  RiDatabase2Line,
  RiDownloadLine,
  RiErrorWarningLine,
  RiGlobalLine,
  RiHardDrive3Line,
  RiInformationLine,
  RiPieChart2Line,
  RiSearchLine,
  RiUploadLine,
} from "@remixicon/react";
import { useNavigate, useParams } from "react-router";
import useAuth from "@/hooks/useAuth";
import {
  APP_LANGUAGE_STORAGE_KEY,
  DESKTOP_LIST_MODIFIED_STORAGE_KEY,
  DESKTOP_LIST_STORAGE_KEY,
  DEV_APPS_STORAGE_KEY,
  DEV_MODE_STORAGE_KEY,
  INSTALLED_APPS_STORAGE_KEY,
  MY_THEMES_STORAGE_KEY,
  MY_WALLPAPERS_STORAGE_KEY,
  NOTICE_READ_IDS_STORAGE_KEY,
  PERSONALIZATION_STORAGE_KEY,
  SEARCH_HISTORY_STORAGE_KEY,
  SEARCH_NEXT_STORAGE_KEYS,
  SEARCH_SELECTED_ENGINES_STORAGE_KEY,
  UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY,
  parseStorageBackup,
  applySearchNextStorageBackup,
  createSearchNextStorageBackup,
  isSearchNextBackupKey,
  stringifyStorageBackup,
  type StorageBackupV1,
} from "@/utils/storage";
import {
  getAppIdFromStorageKey,
  isAppStorageKey,
  parseAppStorageMap,
} from "@/utils/app-storage";
import {
  getUserDataSync,
  putUserDataSync,
  renameUserDataSyncBackup,
  type UserDataSyncInfo,
} from "@/services/user-data";
import {
  MacSettingsChevron,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";
import {
  getSettingsBackupStoragePath,
  settingsRoute,
} from "../../route-paths";
import { resolveAppDisplayName, useI18n } from "@/i18n";
import { useApp } from "@/hooks/useApp";
import AppInfoModal from "@/components/app-info-modal";
import type { AppConfig } from "@/types";

const { Text } = Typography;

const formatBytes = (value?: number | null) => {
  const size = value ?? 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "未同步";
  return new Date(value).toLocaleString();
};

type CloudBackupItem = UserDataSyncInfo["backups"][number];

type StorageIconTone = "blue" | "green" | "orange" | "red" | "purple" | "gray";

type StorageCategoryId =
  | "desktop"
  | "personalization"
  | "apps"
  | "search"
  | "language"
  | "developer"
  | "notice"
  | "metadata"
  | "other";

interface StorageCategoryMeta {
  label: string;
  description: string;
  color: string;
  tone: StorageIconTone;
  icon: ReactNode;
}

interface StorageCategoryUsage extends StorageCategoryMeta {
  id: StorageCategoryId;
  bytes: number;
  percentage: number;
}

interface StorageUsageSummary {
  totalBytes: number;
  dataBytes: number;
  itemCount: number;
  categories: StorageCategoryUsage[];
}

interface AppStorageUsage {
  appId: string;
  bytes: number;
  itemCount: number;
}

interface AppStorageUsageSummary {
  totalBytes: number;
  metadataBytes: number;
  apps: AppStorageUsage[];
}

interface AppStorageDisplayEntry extends AppStorageUsage {
  name: string;
  description: string;
  color: string;
  iconUrl: string | null;
  isDevApp: boolean;
  appConfig?: AppConfig;
}

const APP_STORAGE_COLORS = [
  "#ff9500",
  "#ffcc00",
  "#34c759",
  "#0a84ff",
  "#af52de",
  "#ff3b30",
  "#64d2ff",
];

const getAppStorageColor = (appId: string) => {
  let hash = 0;
  for (const character of appId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return APP_STORAGE_COLORS[hash % APP_STORAGE_COLORS.length];
};

const STORAGE_CATEGORY_ORDER: StorageCategoryId[] = [
  "desktop",
  "personalization",
  "apps",
  "search",
  "language",
  "developer",
  "notice",
  "metadata",
  "other",
];

const STORAGE_CATEGORY_META: Record<StorageCategoryId, StorageCategoryMeta> = {
  desktop: {
    label: "ui.desktopAndLayout",
    description: "ui.backup.desktopDescription",
    color: "#ff3b30",
    tone: "red",
    icon: <RiHardDrive3Line size={16} />,
  },
  personalization: {
    label: "ui.personalization",
    description: "ui.themesWallpapersAndAppearanceSettings",
    color: "#ff9500",
    tone: "orange",
    icon: <RiBrushLine size={16} />,
  },
  apps: {
    label: "ui.app",
    description: "ui.backup.appDescription",
    color: "#ffcc00",
    tone: "orange",
    icon: <RiApps2Line size={16} />,
  },
  search: {
    label: "ui.search",
    description: "ui.backup.searchDescription",
    color: "#34c759",
    tone: "green",
    icon: <RiSearchLine size={16} />,
  },
  language: {
    label: "ui.language",
    description: "ui.interfaceLanguageSetting",
    color: "#0a84ff",
    tone: "blue",
    icon: <RiGlobalLine size={16} />,
  },
  developer: {
    label: "ui.developer",
    description: "ui.developerModeAndLocalAppEntries",
    color: "#af52de",
    tone: "purple",
    icon: <RiCodeSSlashLine size={16} />,
  },
  notice: {
    label: "ui.notifications",
    description: "ui.readNotificationRecords",
    color: "#64d2ff",
    tone: "blue",
    icon: <RiInformationLine size={16} />,
  },
  metadata: {
    label: "ui.backupMetadata",
    description: "ui.backup.metadataDescription",
    color: "#8e8e93",
    tone: "gray",
    icon: <RiDatabase2Line size={16} />,
  },
  other: {
    label: "ui.other",
    description: "ui.uncategorizedDataItems",
    color: "#c7c7cc",
    tone: "gray",
    icon: <RiPieChart2Line size={16} />,
  },
};

const getUtf8ByteSize = (value: string) =>
  new TextEncoder().encode(value).length;

const getBackupEntryByteSize = (key: string, value: string | null) => {
  if (value === null) return 0;
  return getUtf8ByteSize(`${JSON.stringify(key)}:${JSON.stringify(value)}`);
};

const classifyBackupStorageKey = (key: string): StorageCategoryId => {
  if (isAppStorageKey(key)) return "apps";

  switch (key) {
    case DESKTOP_LIST_STORAGE_KEY:
    case DESKTOP_LIST_MODIFIED_STORAGE_KEY:
      return "desktop";
    case PERSONALIZATION_STORAGE_KEY:
    case MY_WALLPAPERS_STORAGE_KEY:
    case MY_THEMES_STORAGE_KEY:
      return "personalization";
    case INSTALLED_APPS_STORAGE_KEY:
      return "apps";
    case UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY:
    case SEARCH_SELECTED_ENGINES_STORAGE_KEY:
    case SEARCH_HISTORY_STORAGE_KEY:
      return "search";
    case APP_LANGUAGE_STORAGE_KEY:
      return "language";
    case DEV_MODE_STORAGE_KEY:
    case DEV_APPS_STORAGE_KEY:
      return "developer";
    case NOTICE_READ_IDS_STORAGE_KEY:
      return "notice";
    default:
      return "other";
  }
};

const analyzeBackupStorage = (
  backup: StorageBackupV1,
  totalBytesOverride?: number | null,
  options?: { includeMetadata?: boolean },
): StorageUsageSummary => {
  const includeMetadata = options?.includeMetadata ?? true;
  const bytesByCategory = new Map<StorageCategoryId, number>();
  const entries = Object.entries(backup.items ?? {});

  for (const [key, value] of entries) {
    const bytes = getBackupEntryByteSize(key, value);
    if (bytes <= 0) continue;
    const category = classifyBackupStorageKey(key);
    bytesByCategory.set(category, (bytesByCategory.get(category) ?? 0) + bytes);
  }

  const dataBytes = [...bytesByCategory.values()].reduce(
    (sum, bytes) => sum + bytes,
    0,
  );
  const payloadBytes = getUtf8ByteSize(JSON.stringify(backup));
  const totalBytes = includeMetadata
    ? Math.max(totalBytesOverride ?? 0, payloadBytes, dataBytes)
    : dataBytes;
  const metadataBytes = includeMetadata
    ? Math.max(0, totalBytes - dataBytes)
    : 0;
  if (metadataBytes > 0) {
    bytesByCategory.set(
      "metadata",
      (bytesByCategory.get("metadata") ?? 0) + metadataBytes,
    );
  }

  return {
    totalBytes,
    dataBytes,
    itemCount: entries.length,
    categories: STORAGE_CATEGORY_ORDER.map((id) => {
      const bytes = bytesByCategory.get(id) ?? 0;
      return {
        id,
        ...STORAGE_CATEGORY_META[id],
        bytes,
        percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
      };
    }).filter((category) => category.bytes > 0),
  };
};

const analyzeAppStorageUsage = (
  backup: StorageBackupV1,
): AppStorageUsageSummary => {
  const usageByApp = new Map<string, AppStorageUsage>();
  let metadataBytes = 0;

  for (const [key, value] of Object.entries(backup.items ?? {})) {
    const bytes = getBackupEntryByteSize(key, value);
    if (bytes <= 0) continue;

    if (key === INSTALLED_APPS_STORAGE_KEY) {
      metadataBytes += bytes;
      continue;
    }

    const appId = getAppIdFromStorageKey(key);
    if (!appId) continue;
    const itemCount = Object.keys(parseAppStorageMap(value)).length;
    const current = usageByApp.get(appId);
    usageByApp.set(appId, {
      appId,
      bytes: (current?.bytes ?? 0) + bytes,
      itemCount: (current?.itemCount ?? 0) + itemCount,
    });
  }

  const apps = [...usageByApp.values()].sort(
    (a, b) => b.bytes - a.bytes || a.appId.localeCompare(b.appId),
  );
  return {
    apps,
    metadataBytes,
    totalBytes:
      metadataBytes + apps.reduce((sum, app) => sum + app.bytes, 0),
  };
};

const StorageUsageOverview = ({
  usage,
}: {
  usage: StorageUsageSummary;
}) => {
  const { t } = useI18n();
  return (
    <section>
      <div className="rounded-[14px] border border-white/80 bg-white/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 truncate text-[13px] font-medium leading-5 text-[#6e6e73] dark:text-[#aeaeb2]">
            {t("ui.categoryCountCategoriesItemCountItems", {
              categoryCount: usage.categories.length,
              itemCount: usage.itemCount,
            })}
          </div>
          <div className="shrink-0 text-right text-[13px] font-semibold text-[#6e6e73] dark:text-[#aeaeb2]">
            {t("ui.sizeUsed", { size: formatBytes(usage.totalBytes) })}
          </div>
        </div>
        <div className="mt-3 flex h-[22px] overflow-hidden rounded-[5px] bg-[#d1d1d6] dark:bg-white/15">
          {usage.categories.length ? (
            usage.categories.map((category) => (
              <div
                key={category.id}
                title={`${t(category.label)} ${formatBytes(category.bytes)}`}
                className="h-full border-r border-white/70 last:border-r-0 dark:border-[#111113]/70"
                style={{
                  flexBasis: 0,
                  flexGrow: category.bytes,
                  backgroundColor: category.color,
                }}
              />
            ))
          ) : (
            <div className="h-full flex-1 bg-[#d1d1d6] dark:bg-white/15" />
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
          {usage.categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6e6e73] dark:text-[#aeaeb2]"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {t(category.label)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

const StorageUsageDetailSection = ({
  usage,
  onOpenApps,
}: {
  usage: StorageUsageSummary;
  onOpenApps?: () => void;
}) => {
  const { t } = useI18n();
  return (
    <MacSettingsSection title={t("ui.usageDetails")}>
      {usage.categories.length ? (
        usage.categories.map((category) => {
          const openCategory =
            category.id === "apps" ? onOpenApps : undefined;
          return (
            <MacSettingsRow
              key={category.id}
              icon={category.icon}
              iconTone={category.tone}
              title={t(category.label)}
              description={t(category.description)}
              onClick={openCategory}
              extra={
                <span className="inline-flex items-center gap-2">
                  <MacSettingsValue>
                    {formatBytes(category.bytes)}
                  </MacSettingsValue>
                  {openCategory ? <MacSettingsChevron /> : null}
                </span>
              }
            />
          );
        })
      ) : (
        <MacSettingsRow
          icon={<RiDatabase2Line size={16} />}
          iconTone="gray"
          title={t("ui.noLocalData")}
          description={t("ui.thereIsNoBackupDataToSummarize")}
        />
      )}
    </MacSettingsSection>
  );
};

const AppStorageUsageOverview = ({
  usage,
  entries,
}: {
  usage: AppStorageUsageSummary;
  entries: AppStorageDisplayEntry[];
}) => {
  const { t } = useI18n();
  const segments = [
    ...entries.map((entry) => ({
      id: entry.appId,
      label: entry.name,
      bytes: entry.bytes,
      color: entry.color,
    })),
    ...(usage.metadataBytes > 0
      ? [
          {
            id: "metadata",
            label: t("ui.appInstallMetadata"),
            bytes: usage.metadataBytes,
            color: "#8e8e93",
          },
        ]
      : []),
  ];

  return (
    <section>
      <div className="rounded-[14px] border border-white/80 bg-white/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 truncate text-[13px] font-medium leading-5 text-[#6e6e73] dark:text-[#aeaeb2]">
            {t("ui.appStorageCount", { count: usage.apps.length })}
          </div>
          <div className="shrink-0 text-right text-[13px] font-semibold text-[#6e6e73] dark:text-[#aeaeb2]">
            {t("ui.sizeUsed", { size: formatBytes(usage.totalBytes) })}
          </div>
        </div>
        <div className="mt-3 flex h-[22px] overflow-hidden rounded-[5px] bg-[#d1d1d6] dark:bg-white/15">
          {segments.length ? (
            segments.map((segment) => (
              <div
                key={segment.id}
                title={`${segment.label} ${formatBytes(segment.bytes)}`}
                className="h-full border-r border-white/70 last:border-r-0 dark:border-[#111113]/70"
                style={{
                  flexBasis: 0,
                  flexGrow: segment.bytes,
                  backgroundColor: segment.color,
                }}
              />
            ))
          ) : (
            <div className="h-full flex-1 bg-[#d1d1d6] dark:bg-white/15" />
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
          {segments.map((segment) => (
            <span
              key={segment.id}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6e6e73] dark:text-[#aeaeb2]"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {segment.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export const AppStorageUsageView = () => {
  const { apps, devApps, getAppIconUrl } = useApp();
  const { t, language } = useI18n();
  const [infoTarget, setInfoTarget] = useState<{
    appId: string;
    appName: string;
    appConfig?: AppConfig;
  } | null>(null);
  const [, setStorageVersion] = useState(0);
  const usage = analyzeAppStorageUsage(createSearchNextStorageBackup());
  const appMap = new Map(apps.map((app) => [app._id, app]));
  const devAppMap = new Map(devApps.map((app) => [app.id, app]));
  const displayEntries: AppStorageDisplayEntry[] = usage.apps.map((entry) => {
    const app = appMap.get(entry.appId);
    const devApp = devAppMap.get(entry.appId);
    const iconUrl = app ? getAppIconUrl(app) : null;
    const name = app
      ? resolveAppDisplayName(app, language)
      : (devApp?.name ?? t("ui.removedApp"));
    const description = app || devApp
      ? t("ui.appStorageItemCount", { count: entry.itemCount })
      : `${entry.appId} · ${t("ui.appStorageItemCount", {
          count: entry.itemCount,
        })}`;
    const snapshot = app?.configSnapshot;
    const appConfig: AppConfig | undefined = app
      ? {
          id: app._id,
          name,
          entry: app.entryUrl ?? app.entryFileName ?? "",
          displayName: snapshot?.displayName ?? app.displayName,
          displayNameI18n:
            snapshot?.displayNameI18n ?? app.displayNameI18n,
          description: snapshot?.description ?? app.description,
          descriptionI18n:
            snapshot?.descriptionI18n ?? app.descriptionI18n,
          version: snapshot?.version ?? app.version,
          author: snapshot?.author ?? app.author,
          appIconUrl: iconUrl,
        }
      : devApp
        ? {
            id: devApp.id,
            name: devApp.name,
            entry: devApp.entry,
          }
        : undefined;

    return {
      ...entry,
      name,
      description,
      color: getAppStorageColor(entry.appId),
      iconUrl,
      isDevApp: Boolean(devApp),
      appConfig,
    };
  });
  const hasDetails = usage.apps.length > 0 || usage.metadataBytes > 0;

  return (
    <>
      <MacSettingsView
        navigationTitle={t("ui.appStorageUsage")}
        showPageHeader={false}
      >
        <AppStorageUsageOverview usage={usage} entries={displayEntries} />

        <MacSettingsSection title={t("ui.appStorageDetails")}>
          {hasDetails ? (
            <>
              {displayEntries.map((entry) => (
                <MacSettingsRow
                  key={entry.appId}
                  icon={
                    entry.iconUrl ? (
                      <img
                        src={entry.iconUrl}
                        alt=""
                        className="h-[30px] w-[30px] rounded-lg object-cover"
                      />
                    ) : entry.isDevApp ? (
                      <RiCodeSSlashLine size={16} />
                    ) : (
                      <RiApps2Line size={16} />
                    )
                  }
                  iconTone={
                    entry.iconUrl
                      ? "gray"
                      : entry.isDevApp
                        ? "purple"
                        : "orange"
                  }
                  title={entry.name}
                  description={entry.description}
                  onClick={() =>
                    setInfoTarget({
                      appId: entry.appId,
                      appName: entry.name,
                      appConfig: entry.appConfig,
                    })
                  }
                  extra={
                    <span className="inline-flex items-center gap-2">
                      <MacSettingsValue>
                        {formatBytes(entry.bytes)}
                      </MacSettingsValue>
                      <MacSettingsChevron />
                    </span>
                  }
                />
              ))}
              {usage.metadataBytes > 0 ? (
                <MacSettingsRow
                  icon={<RiDatabase2Line size={16} />}
                  iconTone="gray"
                  title={t("ui.appInstallMetadata")}
                  description={t("ui.appInstallMetadataDescription")}
                  extra={
                    <MacSettingsValue>
                      {formatBytes(usage.metadataBytes)}
                    </MacSettingsValue>
                  }
                />
              ) : null}
            </>
          ) : (
            <MacSettingsRow
              icon={<RiApps2Line size={16} />}
              iconTone="gray"
              title={t("ui.noAppStorageData")}
              description={t("ui.noAppStorageDataDescription")}
            />
          )}
        </MacSettingsSection>
      </MacSettingsView>
      {infoTarget ? (
        <AppInfoModal
          visible
          onClose={() => setInfoTarget(null)}
          onStorageChanged={() => setStorageVersion((value) => value + 1)}
          appId={infoTarget.appId}
          appName={infoTarget.appName}
          appConfig={infoTarget.appConfig}
        />
      ) : null}
    </>
  );
};

const BackupView = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const modalRootRef = useRef<HTMLDivElement>(null);
  const confirmInSettings = (config: Parameters<typeof Modal.confirm>[0]) =>
    Modal.confirm({
      ...config,
      getContainer: () => modalRootRef.current ?? document.body,
    });

  const {
    data: cloudSync,
    loading: cloudLoading,
    run: refreshCloudSync,
  } = useRequest(getUserDataSync, { manual: true });

  const { loading: uploadLoading, runAsync: uploadCloudSync } = useRequest(
    putUserDataSync,
    {
      manual: true,
      onSuccess: () => {
        message.success(t("ui.syncedToCloud"));
        refreshCloudSync();
      },
    },
  );
  const { loading: renameLoading, runAsync: renameCloudBackup } = useRequest(
    renameUserDataSyncBackup,
    {
      manual: true,
      onSuccess: () => {
        message.success(t("ui.nameUpdated"));
        refreshCloudSync();
      },
    },
  );

  useEffect(() => {
    if (isAuthenticated) refreshCloudSync();
  }, [isAuthenticated, refreshCloudSync]);

  const openCurrentStorageDetail = () => {
    navigate(settingsRoute.path.backupStorage);
  };

  const openCloudStorageDetail = (backup: CloudBackupItem) => {
    navigate(getSettingsBackupStoragePath(backup._id));
  };

  const handleExportData = () => {
    const backup = createSearchNextStorageBackup();
    const text = stringifyStorageBackup(backup);

    const createdAtSafe = backup.createdAt.replace(/[:.]/g, "-");
    const filename = `search-next-backup-${createdAtSafe}.snbak`;

    const blob = new Blob([text], { type: "application/x-search-next-backup" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    message.success(t("ui.backupFileExported"));
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/x-search-next-backup,.snbak";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const backup = parseStorageBackup(text);

        const expectedKeySet = new Set<string>(SEARCH_NEXT_STORAGE_KEYS);
        const backupKeys = Object.keys(backup.items);
        const missingKeys = SEARCH_NEXT_STORAGE_KEYS.filter(
          (k) => !(k in backup.items),
        );
        const extraKeys = backupKeys.filter((k) => {
          if (expectedKeySet.has(k)) return false;
          return !isSearchNextBackupKey(k);
        });
        const isSameFormat = missingKeys.length === 0 && extraKeys.length === 0;
        const originMismatch = Boolean(
          backup.origin && backup.origin !== window.location.origin,
        );

        const confirmImport = (mode: "strict" | "merge") => {
          confirmInSettings({
            title: t("ui.importThisBackup"),
            content: (
              <Flex vertical gap={8}>
                <Text type="secondary">
                  {t("ui.fileNameSizeKB", {
                    name: file.name,
                    size: Math.ceil(file.size / 1024),
                  })}
                </Text>
                <Text type="secondary">
                  {t("ui.backupTimeTime", { time: backup.createdAt })}
                </Text>
                <Text type="danger">
                  {t("ui.backup.importWarning")}
                </Text>
              </Flex>
            ),
            okText: t(mode === "strict" ? "ui.confirmImport" : "ui.forceImport"),
            cancelText: t("ui.cancel"),
            onOk: () => {
              applySearchNextStorageBackup(backup, localStorage, {
                mode,
              });
              message.success(t("ui.importedSuccessfullyRefreshing"));
              window.setTimeout(() => window.location.reload(), 300);
            },
          });
        };

        if (isSameFormat && !originMismatch) {
          confirmImport("strict");
          return;
        }

        confirmInSettings({
          title: t(originMismatch ? "ui.backupOriginMismatch" : "ui.backupFieldsMismatch"),
          content: (
            <Flex vertical gap={8}>
              <Text type="secondary">
                  {t("ui.fileNameSizeKB", {
                    name: file.name,
                    size: Math.ceil(file.size / 1024),
                  })}
                </Text>
              <Text type="secondary">
                {t("ui.backupTimeTime", { time: backup.createdAt })}
              </Text>
              {originMismatch ? (
                <Text type="secondary">
                  {t("ui.backupOriginOriginCurrentPageCurrent", {
                    origin: backup.origin,
                    current: window.location.origin,
                  })}
                </Text>
              ) : (
                <Text type="secondary">
                  {t("ui.missingFieldsMissingExtraFieldsExtra", {
                    missing: missingKeys.length,
                    extra: extraKeys.length,
                  })}
                </Text>
              )}
              <Text type="danger">
                {t(originMismatch
                  ? "ui.backup.originMismatchContinue"
                  : "ui.backup.fieldsMismatchContinue")}
              </Text>
            </Flex>
          ),
          okText: t("ui.continue"),
          cancelText: t("ui.cancel"),
          onOk: () => confirmImport(originMismatch ? "strict" : "merge"),
        });
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        message.error(t("ui.importFailedError", { error: err }));
      } finally {
        input.value = "";
      }
    };
    input.click();
  };

  const showOverwriteTargetPicker = (payload: CloudBackupItem["payload"]) => {
    const backups = cloudSync?.backups ?? [];
    if (!backups.length) return;

    let selectedBackupId: string | undefined;
    confirmInSettings({
      title: t("ui.chooseCloudBackupToOverwrite"),
      content: (
        <Flex vertical gap={8}>
          <Text type="secondary">
            {t("ui.backup.chooseOverwriteDescription")}
          </Text>
          <Select
            placeholder={t("ui.chooseACloudBackupToOverwrite")}
            style={{ width: "100%" }}
            options={backups.map((backup) => ({
              value: backup._id,
              label: backup.name || t("ui.untitledBackup"),
              title: backup.name || t("ui.untitledBackup"),
              backup,
            }))}
            optionRender={({ data }) => {
              const backup = data.backup as CloudBackupItem;
              return (
                <div className="min-w-0 py-1">
                  <div className="truncate text-sm font-semibold">
                    {backup.name || t("ui.untitledBackup")}
                  </div>
                  <div className="mt-0.5 text-xs text-[#6e6e73]">
                    {formatDateTime(backup.lastSyncedAt)} ·{" "}
                    {formatBytes(backup.byteSize)} · {t("ui.countItems", { count: backup.itemCount })}
                  </div>
                </div>
              );
            }}
            onChange={(value) => {
              selectedBackupId = value;
            }}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement ?? modalRootRef.current ?? document.body
            }
          />
        </Flex>
      ),
      okText: t("ui.continue"),
      cancelText: t("ui.cancel"),
      onOk: () => {
        if (!selectedBackupId) {
          message.warning(t("ui.chooseACloudBackupToOverwrite"));
          return Promise.reject();
        }
        const target = backups.find(
          (backup) => backup._id === selectedBackupId,
        );
        if (!target) {
          message.warning(t("ui.selectedCloudBackupNotFound"));
          return Promise.reject();
        }
        handleOverwriteCloud(target, payload);
      },
    });
  };

  const handleUploadCloud = async () => {
    const backup = createSearchNextStorageBackup();
    const backups = cloudSync?.backups ?? [];
    const shouldReplace =
      Boolean(cloudSync?.overLimit) ||
      Boolean(cloudSync && !cloudSync.canCreate && backups.length > 0);

    if (shouldReplace) {
      showOverwriteTargetPicker(backup);
      return;
    }

    let name = t("ui.cloudBackupTime", { time: new Date().toLocaleString() });
    confirmInSettings({
      title: t("ui.uploadToCloud"),
      content: (
        <Flex vertical gap={8}>
          <Text type="secondary">
            {t("ui.backup.uploadCloudDescription", {
              current: cloudSync?.versionCount ?? 0,
              max: cloudSync?.maxSyncBackups ?? 1,
            })}
          </Text>
          <Input
            defaultValue={name}
            maxLength={100}
            placeholder={t("ui.enterABackupName")}
            onChange={(event) => {
              name = event.target.value;
            }}
          />
        </Flex>
      ),
      okText: t("ui.upload"),
      cancelText: t("ui.cancel"),
      onOk: () => uploadCloudSync({ payload: backup, name }),
    });
  };

  const handleRestoreCloud = (backup: CloudBackupItem) => {
    confirmInSettings({
      title: t("ui.restoreFromCloud"),
      content: (
        <Flex vertical gap={8}>
          <Text type="secondary">
            {t("ui.versionName", { name: backup.name || t("ui.untitledBackup") })}
          </Text>
          <Text type="secondary">
            {t("ui.syncTimeTimeSizeSize", {
              time: formatDateTime(backup.lastSyncedAt),
              size: formatBytes(backup.byteSize),
            })}
          </Text>
          <Text type="danger">
            {t("ui.backup.restoreWarning")}
          </Text>
        </Flex>
      ),
      okText: t("ui.confirmRestore"),
      cancelText: t("ui.cancel"),
      onOk: () => {
        const payload = backup.payload;
        if (!payload) {
          message.warning(t("ui.selectedCloudBackupVersionNotFound"));
          return;
        }
        applySearchNextStorageBackup(payload, localStorage, { mode: "strict" });
        message.success(t("ui.restoredSuccessfullyRefreshing"));
        window.setTimeout(() => window.location.reload(), 300);
      },
    });
  };

  const handleOverwriteCloud = (
    target: CloudBackupItem,
    payload = createSearchNextStorageBackup(),
  ) => {
    confirmInSettings({
      title: t("ui.overwriteCloudBackup"),
      content: (
        <Flex vertical gap={8}>
          <Text type="secondary">
            {t("ui.targetVersionName", { name: target.name || t("ui.untitledBackup") })}
          </Text>
          <Text type="secondary">
            {t("ui.originalSyncTimeTime", {
              time: formatDateTime(target.lastSyncedAt),
            })}
          </Text>
          <Text type="danger">
            {t("ui.backup.overwriteCloudWarning")}
          </Text>
        </Flex>
      ),
      okText: t("ui.confirmOverwrite"),
      cancelText: t("ui.cancel"),
      onOk: () =>
        uploadCloudSync({
          payload,
          backupId: target._id,
          name: target.name || undefined,
        }),
    });
  };

  const handleRenameCloud = (backup: CloudBackupItem) => {
    let nextName = backup.name || "";
    confirmInSettings({
      title: t("ui.setBackupName"),
      content: (
        <Input
          defaultValue={nextName}
          maxLength={100}
          placeholder={t("ui.enterABackupName")}
          onChange={(event) => {
            nextName = event.target.value;
          }}
        />
      ),
      okText: t("ui.save"),
      cancelText: t("ui.cancel"),
      onOk: () => {
        const trimmed = nextName.trim();
        if (!trimmed) {
          message.warning(t("ui.enterABackupName"));
          return Promise.reject();
        }
        return renameCloudBackup(backup._id, trimmed);
      },
    });
  };

  const handleCloudBackupKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    backup: CloudBackupItem,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openCloudStorageDetail(backup);
  };

  const renderCurrentStorageSection = () => {
    const currentBackup = createSearchNextStorageBackup();
    const usage = analyzeBackupStorage(currentBackup, null, {
      includeMetadata: false,
    });

    return (
      <MacSettingsSection title={t("ui.storage")}>
        <MacSettingsRow
          icon={<RiHardDrive3Line size={16} />}
          iconTone="blue"
          title={t("ui.currentDataUsage")}
          description={t("ui.backup.storageUsageDescription")}
          extra={
            <span className="inline-flex items-center gap-2">
              <MacSettingsValue>{formatBytes(usage.totalBytes)}</MacSettingsValue>
              <MacSettingsChevron />
            </span>
          }
          onClick={openCurrentStorageDetail}
        />
      </MacSettingsSection>
    );
  };

  const renderCloudBackupList = () => {
    const backups = cloudSync?.backups ?? [];

    if (cloudLoading) {
      return (
        <section>
          <div className="mb-2 ml-1 text-[13px] font-bold text-[#6e6e73]">
            {t("ui.cloudBackupList")}
          </div>
          <div className="rounded-xl border border-[rgba(60,60,67,0.12)] bg-white/70 px-4 py-5 text-sm text-[#6e6e73]">
            {t("ui.readingCloudBackups")}
          </div>
        </section>
      );
    }

    if (!backups.length) {
      return (
        <section>
          <div className="mb-2 ml-1 text-[13px] font-bold text-[#6e6e73]">
            {t("ui.cloudBackupList")}
          </div>
          <div className="rounded-xl border border-dashed border-[rgba(60,60,67,0.18)] bg-white/50 px-4 py-5 text-sm text-[#6e6e73]">
            {t("ui.backup.emptyCloudBackups")}
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="mb-2 ml-1 flex items-center justify-between gap-3 text-[13px] font-bold text-[#6e6e73]">
          <span>{t("ui.cloudBackupList")}</span>
          <span className="font-semibold">
            {cloudSync?.versionCount ?? backups.length}/
            {cloudSync?.maxSyncBackups ?? backups.length}
          </span>
        </div>
        <div className="grid gap-2">
          {backups.map((backup) => (
            <div
              key={backup._id}
              role="button"
              tabIndex={0}
              onClick={() => openCloudStorageDetail(backup)}
              onKeyDown={(event) => handleCloudBackupKeyDown(event, backup)}
              className="grid min-h-[68px] cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-[rgba(60,60,67,0.12)] bg-white/75 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.035)] backdrop-blur-xl transition hover:bg-white max-[640px]:grid-cols-1"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[#1d1d1f]">
                  {backup.name || t("ui.untitledBackup")}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-[18px] text-[#6e6e73]">
                  <span>{formatDateTime(backup.lastSyncedAt)}</span>
                  <span>{formatBytes(backup.byteSize)}</span>
                  <span>{t("ui.countItems", { count: backup.itemCount })}</span>
                </div>
              </div>
              <Flex gap={8} wrap="wrap" justify="flex-end">
                <Button
                  size="small"
                  loading={renameLoading}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRenameCloud(backup);
                  }}
                >
                  {t("ui.rename")}
                </Button>
                <Button
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRestoreCloud(backup);
                  }}
                >
                  {t("ui.restore")}
                </Button>
                <Button
                  size="small"
                  danger
                  loading={uploadLoading}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOverwriteCloud(backup);
                  }}
                >
                  {t("ui.overwrite")}
                </Button>
                <span className="grid h-6 w-5 shrink-0 place-items-center text-[#b0b0b4]">
                  <RiArrowRightSLine size={20} />
                </span>
              </Flex>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderLocalBackupSection = () => (
    <MacSettingsSection title={t("ui.localBackup")}>
      <MacSettingsRow
        icon={<RiDownloadLine size={16} />}
        iconTone="orange"
        title={t("ui.exportData")}
        description={t("ui.saveAsASnbakBackupFile")}
        extra={
          <Button size="small" onClick={handleExportData}>
            {t("ui.export")}
          </Button>
        }
      />
      <MacSettingsRow
        icon={<RiUploadLine size={16} />}
        iconTone="purple"
        title={t("ui.importData")}
        description={t("ui.backup.importDescription")}
        extra={
          <Button size="small" onClick={handleImportData}>
            {t("ui.import")}
          </Button>
        }
      />
      <MacSettingsRow
        icon={<RiErrorWarningLine size={16} />}
        iconTone="orange"
        title={t("ui.exportCurrentDataBeforeImporting")}
        description={t("ui.backup.importOverwriteNotice")}
      />
    </MacSettingsSection>
  );

  const renderUnloggedView = () => (
    <>
      {renderCurrentStorageSection()}
      {renderLocalBackupSection()}
    </>
  );

  const renderLoggedView = () => (
    <>
      {renderCurrentStorageSection()}
      <MacSettingsSection title={t("ui.cloudSync")}>
        <MacSettingsRow
          icon={<RiCloudLine size={16} />}
          iconTone="green"
          title={t("ui.syncStatus")}
          description={
            cloudSync?.hasSynced
              ? t("ui.lastSyncedTimeVersionCurrentMax", {
                  time: formatDateTime(cloudSync.lastSyncedAt),
                  current: cloudSync.versionCount,
                  max: cloudSync.maxSyncBackups,
                })
              : t("ui.thisAccountHasNoCloudSyncDataYet")
          }
          extra={
            <MacSettingsValue>
              {cloudLoading ? t("ui.loading2") : formatBytes(cloudSync?.byteSize)}
            </MacSettingsValue>
          }
        />
        {cloudSync?.overLimit ? (
          <MacSettingsRow
            icon={<RiErrorWarningLine size={16} />}
            iconTone="orange"
            title={t("ui.backup.limitExceeded")}
            description={t("ui.backup.limitExceededDescription", {
              current: cloudSync.versionCount,
              max: cloudSync.maxSyncBackups,
            })}
          />
        ) : null}
        <MacSettingsRow
          icon={<RiUploadLine size={16} />}
          iconTone="blue"
          title={t("ui.uploadCloudBackup")}
          description={t("ui.backup.cloudUploadHint")}
          extra={
            <Button
              size="small"
              loading={uploadLoading}
              onClick={handleUploadCloud}
            >
              {t("ui.upload")}
            </Button>
          }
        />
      </MacSettingsSection>
      {renderCloudBackupList()}
      {renderLocalBackupSection()}
    </>
  );

  return (
    <div ref={modalRootRef} className="h-full">
      <MacSettingsView>
        {isAuthenticated ? renderLoggedView() : renderUnloggedView()}
      </MacSettingsView>
    </div>
  );
};

export const StorageUsageView = () => {
  const navigate = useNavigate();
  const { backupId } = useParams<{ backupId?: string }>();
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const isCloudBackup = Boolean(backupId);

  const {
    data: cloudSync,
    loading: cloudLoading,
    run: refreshCloudSync,
  } = useRequest(getUserDataSync, { manual: true });

  useEffect(() => {
    if (isCloudBackup && isAuthenticated) refreshCloudSync();
  }, [isAuthenticated, isCloudBackup, refreshCloudSync]);

  const cloudBackup = isCloudBackup
    ? (cloudSync?.backups ?? []).find((backup) => backup._id === backupId)
    : null;
  const backup = cloudBackup?.payload ?? createSearchNextStorageBackup();
  const cloudBackupName = cloudBackup?.name || t("ui.untitledBackup");
  const storageNavigationTitle = cloudBackup
    ? cloudBackupName
    : t("ui.currentStorageUsage");
  const usage = analyzeBackupStorage(
    backup,
    cloudBackup ? cloudBackup.byteSize : null,
    { includeMetadata: Boolean(cloudBackup) },
  );

  if (isCloudBackup && (cloudLoading || !cloudSync)) {
    return (
      <MacSettingsView navigationTitle={t("ui.storage")} showPageHeader={false}>
        <MacSettingsSection title={t("ui.cloudBackup")}>
          <MacSettingsRow
            icon={<RiCloudLine size={16} />}
            iconTone="gray"
            title={t("ui.reading")}
            description={t("ui.backup.storageLoadingDescription")}
          />
        </MacSettingsSection>
      </MacSettingsView>
    );
  }

  if (isCloudBackup && !cloudBackup) {
    return (
      <MacSettingsView navigationTitle={t("ui.storage")} showPageHeader={false}>
        <MacSettingsSection title={t("ui.cloudBackup")}>
          <MacSettingsRow
            icon={<RiErrorWarningLine size={16} />}
            iconTone="orange"
            title={t("ui.cloudBackupNotFound")}
            description={t("ui.backup.notFoundDescription")}
          />
        </MacSettingsSection>
      </MacSettingsView>
    );
  }

  return (
    <MacSettingsView
      navigationTitle={storageNavigationTitle}
      showPageHeader={false}
    >
      <StorageUsageOverview usage={usage} />
      <StorageUsageDetailSection
        usage={usage}
        onOpenApps={
          isCloudBackup
            ? undefined
            : () => navigate(settingsRoute.path.backupStorageApps)
        }
      />
    </MacSettingsView>
  );
};

export default BackupView;
