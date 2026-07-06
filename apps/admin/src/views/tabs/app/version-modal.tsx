import { App, Button, Modal, Space, Table, Tag, Typography } from "antd";
import { FC, useEffect, useMemo } from "react";
import { useRequest } from "ahooks";
import { getAppVersions, publishAppVersion, AppVersionItem } from "@/services/tabs/app";

const { Text } = Typography;

interface AppVersionModalProps {
  open: boolean;
  appId?: string;
  appName?: string;
  onClose: () => void;
  onPublished: () => void;
}

const AppVersionModal: FC<AppVersionModalProps> = ({
  open,
  appId,
  appName,
  onClose,
  onPublished,
}) => {
  const { message } = App.useApp();
  const { data, loading, run } = useRequest(getAppVersions, { manual: true });
  const { runAsync: publishRun, loading: publishLoading } = useRequest(publishAppVersion, {
    manual: true,
    onSuccess: () => {
      message.success("版本已发布");
      if (appId) run(appId);
      onPublished();
    },
  });

  useEffect(() => {
    if (open && appId) run(appId);
  }, [open, appId, run]);

  const versionRows = useMemo(() => {
    const seen = new Set<string>();
    return (data || []).filter((item) => {
      if (!item.version) return true;
      if (seen.has(item.version)) return false;
      seen.add(item.version);
      return true;
    });
  }, [data]);

  return (
    <Modal open={open} title={`${appName || "应用"} - 版本管理`} onCancel={onClose} footer={null} width={900}>
      <Table<AppVersionItem>
        rowKey="_id"
        loading={loading}
        dataSource={versionRows}
        pagination={false}
        columns={[
          {
            title: "版本",
            dataIndex: "version",
            width: 120,
            render: (version, record) => (
              <Space>
                <Text strong>{version}</Text>
                {record.active ? <Tag color="green">当前</Tag> : null}
              </Space>
            ),
          },
          { title: "包名", dataIndex: "packageName" },
          {
            title: "入口",
            dataIndex: "entryUrl",
            render: (value) => <Text copyable ellipsis style={{ maxWidth: 280 }}>{value}</Text>,
          },
          {
            title: "操作",
            width: 120,
            render: (_, record) => (
              <Button
                type="link"
                disabled={record.active}
                loading={publishLoading}
                onClick={() => appId && publishRun(appId, record._id)}
              >
                发布
              </Button>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default AppVersionModal;
