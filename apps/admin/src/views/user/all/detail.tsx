import FullPageContainer from "@/components/containter/full";
import {
  getUserDetail,
  type LegalConfirmationRecord,
  type UserRoleRecord,
} from "@/services/user";
import { UserOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import {
  Avatar,
  Card,
  Descriptions,
  Space,
  Table,
  Tag,
  theme,
  Typography,
} from "antd";
import { format } from "date-fns";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { getUserStatusColor, getUserStatusLabel } from "../utils";
import { UserPaths } from "../router";

const sourceLabels: Record<LegalConfirmationRecord["firstSource"], string> = {
  register: "注册",
  login: "登录",
  in_app: "应用内",
};

const documentOrder: Record<LegalConfirmationRecord["documentType"], number> = {
  terms: 0,
  privacy: 1,
};

const formatDate = (value?: string | Date) =>
  value ? format(new Date(value), "yyyy-MM-dd HH:mm:ss") : "-";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { data, loading, run } = useRequest(getUserDetail, { manual: true });

  useEffect(() => {
    if (!id) {
      navigate(UserPaths.all, { replace: true });
      return;
    }
    run(id);
  }, [id, navigate, run]);

  const confirmations = useMemo(
    () =>
      [...(data?.legalConfirmations ?? [])].sort(
        (a, b) => {
          const timeDifference =
            new Date(b.lastConfirmedAt).getTime() -
            new Date(a.lastConfirmedAt).getTime();
          return (
            timeDifference ||
            documentOrder[a.documentType] - documentOrder[b.documentType]
          );
        },
      ),
    [data?.legalConfirmations],
  );

  return (
    <FullPageContainer loading={loading}>
      {data ? (
        <div className="mx-auto max-w-6xl space-y-5">
          <Card
            className="overflow-hidden"
            styles={{ body: { padding: 0 } }}
          >
            <div
              className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
              style={{
                background: `linear-gradient(135deg, ${token.colorBgContainer}, ${token.colorInfoBg})`,
              }}
            >
              <Space size="large">
                <Avatar
                  size={72}
                  icon={<UserOutlined />}
                  style={{ background: token.colorPrimary }}
                />
                <div>
                  <Typography.Title level={3} className="mb-1!">
                    {data.username}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {data.email}
                  </Typography.Text>
                </div>
              </Space>
              <Space wrap>
                <Tag color={getUserStatusColor(data.status ?? 0)}>
                  {getUserStatusLabel(data.status ?? 0)}
                </Tag>
                <Tag color={data.enable ? "green" : "red"}>
                  {data.enable ? "已启用" : "已禁用"}
                </Tag>
              </Space>
            </div>
          </Card>

          <Card title="账号信息">
            <Descriptions
              column={{ xs: 1, sm: 2, lg: 3 }}
              items={[
                {
                  key: "id",
                  label: "用户 ID",
                  children: (
                    <Typography.Text copyable code>
                      {data._id}
                    </Typography.Text>
                  ),
                },
                { key: "username", label: "用户名", children: data.username },
                { key: "email", label: "邮箱", children: data.email },
                {
                  key: "nickname",
                  label: "昵称",
                  children: data.nickname || "-",
                },
                {
                  key: "roles",
                  label: "角色",
                  children: data.roles?.length
                    ? data.roles.map((role: UserRoleRecord) => (
                        <Tag
                          key={role._id ?? role.name}
                          color={role.isSuperAdmin ? "red" : undefined}
                        >
                          {role.name}
                        </Tag>
                      ))
                    : "-",
                },
                {
                  key: "type",
                  label: "账号类型",
                  children: data.type === 0 ? "管理员" : "普通用户",
                },
                {
                  key: "integral",
                  label: "积分",
                  children: data.integral ?? 0,
                },
                {
                  key: "createdAt",
                  label: "创建时间",
                  children: formatDate(data.createdAt),
                },
                {
                  key: "updatedAt",
                  label: "更新时间",
                  children: formatDate(data.updatedAt),
                },
              ]}
            />
          </Card>

          <Card
            title="协议确认记录"
            extra={
              <Typography.Text type="secondary">
                共 {confirmations.length} 条
              </Typography.Text>
            }
            styles={{ body: { padding: 0 } }}
          >
            <Table<LegalConfirmationRecord>
              rowKey={(record) => record.revisionId}
              dataSource={confirmations}
              pagination={false}
              scroll={{ x: 1120 }}
              locale={{ emptyText: "暂无协议确认记录" }}
              columns={[
                {
                  title: "文档",
                  dataIndex: "documentType",
                  width: 110,
                  render: (value) => (
                    <Tag color={value === "terms" ? "green" : "blue"}>
                      {value === "terms" ? "服务条款" : "隐私政策"}
                    </Tag>
                  ),
                },
                {
                  title: "确认版本",
                  dataIndex: "consentVersion",
                  width: 100,
                  render: (value) => `V${value}`,
                },
                {
                  title: "首次确认",
                  dataIndex: "firstConfirmedAt",
                  width: 180,
                  render: formatDate,
                },
                {
                  title: "首次来源",
                  dataIndex: "firstSource",
                  width: 100,
                  render: (value) => sourceLabels[value],
                },
                {
                  title: "最近确认",
                  dataIndex: "lastConfirmedAt",
                  width: 180,
                  render: formatDate,
                },
                {
                  title: "最近来源",
                  dataIndex: "lastSource",
                  width: 100,
                  render: (value) => sourceLabels[value],
                },
                {
                  title: "语言",
                  dataIndex: "locale",
                  width: 90,
                  render: (value) => value || "zh-CN",
                },
                {
                  title: "次数",
                  dataIndex: "confirmationCount",
                  width: 80,
                },
                {
                  title: "文档版本 ID",
                  dataIndex: "revisionId",
                  width: 240,
                  render: (value) => (
                    <Typography.Text copyable code>
                      {value}
                    </Typography.Text>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      ) : null}
    </FullPageContainer>
  );
};

export default UserDetail;
