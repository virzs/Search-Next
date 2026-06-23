import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { useTablePage } from "@/hooks/useTablePage2";
import { deleteProvider, getProvidersList } from "@/services/ai/providers";
import { useState } from "react";
import ProvidersHandle from "./handle";
import { useRequest } from "ahooks";
import { message } from "antd";
import { WindowTableColumnType } from "@/components/WindowTable";

const Providers = () => {
  const table = useTablePage(getProvidersList);

  const { refresh } = table;

  const [handleModalOpen, setHandleModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

  const { runAsync: delRun } = useRequest(deleteProvider, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "名称",
      dataIndex: "displayName",
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "基础URL",
      dataIndex: "baseUrl",
    },
    {
      title: "默认模型",
      dataIndex: "defaultModel",
    },
    {
      title: "支持模型",
      dataIndex: "supportedModels",
      render: (text) => {
        return text.join(", ");
      },
    },
    {
      title: "API密钥",
      dataIndex: "apiKey",
    },
    {
      title: "是否启用",
      dataIndex: "enabled",
      render: (text) => {
        return text ? "是" : "否";
      },
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
          <ProvidersHandle
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

export default Providers;
