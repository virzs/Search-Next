import { useTablePage } from "@/hooks/useTablePage2";
import { deleteUser, getUsers, postUsers, putEnable, putUsers } from "@/services/user";
import { getRoleList, RoleRequest } from "@/services/system/role";
import { App, Button, Form, Input, Modal, Select, Tag } from "antd";
import TablePage from "@/components/TablePage2";
import TablePageContainer from "@/components/containter/table";
import { useRequest } from "ahooks";
import { WindowTableColumnType } from "@/components/WindowTable";
import Operation from "@/components/TablePage2/Operation";
import { useState } from "react";
import { getUserStatusColor, getUserStatusLabel } from "../utils";
import { format } from "date-fns";

interface UserRole {
  _id?: string;
  name?: string;
  isSuperAdmin?: boolean;
}

interface UserRecord {
  _id: string;
  username: string;
  email: string;
  status?: number;
  enable?: boolean;
  createdAt?: string | Date;
  roles?: UserRole[];
}

interface UserFormValues {
  username: string;
  email: string;
  password?: string;
  status?: number;
  roles?: string[];
}

const getRoleIds = (roles?: UserRole[]) => roles?.map((role) => role._id).filter((id): id is string => !!id) ?? [];

const User = () => {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord>();
  const [form] = Form.useForm<UserFormValues>();
  const { message } = App.useApp();

  const table = useTablePage<UserRecord>(getUsers);
  const { refresh } = table;

  const { data: roles = [], loading: rolesLoading } = useRequest(getRoleList);

  const closeModal = () => {
    setOpen(false);
    setEditingUser(undefined);
    form.resetFields();
  };

  const openCreateModal = () => {
    setEditingUser(undefined);
    form.setFieldsValue({ status: 1, roles: [] });
    setOpen(true);
  };

  const openEditModal = (record: UserRecord) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      status: record.status,
      roles: getRoleIds(record.roles),
    });
    setOpen(true);
  };

  const { loading: enableLoading, run: toggleEnable } = useRequest(putEnable, {
    manual: true,
    onSuccess: () => {
      refresh();
      message.success("操作成功");
    },
  });

  const { loading: deleteLoading, run: removeUser } = useRequest(deleteUser, {
    manual: true,
    onSuccess: () => {
      refresh();
      message.success("删除成功");
    },
  });

  const { loading: submitLoading, run: submitUser } = useRequest(
    (values: UserFormValues) => {
      if (editingUser) {
        return putUsers(editingUser._id, values);
      }
      return postUsers(values);
    },
    {
      manual: true,
      onSuccess: () => {
        closeModal();
        refresh();
        message.success(editingUser ? "修改成功" : "创建成功");
      },
    }
  );

  const columns: WindowTableColumnType<UserRecord>[] = [
    {
      title: "用户名",
      dataIndex: "username",
    },
    {
      title: "邮箱",
      dataIndex: "email",
    },
    {
      title: "角色",
      dataIndex: "roles",
      render: (roles?: UserRole[]) =>
        roles?.length
          ? roles.map((role) => (
              <Tag key={role._id ?? role.name} color={role.isSuperAdmin ? "red" : undefined}>
                {role.name}
              </Tag>
            ))
          : "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status?: number) => <Tag color={getUserStatusColor(status ?? 0)}>{getUserStatusLabel(status ?? 0)}</Tag>,
    },
    {
      title: "启用",
      dataIndex: "enable",
      render: (enable?: boolean) => <Tag color={enable ? "green" : "red"}>{enable ? "启用" : "禁用"}</Tag>,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      render: (createdAt?: string | Date) => (createdAt ? format(createdAt, "yyyy-MM-dd HH:mm") : "-"),
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Operation
          columns={[
            {
              title: "编辑",
              onClick: () => openEditModal(record),
            },
            {
              title: record.enable ? "禁用" : "启用",
              loading: enableLoading,
              danger: record.enable,
              onClick: () => toggleEnable(record._id),
              confirm: {
                title: record.enable ? "确认禁用该用户？" : "确认启用该用户？",
              },
            },
            {
              title: "删除",
              loading: deleteLoading,
              onClick: () => removeUser(record._id),
              danger: true,
              confirm: "delete",
            },
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
        button={
          <Button type="primary" onClick={openCreateModal}>
            新增用户
          </Button>
        }
      />
      <Modal
        open={open}
        title={editingUser ? "编辑用户" : "新增用户"}
        width={520}
        confirmLoading={submitLoading}
        onCancel={closeModal}
        onOk={() => form.submit()}
        destroyOnHidden
      >
        <Form<UserFormValues> form={form} layout="vertical" onFinish={submitUser} initialValues={{ status: 1, roles: [] }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱" }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          {!editingUser ? (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          ) : null}
          <Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
            <Select
              options={[
                { label: "未验证邮箱", value: 0 },
                { label: "正常", value: 1 },
                { label: "禁用", value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="roles" label="角色">
            <Select
              mode="multiple"
              loading={rolesLoading}
              placeholder="请选择角色"
              options={(roles as RoleRequest[]).map((role) => ({ label: role.name, value: role._id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </TablePageContainer>
  );
};

export default User;
