import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import { useTablePage } from "@/hooks/useTablePage2";
import { getPresetList, deletePreset } from "@/services/ai/preset";
import { useState } from "react";
import PresetHandle from "./handle";
import { useRequest } from "ahooks";
import { message } from "antd";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";

const Preset = () => {
  const table = useTablePage(getPresetList);

  const { refresh } = table;

  const [handleModalOpen, setHandleModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

  const { runAsync: delRun } = useRequest(deletePreset, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "预设名称",
      dataIndex: "name",
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "系统提示词",
      dataIndex: "systemPrompt",
    },
    {
      title: "用户提示词模板",
      dataIndex: "userPrompt",
    },
    {
      title: "模型温度",
      dataIndex: "temperature",
    },
    {
      title: "最大token数",
      dataIndex: "maxTokens",
    },
    {
      title: "最大上下文长度",
      dataIndex: "maxContext",
    },
    {
      title: "是否流式输出",
      dataIndex: "stream",
    },
    {
      title: "是否启用",
      dataIndex: "enabled",
    },
    {
      title: "创建人",
      dataIndex: "creator",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
    },
    {
      title: "更新人",
      dataIndex: "updater",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
    },
    {
      title: "操作",
      dataIndex: "operation",
      fixed: "right",
      render: (_, record) => {
        return (
          <Operation
            columns={[
              {
                title: "修改",
                onClick: () => {
                  setEditId(record._id);
                  setHandleModalOpen(true);
                },
              },
              {
                title: "删除",
                confirm: "delete",
                onClick: async () => {
                  await delRun(record._id);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <TablePageContainer>
      <TablePage
        table={table}
        columns={columns}
        button={
          <PresetHandle
            key="add"
            open={handleModalOpen}
            editId={editId}
            onClose={() => {
              setHandleModalOpen(false);
              setEditId(undefined);
            }}
            onFinished={() => {
              setHandleModalOpen(false);
              setEditId(undefined);
              refresh();
            }}
          />
        }
      />
    </TablePageContainer>
  );
};

export default Preset;
