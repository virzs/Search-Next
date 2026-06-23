import { App, Button, Modal, Space, Table, Tag, Typography } from "antd";
import { FC, useEffect } from "react";
import { useRequest } from "ahooks";
import { getWidgetVersions, publishWidgetVersion, WidgetVersionItem } from "@/services/tabs/widget";

const { Text } = Typography;

interface WidgetVersionModalProps {
  open: boolean;
  widgetId?: string;
  widgetName?: string;
  onClose: () => void;
  onPublished: () => void;
}

const WidgetVersionModal: FC<WidgetVersionModalProps> = ({
  open,
  widgetId,
  widgetName,
  onClose,
  onPublished,
}) => {
  const { message } = App.useApp();
  const { data, loading, run } = useRequest(getWidgetVersions, { manual: true });
  const { runAsync: publishRun, loading: publishLoading } = useRequest(publishWidgetVersion, {
    manual: true,
    onSuccess: () => {
      message.success("版本已发布");
      if (widgetId) run(widgetId);
      onPublished();
    },
  });

  useEffect(() => {
    if (open && widgetId) run(widgetId);
  }, [open, widgetId, run]);

  return (
    <Modal open={open} title={`${widgetName || "小组件"} - 版本管理`} onCancel={onClose} footer={null} width={900}>
      <Table<WidgetVersionItem>
        rowKey="_id"
        loading={loading}
        dataSource={data || []}
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
                onClick={() => widgetId && publishRun(widgetId, record._id)}
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

export default WidgetVersionModal;
