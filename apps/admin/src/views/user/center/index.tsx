import {
  deleteInvitationCode,
  getInvitationCode,
  getInvitationCodeInvitedUsers,
  InvitationCodeInvitedUser,
  putForbidden,
} from "@/services/user";
import { useRequest } from "ahooks";
import { App, Avatar, Button, Card, Flex, Space, Tag, theme, Typography } from "antd";
import { LinkOutlined, UserOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import { getInvitationCodeStatusColor, getInvitationCodeStatusLabel } from "../utils";
import HandleCode from "./handleCode";
import { useMemo, useState } from "react";
import { getUserInfo } from "@/utils/userInfo";
import Operation from "@/components/TablePage2/Operation";
import FullPageContainer from "@/components/containter/full";
import TablePage from "@/components/TablePage2";
import { useTablePage } from "@/hooks/useTablePage2";
import { WindowTableColumnType } from "@/components/WindowTable";
import { routeAuth, useHasPermission } from "@/contexts/AccessContext";

const INVITATION_PERMISSIONS = {
  list: routeAuth("GET", "/users/invitation-code"),
  invitedUsers: routeAuth("GET", "/users/invitation-code/invited-users"),
  create: routeAuth("POST", "/users/invitation-code"),
  delete: routeAuth("DELETE", "/users/invitation-code/:id"),
  forbidden: routeAuth("PUT", "/users/invitation-code/forbidden/:id"),
} as const;

interface InvitationCodeRole {
  _id?: string;
  name?: string;
}

interface InvitationCodeRecord {
  _id: string;
  code: string;
  roles?: InvitationCodeRole[];
  useCount?: number;
  maxUse?: number;
  expire?: string | Date;
  status: number;
}

const getInvitedUserCode = (record: InvitationCodeInvitedUser) => {
  if (typeof record.invitationCode === "object") {
    return record.invitationCode.code ?? "-";
  }
  return record.code ?? record.usedCode ?? record.invitationCode ?? "-";
};

const UserCenter = () => {
  const [open, setOpen] = useState(false);
  const { email, username } = getUserInfo();
  const { token } = theme.useToken();

  const { message } = App.useApp();
  const canViewInvitationCodes = useHasPermission(INVITATION_PERMISSIONS.list);
  const canViewInvitedUsers = useHasPermission(INVITATION_PERMISSIONS.invitedUsers);
  const canCreateInvitationCode = useHasPermission(INVITATION_PERMISSIONS.create);

  const table = useTablePage<InvitationCodeRecord>(getInvitationCode, {
    pathname: "/user/center/invitation-code",
    ready: canViewInvitationCodes,
  });
  const { refresh, data: invitationCodes } = table;

  const invitationStats = useMemo(() => {
    const total = invitationCodes.length;
    const active = invitationCodes.filter((item) => item.status === 0).length;
    const used = invitationCodes.reduce((count, item) => count + (item.useCount ?? 0), 0);
    return { total, active, used };
  }, [invitationCodes]);

  const { loading: forbiddenLoading, run: forbidden } = useRequest(putForbidden, {
    manual: true,
    onSuccess: () => {
      message.success("禁用成功");
      refresh();
    },
  });

  const invitedUsersTable = useTablePage<InvitationCodeInvitedUser>(
    async () => {
      const data = await getInvitationCodeInvitedUsers();
      return {
        total: data.length,
        data,
      };
    },
    {
      pathname: "/user/center/invited-users",
      defaultParams: { page: 1, pageSize: 10 },
      ready: canViewInvitedUsers,
    }
  );

  const { refresh: refreshInvitedUsers } = invitedUsersTable;

  const { loading: deleteLoading, run: deleteCode } = useRequest(deleteInvitationCode, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
      if (canViewInvitedUsers) {
        refreshInvitedUsers();
      }
    },
  });

  const invitedUserColumns: WindowTableColumnType<InvitationCodeInvitedUser>[] = [
    {
      title: "邮箱",
      dataIndex: "email",
      render: (email?: string) => <Typography.Text type="secondary">{email ?? "-"}</Typography.Text>,
    },
    {
      title: "使用的邀请码",
      dataIndex: "invitationCode",
      render: (_, user) => <Typography.Text code>{getInvitedUserCode(user)}</Typography.Text>,
    },
    {
      title: "注册时间",
      dataIndex: "createdAt",
      render: (createdAt?: string) => (createdAt ? format(createdAt, "yyyy-MM-dd HH:mm") : "-"),
    },
  ];

  const columns: WindowTableColumnType<InvitationCodeRecord>[] = [
    {
      title: "邀请码",
      dataIndex: "code",
      render: (code: string) => <Typography.Text code>{code}</Typography.Text>,
    },
    {
      title: "默认角色",
      dataIndex: "roles",
      render: (roles?: InvitationCodeRole[]) =>
        roles?.length ? roles.map(({ _id, name }) => <Tag key={_id ?? name}>{name}</Tag>) : "-",
    },
    {
      title: "已使用次数",
      dataIndex: "useCount",
      render: (useCount?: number) => useCount ?? 0,
    },
    {
      title: "最大使用次数",
      dataIndex: "maxUse",
      render: (maxUse?: number) => maxUse ?? "-",
    },
    {
      title: "有效期",
      dataIndex: "expire",
      render: (expire?: string | Date) => (expire ? format(expire, "yyyy-MM-dd") : "长期有效"),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: number) => (
        <Tag variant="filled" color={getInvitationCodeStatusColor(status)}>
          {getInvitationCodeStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "操作",
      dataIndex: "operation",
      width: 260,
      render: (_, record) => (
        <Operation
          columns={[
            {
              show: record.status === 0,
              tooltip: { title: "点击复制邀请链接" },
              onClick: () => {
                const url = `${window.location.origin}/register?code=${record.code}`;
                navigator.clipboard.writeText(url);
                message.success("邀请链接已复制到剪贴板");
              },
              title: "邀请链接",
            },
            {
              show: record.status !== 2,
              auth: INVITATION_PERMISSIONS.forbidden,
              onClick: () => forbidden(record._id),
              title: "禁用",
              loading: forbiddenLoading,
              danger: true,
              confirm: {
                title: "确认禁用吗？",
                content: "禁用后，该邀请码将无法使用",
              },
            },
            {
              auth: INVITATION_PERMISSIONS.delete,
              onClick: () => deleteCode(record._id),
              title: "删除",
              loading: deleteLoading,
              danger: true,
              confirm: "delete",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <FullPageContainer showBackButton={false} cardProps={{ className: "bg-transparent", bodyStyle: { padding: 0 } }}>
      <Flex vertical gap="large" style={{ width: "100%" }}>
        <Card
          className="overflow-hidden"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowTertiary }}
        >
          <div
            className="relative"
            style={{
              minHeight: 168,
              padding: token.paddingLG,
              background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorInfoBg} 52%, ${token.colorPrimaryBgHover} 100%)`,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <Space size="large" align="center">
                <Avatar
                  size={88}
                  icon={<UserOutlined />}
                  style={{
                    background: token.colorPrimary,
                    border: `${token.lineWidthBold}px ${token.lineType} ${token.colorBgContainer}`,
                    boxShadow: token.boxShadowSecondary,
                  }}
                />
                <div>
                  <Typography.Text style={{ color: token.colorTextTertiary }}>个人中心</Typography.Text>
                  <Typography.Title level={3} style={{ margin: 0, color: token.colorText }}>
                    {username}
                  </Typography.Title>
                  <Typography.Text style={{ color: token.colorTextSecondary }}>{email}</Typography.Text>
                </div>
              </Space>
            </div>
          </div>
          {canViewInvitationCodes ? (
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              <Card size="small" style={{ background: token.colorFillQuaternary }}>
                <Typography.Text type="secondary">邀请码总数</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {invitationStats.total}
                </Typography.Title>
              </Card>
              <Card size="small" style={{ background: token.colorInfoBg }}>
                <Typography.Text type="secondary">生效中</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0, color: token.colorInfoText }}>
                  {invitationStats.active}
                </Typography.Title>
              </Card>
              <Card size="small" style={{ background: token.colorSuccessBg }}>
                <Typography.Text type="secondary">累计邀请</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0, color: token.colorSuccessText }}>
                  {invitationStats.used}
                </Typography.Title>
              </Card>
            </div>
          ) : null}
        </Card>

        {canViewInvitationCodes ? (
          <Card
            title="我的邀请码"
            extra={
              canCreateInvitationCode ? (
                <Button type="primary" icon={<LinkOutlined />} onClick={() => setOpen(true)}>
                  创建邀请码
                </Button>
              ) : null
            }
            styles={{ body: { padding: 0 } }}
            style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowTertiary }}
          >
            <div className="w-full h-96">
              <TablePage
                table={table}
                pagination={false}
                columns={columns}
                cardProps={{ ghost: true }}
              />
            </div>
          </Card>
        ) : null}

        {canViewInvitedUsers ? (
          <Card
            title="邀请用户"
            styles={{ body: { padding: 0 } }}
            style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadowTertiary }}
          >
            <div className="w-full h-80">
              <TablePage
                table={invitedUsersTable}
                pagination={false}
                columns={invitedUserColumns}
                cardProps={{ ghost: true }}
                showSearch={false}
              />
            </div>
          </Card>
        ) : null}
      </Flex>
      {canViewInvitationCodes && canCreateInvitationCode ? (
        <HandleCode
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => {
            setOpen(false);
            refresh();
            if (canViewInvitedUsers) {
              refreshInvitedUsers();
            }
          }}
        />
      ) : null}
    </FullPageContainer>
  );
};

export default UserCenter;
