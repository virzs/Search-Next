import {
  Button,
  Typography,
  Progress,
  Alert,
  Switch,
  List,
  Card,
  message,
  Flex,
  Modal,
} from "antd";
import { RiDownloadLine, RiUploadLine, RiHistoryLine } from "@remixicon/react";
import { useState } from "react";
import { DefaultAppView } from "@/components";
import useAuth from "@/hooks/useAuth";
import {
  SEARCH_NEXT_STORAGE_KEYS,
  createStorageBackup,
  parseStorageBackup,
  applyStorageBackup,
  stringifyStorageBackup,
} from "@/utils/storage";

const { Text } = Typography;

interface SyncStatus {
  isEnabled: boolean;
  lastSyncTime: Date | null;
  syncProgress: number;
  isSyncing: boolean;
}

const BackupView = () => {
  const { isAuthenticated } = useAuth();

  // 同步状态
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isEnabled: true,
    lastSyncTime: new Date(),
    syncProgress: 0,
    isSyncing: false,
  });

  const handleToggleSync = (enabled: boolean) => {
    setSyncStatus((prev) => ({ ...prev, isEnabled: enabled }));
  };

  const handleExportData = () => {
    const backup = createStorageBackup(SEARCH_NEXT_STORAGE_KEYS);
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
        const extraKeys = backupKeys.filter((k) => !expectedKeySet.has(k));
        const isSameFormat = missingKeys.length === 0 && extraKeys.length === 0;
        const originMismatch = Boolean(
          backup.origin && backup.origin !== window.location.origin,
        );

        const confirmImport = (mode: "strict" | "merge") => {
          Modal.confirm({
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
              applyStorageBackup(backup, SEARCH_NEXT_STORAGE_KEYS, undefined, {
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

        Modal.confirm({
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

  const renderLocalBackupCard = () => (
    <Card title="本地备份" styles={{ root: { marginBottom: 16 } }}>
      <Flex vertical gap="middle">
        <Button icon={<RiUploadLine size={16} />} onClick={handleExportData}>
          导出数据
        </Button>
        <Button icon={<RiDownloadLine size={16} />} onClick={handleImportData}>
          导入数据
        </Button>
        <Alert
          title="注意"
          description="导入数据将覆盖当前所有设置，请谨慎操作。建议先导出当前数据作为备份。"
          type="warning"
        />
      </Flex>
    </Card>
  );

  // 未登录视图
  const renderUnloggedView = () => <>{renderLocalBackupCard()}</>;

  // 已登录视图
  const renderLoggedView = () => (
    <>
      {/* 云端同步 */}
      <Card
        title="同步"
        extra={
          <Switch
            checked={syncStatus.isEnabled}
            onChange={handleToggleSync}
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />
        }
        styles={{ root: { marginBottom: 16 } }}
      >
        {syncStatus.isEnabled ? (
          <div>
            <div className="flex justify-between items-center mb-3">
              <Text>同步状态：</Text>
              <Text type={syncStatus.isSyncing ? "warning" : "success"}>
                {syncStatus.isSyncing ? "同步中..." : "已同步"}
              </Text>
            </div>

            {syncStatus.isSyncing && (
              <Progress
                percent={syncStatus.syncProgress}
                status="active"
                className="mb-3"
              />
            )}

            {syncStatus.lastSyncTime && (
              <div className="flex justify-between items-center mb-4">
                <Text>上次同步：</Text>
                <Text type="secondary">
                  {syncStatus.lastSyncTime.toLocaleString()}
                </Text>
              </div>
            )}
          </div>
        ) : (
          <Alert
            message="云端同步已关闭"
            description="开启后可以在多个设备间同步您的数据和设置。"
            type="warning"
            showIcon
          />
        )}
      </Card>

      {/* 备份历史 */}
      <Card title="备份历史" styles={{ root: { marginBottom: 16 } }}>
        <List
          size="small"
          dataSource={[
            { time: "2024-01-15 14:30", size: "2.3 MB", type: "自动备份" },
            { time: "2024-01-14 09:15", size: "2.1 MB", type: "手动备份" },
            { time: "2024-01-13 16:45", size: "2.0 MB", type: "自动备份" },
          ]}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" size="small" key="restore">
                  恢复
                </Button>,
                <Button type="link" size="small" key="download">
                  下载
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<RiHistoryLine />}
                title={item.type}
                description={`${item.time} · ${item.size}`}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 本地备份 */}
      {renderLocalBackupCard()}
    </>
  );

  return (
    <DefaultAppView>
      {isAuthenticated ? renderLoggedView() : renderUnloggedView()}
    </DefaultAppView>
  );
};

export default BackupView;
