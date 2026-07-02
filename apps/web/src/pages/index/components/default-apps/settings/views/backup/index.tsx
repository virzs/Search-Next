import { Button, Typography, message, Flex, Input, Modal, Select } from "antd";
import { useEffect, useRef } from "react";
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
  DEV_MODE_STORAGE_KEY,
  DEV_WIDGETS_STORAGE_KEY,
  INSTALLED_WIDGETS_STORAGE_KEY,
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
import { isWidgetStorageKey } from "@/utils/widget-storage";
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
  | "widgets"
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

const STORAGE_CATEGORY_ORDER: StorageCategoryId[] = [
  "desktop",
  "personalization",
  "widgets",
  "search",
  "language",
  "developer",
  "notice",
  "metadata",
  "other",
];

const STORAGE_CATEGORY_META: Record<StorageCategoryId, StorageCategoryMeta> = {
  desktop: {
    label: "桌面与布局",
    description: "桌面页面、图标布局和已修改标记",
    color: "#ff3b30",
    tone: "red",
    icon: <RiHardDrive3Line size={16} />,
  },
  personalization: {
    label: "个性化",
    description: "主题、壁纸和外观配置",
    color: "#ff9500",
    tone: "orange",
    icon: <RiBrushLine size={16} />,
  },
  widgets: {
    label: "小组件",
    description: "已安装小组件和小组件私有存储",
    color: "#ffcc00",
    tone: "orange",
    icon: <RiApps2Line size={16} />,
  },
  search: {
    label: "搜索",
    description: "搜索偏好、搜索引擎和最近使用",
    color: "#34c759",
    tone: "green",
    icon: <RiSearchLine size={16} />,
  },
  language: {
    label: "语言",
    description: "界面语言设置",
    color: "#0a84ff",
    tone: "blue",
    icon: <RiGlobalLine size={16} />,
  },
  developer: {
    label: "开发者",
    description: "开发者模式和本地小组件入口",
    color: "#af52de",
    tone: "purple",
    icon: <RiCodeSSlashLine size={16} />,
  },
  notice: {
    label: "通知",
    description: "已读通知记录",
    color: "#64d2ff",
    tone: "blue",
    icon: <RiInformationLine size={16} />,
  },
  metadata: {
    label: "备份元数据",
    description: "备份版本、时间、来源和结构开销",
    color: "#8e8e93",
    tone: "gray",
    icon: <RiDatabase2Line size={16} />,
  },
  other: {
    label: "其他",
    description: "未归类的数据项",
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
  if (isWidgetStorageKey(key)) return "widgets";

  switch (key) {
    case DESKTOP_LIST_STORAGE_KEY:
    case DESKTOP_LIST_MODIFIED_STORAGE_KEY:
      return "desktop";
    case PERSONALIZATION_STORAGE_KEY:
    case MY_WALLPAPERS_STORAGE_KEY:
    case MY_THEMES_STORAGE_KEY:
      return "personalization";
    case INSTALLED_WIDGETS_STORAGE_KEY:
      return "widgets";
    case UNIFIED_SEARCH_PREFERENCES_STORAGE_KEY:
    case SEARCH_SELECTED_ENGINES_STORAGE_KEY:
    case SEARCH_HISTORY_STORAGE_KEY:
      return "search";
    case APP_LANGUAGE_STORAGE_KEY:
      return "language";
    case DEV_MODE_STORAGE_KEY:
    case DEV_WIDGETS_STORAGE_KEY:
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

const getStorageUsageLabel = (usage: StorageUsageSummary) =>
  `${usage.categories.length} 类数据，${usage.itemCount} 项数据`;

const StorageUsageOverview = ({
  usage,
}: {
  usage: StorageUsageSummary;
}) => (
  <section>
    <div className="rounded-[14px] border border-white/80 bg-white/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 truncate text-[13px] font-medium leading-5 text-[#6e6e73] dark:text-[#aeaeb2]">
          {getStorageUsageLabel(usage)}
        </div>
        <div className="shrink-0 text-right text-[13px] font-semibold text-[#6e6e73] dark:text-[#aeaeb2]">
          已使用 {formatBytes(usage.totalBytes)}
        </div>
      </div>
      <div className="mt-3 flex h-[22px] overflow-hidden rounded-[5px] bg-[#d1d1d6] dark:bg-white/15">
        {usage.categories.length ? (
          usage.categories.map((category) => (
            <div
              key={category.id}
              title={`${category.label} ${formatBytes(category.bytes)}`}
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
            {category.label}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const StorageUsageDetailSection = ({
  usage,
}: {
  usage: StorageUsageSummary;
}) => (
  <MacSettingsSection title="占用明细">
    {usage.categories.length ? (
      usage.categories.map((category) => (
        <MacSettingsRow
          key={category.id}
          icon={category.icon}
          iconTone={category.tone}
          title={category.label}
          description={category.description}
          extra={
            <MacSettingsValue>{formatBytes(category.bytes)}</MacSettingsValue>
          }
        />
      ))
    ) : (
      <MacSettingsRow
        icon={<RiDatabase2Line size={16} />}
        iconTone="gray"
        title="暂无本地数据"
        description="当前没有可统计的备份数据。"
      />
    )}
  </MacSettingsSection>
);

const BackupView = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
        message.success("已同步到云端");
        refreshCloudSync();
      },
    },
  );
  const { loading: renameLoading, runAsync: renameCloudBackup } = useRequest(
    renameUserDataSyncBackup,
    {
      manual: true,
      onSuccess: () => {
        message.success("名称已更新");
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

    message.success("已导出备份文件");
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
            title: "确认导入备份？",
            content: (
              <Flex vertical gap={8}>
                <Text type="secondary">
                  文件：{file.name}（{Math.ceil(file.size / 1024)} KB）
                </Text>
                <Text type="secondary">备份时间：{backup.createdAt}</Text>
                <Text type="danger">
                  导入将覆盖当前本地所有设置，建议先导出当前数据作为备份。
                </Text>
              </Flex>
            ),
            okText: mode === "strict" ? "确认导入" : "强制导入",
            cancelText: "取消",
            onOk: () => {
              applySearchNextStorageBackup(backup, localStorage, {
                mode,
              });
              message.success("导入成功，正在刷新页面…");
              window.setTimeout(() => window.location.reload(), 300);
            },
          });
        };

        if (isSameFormat && !originMismatch) {
          confirmImport("strict");
          return;
        }

        confirmInSettings({
          title: originMismatch ? "备份文件来源不一致" : "备份文件字段不一致",
          content: (
            <Flex vertical gap={8}>
              <Text type="secondary">
                文件：{file.name}（{Math.ceil(file.size / 1024)} KB）
              </Text>
              <Text type="secondary">备份时间：{backup.createdAt}</Text>
              {originMismatch ? (
                <Text type="secondary">
                  备份来源：{backup.origin}，当前页面：{window.location.origin}
                </Text>
              ) : (
                <Text type="secondary">
                  缺失字段：{missingKeys.length}，额外字段：{extraKeys.length}
                </Text>
              )}
              <Text type="danger">
                {originMismatch
                  ? "继续后将允许导入该来源的备份，导入将覆盖当前本地设置。"
                  : "继续后将尝试强制导入，未包含的字段会保留当前本地值。"}
              </Text>
            </Flex>
          ),
          okText: "继续",
          cancelText: "取消",
          onOk: () => confirmImport(originMismatch ? "strict" : "merge"),
        });
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        message.error(`导入失败：${err}`);
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
      title: "选择要覆盖的云备份",
      content: (
        <Flex vertical gap={8}>
          <Text type="secondary">
            已达到云备份数量上限，请选择一个已有备份用当前本地数据覆盖。
          </Text>
          <Select
            placeholder="请选择要覆盖的云备份"
            style={{ width: "100%" }}
            options={backups.map((backup) => ({
              value: backup._id,
              label: backup.name || "未命名备份",
              title: backup.name || "未命名备份",
              backup,
            }))}
            optionRender={({ data }) => {
              const backup = data.backup as CloudBackupItem;
              return (
                <div className="min-w-0 py-1">
                  <div className="truncate text-sm font-semibold">
                    {backup.name || "未命名备份"}
                  </div>
                  <div className="mt-0.5 text-xs text-[#6e6e73]">
                    {formatDateTime(backup.lastSyncedAt)} ·{" "}
                    {formatBytes(backup.byteSize)} · {backup.itemCount} 项
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
      okText: "继续",
      cancelText: "取消",
      onOk: () => {
        if (!selectedBackupId) {
          message.warning("请选择要覆盖的云备份");
          return Promise.reject();
        }
        const target = backups.find(
          (backup) => backup._id === selectedBackupId,
        );
        if (!target) {
          message.warning("未找到所选云备份");
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

    let name = `云备份 ${new Date().toLocaleString()}`;
    confirmInSettings({
      title: "上传到云端",
      content: (
        <Flex vertical gap={8}>
          <Text type="secondary">
            将当前本地数据保存为新的云备份版本。当前{" "}
            {cloudSync?.versionCount ?? 0}/{cloudSync?.maxSyncBackups ?? 1}。
          </Text>
          <Input
            defaultValue={name}
            maxLength={100}
            placeholder="请输入备份名称"
            onChange={(event) => {
              name = event.target.value;
            }}
          />
        </Flex>
      ),
      okText: "上传",
      cancelText: "取消",
      onOk: () => uploadCloudSync({ payload: backup, name }),
    });
  };

  const handleRestoreCloud = (backup: CloudBackupItem) => {
    confirmInSettings({
      title: "确认从云端恢复？",
      content: (
        <Flex vertical gap={8}>
          <Text type="secondary">版本：{backup.name || "未命名备份"}</Text>
          <Text type="secondary">
            同步时间：{formatDateTime(backup.lastSyncedAt)}，大小：
            {formatBytes(backup.byteSize)}
          </Text>
          <Text type="danger">
            恢复会用云端数据覆盖当前本地所有设置，建议先导出当前数据作为备份。
          </Text>
        </Flex>
      ),
      okText: "确认恢复",
      cancelText: "取消",
      onOk: () => {
        const payload = backup.payload;
        if (!payload) {
          message.warning("未找到所选云备份版本");
          return;
        }
        applySearchNextStorageBackup(payload, localStorage, { mode: "strict" });
        message.success("恢复成功，正在刷新页面…");
        window.setTimeout(() => window.location.reload(), 300);
      },
    });
  };

  const handleOverwriteCloud = (
    target: CloudBackupItem,
    payload = createSearchNextStorageBackup(),
  ) => {
    confirmInSettings({
      title: "确认覆盖云备份？",
      content: (
        <Flex vertical gap={8}>
          <Text type="secondary">目标版本：{target.name || "未命名备份"}</Text>
          <Text type="secondary">
            原同步时间：{formatDateTime(target.lastSyncedAt)}
          </Text>
          <Text type="danger">
            覆盖后该云备份版本会替换为当前本地数据，原云端内容无法从后台查看或恢复。
          </Text>
        </Flex>
      ),
      okText: "确认覆盖",
      cancelText: "取消",
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
      title: "设置备份名称",
      content: (
        <Input
          defaultValue={nextName}
          maxLength={100}
          placeholder="请输入备份名称"
          onChange={(event) => {
            nextName = event.target.value;
          }}
        />
      ),
      okText: "保存",
      cancelText: "取消",
      onOk: () => {
        const trimmed = nextName.trim();
        if (!trimmed) {
          message.warning("请输入备份名称");
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
      <MacSettingsSection title="储存空间">
        <MacSettingsRow
          icon={<RiHardDrive3Line size={16} />}
          iconTone="blue"
          title="当前数据占用"
          description="查看桌面、设置、小组件等数据的空间占比"
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
            云备份列表
          </div>
          <div className="rounded-xl border border-[rgba(60,60,67,0.12)] bg-white/70 px-4 py-5 text-sm text-[#6e6e73]">
            正在读取云备份
          </div>
        </section>
      );
    }

    if (!backups.length) {
      return (
        <section>
          <div className="mb-2 ml-1 text-[13px] font-bold text-[#6e6e73]">
            云备份列表
          </div>
          <div className="rounded-xl border border-dashed border-[rgba(60,60,67,0.18)] bg-white/50 px-4 py-5 text-sm text-[#6e6e73]">
            暂无云备份，点击上传创建第一个云备份版本。
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="mb-2 ml-1 flex items-center justify-between gap-3 text-[13px] font-bold text-[#6e6e73]">
          <span>云备份列表</span>
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
                  {backup.name || "未命名备份"}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-[18px] text-[#6e6e73]">
                  <span>{formatDateTime(backup.lastSyncedAt)}</span>
                  <span>{formatBytes(backup.byteSize)}</span>
                  <span>{backup.itemCount} 项</span>
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
                  重命名
                </Button>
                <Button
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRestoreCloud(backup);
                  }}
                >
                  恢复
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
                  覆盖
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
    <MacSettingsSection title="本地备份">
      <MacSettingsRow
        icon={<RiDownloadLine size={16} />}
        iconTone="orange"
        title="导出数据"
        description="保存为 .snbak 备份文件"
        extra={
          <Button size="small" onClick={handleExportData}>
            导出
          </Button>
        }
      />
      <MacSettingsRow
        icon={<RiUploadLine size={16} />}
        iconTone="purple"
        title="导入数据"
        description="导入会覆盖当前本地设置"
        extra={
          <Button size="small" onClick={handleImportData}>
            导入
          </Button>
        }
      />
      <MacSettingsRow
        icon={<RiErrorWarningLine size={16} />}
        iconTone="orange"
        title="导入前建议先导出当前数据"
        description="导入数据将覆盖当前所有设置。"
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
      <MacSettingsSection title="云端同步">
        <MacSettingsRow
          icon={<RiCloudLine size={16} />}
          iconTone="green"
          title="同步状态"
          description={
            cloudSync?.hasSynced
              ? `最近同步：${formatDateTime(cloudSync.lastSyncedAt)}，版本 ${cloudSync.versionCount}/${cloudSync.maxSyncBackups}`
              : "当前账号暂无云端同步数据"
          }
          extra={
            <MacSettingsValue>
              {cloudLoading ? "读取中" : formatBytes(cloudSync?.byteSize)}
            </MacSettingsValue>
          }
        />
        {cloudSync?.overLimit ? (
          <MacSettingsRow
            icon={<RiErrorWarningLine size={16} />}
            iconTone="orange"
            title="云备份版本超过当前限制"
            description={`当前已有 ${cloudSync.versionCount} 个版本，当前限制为 ${cloudSync.maxSyncBackups} 个。下次上传需要覆盖已有版本。`}
          />
        ) : null}
        <MacSettingsRow
          icon={<RiUploadLine size={16} />}
          iconTone="blue"
          title="上传云备份"
          description="未达上限时创建新版本，达到上限后请覆盖下方已有版本"
          extra={
            <Button
              size="small"
              loading={uploadLoading}
              onClick={handleUploadCloud}
            >
              上传
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
  const { backupId } = useParams<{ backupId?: string }>();
  const { isAuthenticated } = useAuth();
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
  const cloudBackupName = cloudBackup?.name || "未命名备份";
  const storageNavigationTitle = cloudBackup
    ? cloudBackupName
    : "当前空间占用";
  const usage = analyzeBackupStorage(
    backup,
    cloudBackup ? cloudBackup.byteSize : null,
    { includeMetadata: Boolean(cloudBackup) },
  );

  if (isCloudBackup && (cloudLoading || !cloudSync)) {
    return (
      <MacSettingsView navigationTitle="储存空间" showPageHeader={false}>
        <MacSettingsSection title="云备份">
          <MacSettingsRow
            icon={<RiCloudLine size={16} />}
            iconTone="gray"
            title="正在读取"
            description="正在获取云备份版本的储存空间数据。"
          />
        </MacSettingsSection>
      </MacSettingsView>
    );
  }

  if (isCloudBackup && !cloudBackup) {
    return (
      <MacSettingsView navigationTitle="储存空间" showPageHeader={false}>
        <MacSettingsSection title="云备份">
          <MacSettingsRow
            icon={<RiErrorWarningLine size={16} />}
            iconTone="orange"
            title="未找到云备份"
            description="该云备份版本可能已被覆盖或删除。"
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
      <StorageUsageDetailSection usage={usage} />
    </MacSettingsView>
  );
};

export default BackupView;
