import { useTablePage } from "@/hooks/useTablePage2";
import { RoleRequest, deleteRole, getRole } from "@/services/system/role";
import TablePage from "@/components/TablePage2";
import TablePageContainer from "@/components/containter/table";
import { Button, message, Tag } from "antd";
import { useRequest } from "ahooks";
import Operation from "@/components/TablePage2/Operation";
import { useNavigate } from "react-router";
import { SystemPaths } from "../router";
import { WindowTableColumnType } from "@/components/WindowTable";

const Role = () => {
  const navigate = useNavigate();

  const table = useTablePage<RoleRequest>(getRole);

  const { refresh } = table;

  const { loading: delLoading, run: delRun } = useRequest(deleteRole, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<RoleRequest>[] = [
    {
      title: "名称",
      dataIndex: "name",
      render: (name: string, record) => (
        <div className="flex items-center gap-2">
          <span>{name}</span>
          {record.isSystem ? <Tag color="blue">系统内置</Tag> : null}
        </div>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "权限",
      dataIndex: "permissions",
      render: (permissions, record) => (record.isSuperAdmin ? "全部权限" : permissions?.length ?? 0),
    },
    {
      title: "创建人",
      dataIndex: "creator",
      render: (v: any) => v?.username,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
    },
    {
      title: "更新人",
      dataIndex: "updater",
      render: (v: any) => v?.username ?? "-",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 120,
      render: (_, r) => {
        const { _id, isSystem } = r;
        return (
          <Operation
            columns={[
              {
                title: "修改",
                show: !isSystem,
                onClick: () => {
                  navigate(SystemPaths.roleHandle + "/" + _id);
                },
              },
              {
                title: "删除",
                show: !isSystem,
                loading: delLoading,
                onClick: () => delRun(_id!),
                danger: true,
                confirm: "delete",
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
          <Button
            type="primary"
            onClick={() => {
              navigate(SystemPaths.roleHandle);
            }}
          >
            新增角色
          </Button>
        }
        onRow={(r) => ({
          onClick: () => {
            navigate(SystemPaths.role + "/" + r._id);
          },
        })}
      />
    </TablePageContainer>
  );
};

export default Role;
