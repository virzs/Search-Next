import {
  Button,
  Typography,
  Progress,
  Alert,
  Divider,
  Switch,
  List,
  Card,
} from "antd";
import {
  RiDownloadLine,
  RiUploadLine,
  RiHistoryLine,
  RiErrorWarningLine,
  RiDownloadFill,
  RiUploadFill,
} from "@remixicon/react";
import { useState } from "react";
import { SettingsActions } from "@/components/settings";
import { DefaultAppView } from "@/components";

const { Text, Paragraph } = Typography;

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
    <DefaultAppView>
      <Alert
        message="需要登录账号"
        description="登录后可以使用云端同步功能，确保您的数据安全备份。"
        type="info"
        showIcon
        className="mb-6"
      />
      <Card title="本地备份" styles={{ root: { marginBottom: 16 } }}>
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
      </Card>
    </DefaultAppView>
  );

  // 已登录视图
  const renderLoggedView = () => (
    <DefaultAppView>
      {/* 云端同步 */}
      <Card
        title="云端同步"
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
      <Card title="本地备份" styles={{ root: { marginBottom: 16 } }}>
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
      </Card>
    </DefaultAppView>
  );

  return (
    <div className="flex-1 overflow-auto">
      {isLoggedIn ? renderLoggedView() : renderUnloggedView()}
    </div>
  );
};

export default BackupView;
