import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  ConsumerKey,
  deleteConsumerKey,
  getConsumerKeysList,
  resetConsumerKey,
  toggleConsumerKey,
} from "@/services/ai/consumer-keys";
import { formatDateString } from "@/utils/utils";
import { useRequest } from "ahooks";
import { Modal, Tag, Typography } from "antd";
import { useState } from "react";
import ConsumerKeyHandle from "./handle";

const showPlainKey = (key: ConsumerKey) => {
  Modal.info({
    title: "请保存 API Key",
    width: 640,
    content: (
      <Typography.Paragraph copyable={{ text: key.plainKey }}>
        <Typography.Text code>{key.plainKey}</Typography.Text>
      </Typography.Paragraph>
    ),
  });
};

const ConsumerKeys = () => {
  const table = useTablePage(getConsumerKeysList);
  const { refresh } = table;
  const [handleOpen, setHandleOpen] = useState(false);
  const [editId, setEditId] = useState<string>();

  const { runAsync: remove } = useRequest(deleteConsumerKey, { manual: true, onSuccess: refresh });
  const { runAsync: toggle } = useRequest(toggleConsumerKey, { manual: true, onSuccess: refresh });
  const { runAsync: reset } = useRequest(resetConsumerKey, {
    manual: true,
    onSuccess: (res) => {
      showPlainKey(res);
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    { title: "名称", dataIndex: "name" },
    { title: "Key", dataIndex: "keyPreview" },
    {
      title: "所属用户",
      dataIndex: ["ownerUser", "username"],
    },
    {
      title: "允许模型",
      dataIndex: "allowedModels",
      render: (models) =>
        models?.length ? models.map((model: any) => model.displayName || model.publicName || model.name).join(", ") : "全部",
    },
    { title: "调用次数", dataIndex: "usageCount" },
    { title: "最后使用", dataIndex: "lastUsedAt", render: (value) => formatDateString(value) },
    { title: "过期时间", dataIndex: "expiresAt", render: (value) => formatDateString(value) },
    {
      title: "状态",
      dataIndex: "enabled",
      render: (value) => (value ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>),
    },
    {
      title: "操作",
      dataIndex: "operation",
      fixed: "right",
      render: (_, record) => (
        <Operation
          columns={[
            {
              title: "修改",
              onClick: () => {
                setEditId(record._id);
                setHandleOpen(true);
              },
            },
            { title: "重置 Key", confirm: "确认重置？旧 Key 将立即失效。", onClick: () => reset(record._id) },
            { title: record.enabled ? "停用" : "启用", onClick: () => toggle(record._id) },
            { title: "删除", confirm: "delete", onClick: () => remove(record._id) },
          ]}
        />
      ),
    },
  ];

  return (
    <TablePageContainer>
      <TablePage
        table={table}
        columns={columns}
        showSearch
        button={
          <ConsumerKeyHandle
            open={handleOpen}
            editId={editId}
            onPlainKey={showPlainKey}
            onClose={() => {
              setHandleOpen(false);
              setEditId(undefined);
            }}
            onFinished={() => {
              setHandleOpen(false);
              setEditId(undefined);
              refresh();
            }}
          />
        }
      />
    </TablePageContainer>
  );
};

export default ConsumerKeys;
