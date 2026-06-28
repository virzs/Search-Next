import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import { deleteModel, getModelsList, toggleModel } from "@/services/ai/models";
import { useRequest } from "ahooks";
import { Tag } from "antd";
import { useState } from "react";
import ModelHandle from "./handle";

const Models = () => {
  const table = useTablePage(getModelsList);
  const { refresh } = table;
  const [handleOpen, setHandleOpen] = useState(false);
  const [editId, setEditId] = useState<string>();

  const { runAsync: remove } = useRequest(deleteModel, { manual: true, onSuccess: refresh });
  const { runAsync: toggle } = useRequest(toggleModel, { manual: true, onSuccess: refresh });

  const columns: WindowTableColumnType<any>[] = [
    { title: "对外模型", dataIndex: "publicName" },
    { title: "显示名称", dataIndex: "displayName" },
    { title: "上下文", dataIndex: "contextWindow" },
    { title: "输入价/1K积分", dataIndex: "inputPricePer1K" },
    { title: "输出价/1K积分", dataIndex: "outputPricePer1K" },
    { title: "实现数", dataIndex: "providerModelCount" },
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
          <ModelHandle
            open={handleOpen}
            editId={editId}
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

export default Models;
