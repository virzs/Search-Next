import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import { getProviderOptions } from "@/services/ai/providers";
import { getRequestLogsList } from "@/services/ai/request-logs";
import { getUsers } from "@/services/user";
import { formatDateString } from "@/utils/utils";
import { useRequest } from "ahooks";
import { DatePicker, Select, Space, Tag } from "antd";

const RequestLogs = () => {
  const table = useTablePage(getRequestLogsList);
  const { data: providers = [] } = useRequest(getProviderOptions);
  const { data: usersRes } = useRequest(() => getUsers({ page: 1, pageSize: 200 }));
  const users = usersRes?.data || [];

  const applyFilter = (values: any) => {
    const nextParams = {
      ...table.params,
      ...values,
      page: 1,
    };
    Object.keys(nextParams).forEach((key) => {
      if (nextParams[key] === undefined || nextParams[key] === "") delete nextParams[key];
    });
    table.run(nextParams);
  };

  const columns: WindowTableColumnType<any>[] = [
    { title: "时间", dataIndex: "createdAt", render: (value) => formatDateString(value) },
    { title: "模型", dataIndex: "modelName" },
    { title: "上游模型", dataIndex: "upstreamModel" },
    { title: "服务商", dataIndex: ["provider", "displayName"] },
    { title: "所属用户", dataIndex: ["ownerUser", "username"] },
    { title: "Key", dataIndex: "consumerKeyPreview" },
    {
      title: "状态",
      dataIndex: "status",
      render: (value) => (value === "success" ? <Tag color="green">成功</Tag> : <Tag color="red">失败</Tag>),
    },
    { title: "流式", dataIndex: "stream", render: (value) => (value ? "是" : "否") },
    { title: "Prompt", dataIndex: "promptTokens" },
    { title: "Completion", dataIndex: "completionTokens" },
    { title: "Total", dataIndex: "totalTokens" },
    { title: "用户扣费", dataIndex: "chargedIntegral" },
    { title: "上游成本", dataIndex: "upstreamCost" },
    {
      title: "扣费状态",
      dataIndex: "billingStatus",
      render: (value) => {
        const color = value === "charged" ? "green" : value === "no_usage" ? "orange" : value === "failed" ? "red" : undefined;
        return <Tag color={color}>{value || "-"}</Tag>;
      },
    },
    { title: "余额前", dataIndex: "balanceBefore" },
    { title: "余额后", dataIndex: "balanceAfter" },
    { title: "Fallback", dataIndex: "isFallback", render: (value) => (value ? "是" : "否") },
    { title: "耗时(ms)", dataIndex: "latencyMs" },
    { title: "错误", dataIndex: "errorMessage" },
  ];

  return (
    <TablePageContainer>
      <TablePage table={table} columns={columns} showSearch searchPlaceholder="搜索模型">
        <Space>
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 100 }}
            options={[
              { label: "成功", value: "success" },
              { label: "失败", value: "error" },
            ]}
            onChange={(status) => applyFilter({ status })}
          />
          <Select
            allowClear
            showSearch
            placeholder="服务商"
            style={{ width: 180 }}
            options={providers.map((provider: any) => ({
              label: provider.displayName || provider.name,
              value: provider._id,
            }))}
            onChange={(provider) => applyFilter({ provider })}
          />
          <Select
            allowClear
            showSearch
            placeholder="所属用户"
            style={{ width: 180 }}
            options={users.map((user: any) => ({
              label: `${user.username} (${user.email})`,
              value: user._id,
            }))}
            onChange={(ownerUser) => applyFilter({ ownerUser })}
          />
          <Select
            allowClear
            placeholder="扣费"
            style={{ width: 120 }}
            options={[
              { label: "已扣费", value: "charged" },
              { label: "无用量", value: "no_usage" },
              { label: "未扣费", value: "not_charged" },
              { label: "失败", value: "failed" },
            ]}
            onChange={(billingStatus) => applyFilter({ billingStatus })}
          />
          <DatePicker.RangePicker
            showTime
            onChange={(dates) =>
              applyFilter({
                startDate: dates?.[0]?.toISOString(),
                endDate: dates?.[1]?.toISOString(),
              })
            }
          />
        </Space>
      </TablePage>
    </TablePageContainer>
  );
};

export default RequestLogs;
