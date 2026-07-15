import TablePageContainer from "@/components/containter/table";
import { deletePermission, getPermissionTree } from "@/services/system/permission";
import PermissionHandle from "./handle";
import { useState } from "react";
import { App, message, Space, Tag } from "antd";
import Operation from "@/components/TablePage2/Operation";
import { useRequest } from "ahooks";
import TablePage from "@/components/TablePage2";
import { useTablePage } from "@/hooks/useTablePage2";
import { WindowTableColumnType } from "@/components/WindowTable";
import { PermissionMethodTag } from "./method";
import { routeAuth } from "@/contexts/AccessContext";

const Permission = () => {
  const table = useTablePage(getPermissionTree);

  const { modal } = App.useApp();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [parent, setParent] = useState<string | undefined>(undefined);

  const { runAsync: delRun } = useRequest(deletePermission, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      table.refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "名称",
      dataIndex: "name",
      width: 180,
      minWidth: 150,
    },
    {
      title: "描述",
      dataIndex: "description",
      width: 100,
      render: (description, record, _rowIndex, children) => {
        if (!description || description === record.url) {
          return "-";
        }
        return children;
      },
    },
    {
      title: "请求方式",
      dataIndex: "method",
      width: 110,
      render: (method) => <PermissionMethodTag method={method} />,
    },
    {
      title: "URL",
      dataIndex: "url",
      width: 220,
      minWidth: 160,
    },
    {
      title: "状态",
      dataIndex: "source",
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Tag color={record.source === "auto" ? "blue" : "default"}>{record.source === "auto" ? "自动" : "手动"}</Tag>
          {record.isStale ? <Tag color="orange">已失效</Tag> : null}
        </Space>
      ),
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => {
        return (
          <Operation
            columns={[
              {
                title: "新增子权限",
                auth: routeAuth("POST", "/system/permission"),
                onClick: () => {
                  setParent(record._id);
                  setOpen(true);
                },
              },
              {
                title: "修改",
                auth: routeAuth("PUT", "/system/permission/:id"),
                onClick: () => {
                  setOpen(true);
                  setEditId(record._id);
                },
              },
              {
                title: "删除",
                auth: routeAuth("DELETE", "/system/permission/:id"),
                onClick: () => {
                  modal.confirm({
                    title: "确认删除?",
                    content: "删除后不可恢复",
                    onOk: async () => {
                      await delRun(record._id);
                    },
                  });
                },
                danger: true,
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
        pagination={false}
        button={
          <PermissionHandle
            auth={routeAuth("POST", "/system/permission")}
            parent={parent}
            open={open}
            editId={editId}
            onFinished={() => {
              table.refresh();
            }}
            onClose={() => {
              setOpen(false);
              setEditId(undefined);
              setParent(undefined);
            }}
          />
        }
      />
    </TablePageContainer>
  );
};

export default Permission;
