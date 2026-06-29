import { Button, Typography, message, Flex, Input, Modal, Select } from "antd";
import { useEffect, useRef } from "react";
import { useRequest } from "ahooks";
import {
  RiCloudLine,
  RiDownloadLine,
  RiErrorWarningLine,
  RiUploadLine,
} from "@remixicon/react";
import useAuth from "@/hooks/useAuth";
import {
  SEARCH_NEXT_STORAGE_KEYS,
  parseStorageBackup,
  applySearchNextStorageBackup,
  createSearchNextStorageBackup,
  isSearchNextBackupKey,
  stringifyStorageBackup,
} from "@/utils/storage";
import {
  getUserDataSync,
  putUserDataSync,
  renameUserDataSyncBackup,
  type UserDataSyncInfo,
} from "@/services/user-data";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";

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

const BackupView = () => {
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
              className="grid min-h-[68px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-[rgba(60,60,67,0.12)] bg-white/75 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.035)] backdrop-blur-xl max-[640px]:grid-cols-1"
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
                  onClick={() => handleRenameCloud(backup)}
                >
                  重命名
                </Button>
                <Button size="small" onClick={() => handleRestoreCloud(backup)}>
                  恢复
                </Button>
                <Button
                  size="small"
                  danger
                  loading={uploadLoading}
                  onClick={() => handleOverwriteCloud(backup)}
                >
                  覆盖
                </Button>
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

  const renderUnloggedView = () => <>{renderLocalBackupSection()}</>;

  const renderLoggedView = () => (
    <>
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

export default BackupView;
