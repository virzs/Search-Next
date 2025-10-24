import { Button, Space, Typography, Progress, Alert, Divider, Switch, List } from "antd";
import {
  RiCloudLine,
  RiDownloadLine,
  RiUploadLine,
  RiHistoryLine,
  RiErrorWarningLine,
  RiDownloadFill,
  RiUploadFill,
  RiInbox2Fill,
} from "@remixicon/react";
import { useState } from "react";
import { SettingsViewContainer, SettingsViewHeader, SettingsCard, SettingsActions } from "@/components/settings";

const { Title, Text, Paragraph } = Typography;

interface SyncStatus {
  isEnabled: boolean;
  lastSyncTime: Date | null;
  syncProgress: number;
  isSyncing: boolean;
}

const BackupView = () => {
  // 模拟登录状态，后续可以从全局状态管理中获取
  const [isLoggedIn] = useState(true);

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

  const handleManualSync = () => {
    setSyncStatus((prev) => ({ ...prev, isSyncing: true, syncProgress: 0 }));

    // 模拟同步进度
    const interval = setInterval(() => {
      setSyncStatus((prev) => {
        const newProgress = prev.syncProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            syncProgress: 100,
            isSyncing: false,
            lastSyncTime: new Date(),
          };
        }
        return { ...prev, syncProgress: newProgress };
      });
    }, 200);
  };

  const handleExportData = () => {
    // 这里后续实现数据导出逻辑
    console.log("导出数据");
  };

  const handleImportData = () => {
    // 这里后续实现数据导入逻辑
    console.log("导入数据");
  };

  // 未登录视图
  const renderUnloggedView = () => (
    <SettingsViewContainer>
      <SettingsViewHeader
        title="备份与恢复"
        description="管理您的数据备份和恢复设置"
        icon={<RiInbox2Fill />}
      />
      
      <Alert
        message="需要登录账号"
        description="登录后可以使用云端同步功能，确保您的数据安全备份。"
        type="info"
        showIcon
        className="mb-6"
      />

      <SettingsCard title="本地备份">
        <Paragraph type="secondary" className="mb-4">
          即使未登录，您也可以导出和导入本地数据。
        </Paragraph>

        <SettingsActions
          layout="vertical"
          actions={[
            {
              key: "export",
              label: "导出数据",
              type: "primary",
              icon: <RiDownloadLine />,
              onClick: handleExportData,
            },
            {
              key: "import",
              label: "导入数据",
              icon: <RiUploadLine />,
              onClick: handleImportData,
            },
          ]}
        />
      </SettingsCard>
    </SettingsViewContainer>
  );

  // 已登录视图
  const renderLoggedView = () => (
    <SettingsViewContainer>
      <SettingsViewHeader
        title="备份与恢复"
        description="管理您的数据备份和恢复设置"
        icon={<RiInbox2Fill />}
      />
      
      {/* 云端同步 */}
      <SettingsCard
        title="云端同步"
        extra={
          <Switch
            checked={syncStatus.isEnabled}
            onChange={handleToggleSync}
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />
        }
      >

        {syncStatus.isEnabled ? (
          <div>
            <div className="flex justify-between items-center mb-3">
              <Text>同步状态：</Text>
              <Text type={syncStatus.isSyncing ? "warning" : "success"}>
                {syncStatus.isSyncing ? "同步中..." : "已同步"}
              </Text>
            </div>

            {syncStatus.isSyncing && <Progress percent={syncStatus.syncProgress} status="active" className="mb-3" />}

            {syncStatus.lastSyncTime && (
              <div className="flex justify-between items-center mb-4">
                <Text>上次同步：</Text>
                <Text type="secondary">{syncStatus.lastSyncTime.toLocaleString()}</Text>
              </div>
            )}

            <SettingsActions
              actions={[
                {
                  key: "sync",
                  label: syncStatus.isSyncing ? "同步中..." : "立即同步",
                  type: "primary",
                  icon: <RiCloudLine />,
                  onClick: handleManualSync,
                  disabled: syncStatus.isSyncing,
                  loading: syncStatus.isSyncing,
                },
              ]}
            />
          </div>
        ) : (
          <Alert
            message="云端同步已关闭"
            description="开启后可以在多个设备间同步您的数据和设置。"
            type="warning"
            showIcon
          />
        )}
      </SettingsCard>

      {/* 备份历史 */}
      <SettingsCard title="备份历史">
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
      </SettingsCard>

      {/* 本地备份 */}
      <SettingsCard title="本地备份">
        <Paragraph type="secondary" className="mb-4">
          除了云端同步，您还可以手动导出和导入数据文件。
        </Paragraph>

        <SettingsActions
          layout="vertical"
          actions={[
            {
              key: "export",
              label: "导出数据",
              icon: <RiDownloadFill />,
              onClick: handleExportData,
            },
            {
              key: "import",
              label: "导入数据",
              icon: <RiUploadFill />,
              onClick: handleImportData,
            },
          ]}
        />

        <Divider />

        <Alert
          message="注意"
          description="导入数据将覆盖当前所有设置，请谨慎操作。建议先导出当前数据作为备份。"
          type="warning"
          showIcon
          icon={<RiErrorWarningLine />}
        />
      </SettingsCard>
    </SettingsViewContainer>
  );

  return <div className="flex-1 overflow-auto">{isLoggedIn ? renderLoggedView() : renderUnloggedView()}</div>;
};

export default BackupView;
