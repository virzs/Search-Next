import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  AdminUserDataPluginSummary,
  AdminUserDataSyncRecord,
  AdminUserDataSyncVersion,
  deleteUserDataSyncAdminVersion,
  getUserDataSyncAdmin,
  getUserDataSyncAdminVersions,
} from "@/services/tabs/user-data";
import { App, Button, Modal, Table, Tag, Typography } from "antd";
import { useRequest } from "ahooks";
import { useState } from "react";

const { Text } = Typography;

const formatBytes = (value?: number | null) => {
  const size = value ?? 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const renderPluginSummary = (summary?: AdminUserDataPluginSummary[]) => {
  if (!summary?.length) return "-";
  return (
    <div className="flex flex-wrap gap-1">
      {summary.map((plugin) => (
        <Tag key={plugin.widgetId} color="blue">
          {plugin.name || plugin.widgetId}
          {plugin.version ? ` v${plugin.version}` : ""} x{plugin.count}
        </Tag>
      ))}
    </div>
  );
};

const DesktopUserDataSync = () => {
  const table = useTablePage<AdminUserDataSyncRecord>(getUserDataSyncAdmin);
  const { message } = App.useApp();
  const [versionTarget, setVersionTarget] =
    useState<AdminUserDataSyncRecord | null>(null);
  const {
    data: versions = [],
    loading: versionsLoading,
    refresh: refreshVersions,
  } = useRequest(
    () => getUserDataSyncAdminVersions(versionTarget?.user?._id ?? ""),
    {
      ready: Boolean(versionTarget?.user?._id),
      refreshDeps: [versionTarget?.user?._id],
    },
  );
  const { loading: deleteLoading, runAsync: deleteVersion } = useRequest(
    deleteUserDataSyncAdminVersion,
    {
      manual: true,
      onSuccess: () => {
        message.success("删除成功");
        refreshVersions();
        table.refresh();
      },
    },
  );

  const columns: WindowTableColumnType<AdminUserDataSyncRecord>[] = [
    {
      title: "用户",
      dataIndex: "user",
      width: 220,
      render: (user: AdminUserDataSyncRecord["user"]) =>
        user ? (
          <div className="flex flex-col">
            <Text strong>{user.nickname || user.username || "-"}</Text>
            <Text type="secondary">{user.email || "-"}</Text>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "同步状态",
      dataIndex: "hasSynced",
      width: 100,
      render: (hasSynced: boolean) =>
        hasSynced ? <Tag color="green">已同步</Tag> : <Tag>未同步</Tag>,
    },
    {
      title: "版本数",
      dataIndex: "versionCount",
      width: 120,
      render: (_, record) => (
        <Tag color={record.overLimit ? "orange" : "blue"}>
          {record.versionCount}/{record.maxSyncBackups}
        </Tag>
      ),
    },
    {
      title: "数据大小",
      dataIndex: "totalByteSize",
      width: 110,
      render: (value: number) => formatBytes(value),
    },
    {
      title: "同步项",
      dataIndex: "itemCount",
      width: 90,
    },
    {
      title: "使用的小组件",
      dataIndex: "pluginSummary",
      render: renderPluginSummary,
    },
    {
      title: "最近同步",
      dataIndex: "lastSyncedAt",
      width: 180,
      render: formatDateTime,
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Button size="small" onClick={() => setVersionTarget(record)}>
          版本
        </Button>
      ),
    },
  ];

  return (
    <TablePageContainer>
      <TablePage
        table={table}
        columns={columns}
        showSearch
        searchPlaceholder="搜索用户名/邮箱"
      />
      <Modal
        open={Boolean(versionTarget)}
        title={`${versionTarget?.user?.nickname || versionTarget?.user?.username || "用户"} 的云备份版本`}
        width={860}
        footer={null}
        onCancel={() => setVersionTarget(null)}
      >
        {versionTarget?.overLimit ? (
          <div className="mb-3">
            <Tag color="orange">
              当前版本数 {versionTarget.versionCount} 已超过限制{" "}
              {versionTarget.maxSyncBackups}
            </Tag>
          </div>
        ) : null}
        <Table<AdminUserDataSyncVersion>
          rowKey="_id"
          size="small"
          loading={versionsLoading}
          dataSource={versions}
          pagination={false}
          columns={[
            {
              title: "名称",
              dataIndex: "name",
              render: (value?: string) => value || "-",
            },
            {
              title: "大小",
              dataIndex: "byteSize",
              width: 100,
              render: formatBytes,
            },
            {
              title: "同步项",
              dataIndex: "itemCount",
              width: 80,
            },
            {
              title: "使用的小组件",
              dataIndex: "pluginSummary",
              render: renderPluginSummary,
            },
            {
              title: "同步时间",
              dataIndex: "lastSyncedAt",
              width: 170,
              render: formatDateTime,
            },
            {
              title: "操作",
              dataIndex: "action",
              width: 90,
              render: (_, record) => (
                <Button
                  danger
                  size="small"
                  loading={deleteLoading}
                  onClick={() => deleteVersion(record._id)}
                >
                  删除
                </Button>
              ),
            },
          ]}
        />
      </Modal>
    </TablePageContainer>
  );
};

export default DesktopUserDataSync;
