import {
  Button,
  Typography,
  Alert,
  message,
  Flex,
  Modal,
} from "antd";
import {
  RiCloudLine,
  RiDownloadLine,
  RiErrorWarningLine,
  RiUploadLine,
} from "@remixicon/react";
import useAuth from "@/hooks/useAuth";
import {
  SEARCH_NEXT_STORAGE_KEYS,
  createStorageBackup,
  parseStorageBackup,
  applyStorageBackup,
  stringifyStorageBackup,
} from "@/utils/storage";
import {
  MacSettingsHero,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";

const { Text } = Typography;

const BackupView = () => {
  const { isAuthenticated } = useAuth();

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
          title="同步桌面数据"
          description="云端多设备同步尚未接入，当前不会模拟同步状态。"
          extra={<MacSettingsValue>即将推出</MacSettingsValue>}
        >
          <Alert
            message="当前仅使用本地数据"
            description="你仍然可以通过下方导出和导入 .snbak 文件迁移设置。"
            type="info"
            showIcon
          />
        </MacSettingsRow>
      </MacSettingsSection>
      {renderLocalBackupSection()}
    </>
  );

  return (
    <MacSettingsView
      title="备份与恢复"
      description="导出本地数据，或在登录后开启云端同步。"
    >
      <MacSettingsHero
        icon={<RiCloudLine size={24} />}
        tone="purple"
        title={isAuthenticated ? "同步与备份" : "本地备份"}
        description={
          isAuthenticated
            ? "当前可导出本地备份；云端同步能力准备中。"
            : "当前可导出和导入本地备份；云端同步能力准备中。"
        }
      />
      {isAuthenticated ? renderLoggedView() : renderUnloggedView()}
    </MacSettingsView>
  );
};

export default BackupView;
