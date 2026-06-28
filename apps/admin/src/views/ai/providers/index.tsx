import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { useTablePage } from "@/hooks/useTablePage2";
import { deleteProvider, getProvidersList } from "@/services/ai/providers";
import { useRequest } from "ahooks";
import { Button, message, Tag } from "antd";
import { WindowTableColumnType } from "@/components/WindowTable";
import { formatDateString } from "@/utils/utils";
import { useNavigate } from "react-router";
import { RiAddLine } from "@remixicon/react";

const PROVIDER_HANDLE_PATH = "/ai/providers/handle";

const Providers = () => {
  const navigate = useNavigate();
  const table = useTablePage(getProvidersList);

  const { refresh } = table;

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
      width: 150,
    },
    {
      title: "描述",
      dataIndex: "description",
      width: 120,
    },
    {
      title: "协议类型",
      dataIndex: "type",
      width: 150,
    },
    {
      title: "Base URL",
      dataIndex: "baseUrl",
      width: 180,
    },
    {
      title: "Key",
      dataIndex: "apiKeyPreview",
      width: 100,
    },
    {
      title: "优先级",
      dataIndex: "priority",
      width: 90,
    },
    {
      title: "是否启用",
      dataIndex: "enabled",
      width: 100,
      render: (text) => {
        return text ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>;
      },
    },
    {
      title: "测试",
      dataIndex: "lastTestStatus",
      width: 220,
      render: (_, record) => {
        if (!record.lastTestStatus) return "-";
        return (
          <Tag color={record.lastTestStatus === "success" ? "green" : "red"}>
            {record.lastTestMessage || record.lastTestStatus}
          </Tag>
        );
      },
    },
    {
      title: "测试时间",
      dataIndex: "lastTestedAt",
      width: 170,
      render: (value) => formatDateString(value),
    },
    {
      title: "更新人",
      dataIndex: "updater",
      width: 120,
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      width: 170,
      render: (value) => formatDateString(value),
    },
    {
      title: "操作",
      dataIndex: "operation",
      fixed: "right",
      width: 130,
      minWidth: 130,
      render: (_, record) => {
        return (
          <Operation
            columns={[
              {
                title: "修改",
                onClick: () => {
                  navigate(`${PROVIDER_HANDLE_PATH}/${record._id}`);
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
        showSearch
        button={
          <Button type="primary" icon={<RiAddLine size={16} />} onClick={() => navigate(PROVIDER_HANDLE_PATH)}>
            新增服务商
          </Button>
        }
      />
    </TablePageContainer>
  );
};

export default Providers;
