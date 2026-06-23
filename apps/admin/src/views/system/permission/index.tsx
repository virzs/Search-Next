import TablePageContainer from "@/components/containter/table";
import { deletePermission, getPermissionTree } from "@/services/system/permission";
import { ActionType } from "@ant-design/pro-components";
import PermissionHandle from "./handle";
import { useRef, useState } from "react";
import { App, message } from "antd";
import Operation from "@/components/TablePage2/Operation";
import { useRequest } from "ahooks";
import TablePage from "@/components/TablePage2";
import { useTablePage } from "@/hooks/useTablePage2";
import { WindowTableColumnType } from "@/components/WindowTable";

const Permission = () => {
  const table = useTablePage(getPermissionTree);

  const { modal } = App.useApp();
  const actionRef = useRef<ActionType>(null);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [parent, setParent] = useState<string | undefined>(undefined);

  const { runAsync: delRun } = useRequest(deletePermission, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      actionRef.current?.reload();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "请求方式",
      dataIndex: "method",
    },
    {
      title: "URL",
      dataIndex: "url",
    },
    {
      title: "类型",
      dataIndex: "type",
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 200,
      render: (_, record) => {
        return (
          <Operation
            columns={[
              {
                title: "新增子权限",
                onClick: () => {
                  setParent(record._id);
                  setOpen(true);
                },
              },
              {
                title: "修改",
                onClick: () => {
                  setOpen(true);
                  setEditId(record._id);
                },
              },
              {
                title: "删除",
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
            parent={parent}
            open={open}
            editId={editId}
            onFinished={() => {
              actionRef.current?.reload();
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
