import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import TablePageContainer from "@/components/containter/table";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import { deleteNotice, getNotice } from "@/services/system/notice";
import { Button, Tag, message } from "antd";
import { useRequest } from "ahooks";
import { useNavigate } from "react-router";
import { SystemPaths } from "../router";
import { RiAddLine } from "@remixicon/react";

const Notice = () => {
  const navigate = useNavigate();
  const table = useTablePage(getNotice);
  const { refresh } = table;

  const { loading: delLoading, run: delRun } = useRequest(deleteNotice, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "标题",
      dataIndex: "title",
    },
    {
      title: "Key",
      dataIndex: "key",
      width: 180,
    },
    {
      title: "是否启用",
      dataIndex: "enable",
      width: 120,
      render: (v) => (v ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>),
    },
    {
      title: "生效开始",
      dataIndex: "effectiveStart",
      width: 180,
    },
    {
      title: "生效结束",
      dataIndex: "effectiveEnd",
      width: 180,
    },
    {
      title: "创建人",
      dataIndex: "creator",
      width: 140,
      render: (v) => (typeof v === "string" ? v : (v?.username ?? "-")),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 180,
    },
    {
      title: "更新人",
      dataIndex: "updater",
      width: 140,
      render: (v) => (typeof v === "string" ? v : (v?.username ?? "-")),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      width: 180,
    },
    {
      title: "操作",
      dataIndex: "operation",
      fixed: "right",
      width: 120,
      render: (_, r) => {
        return (
          <Operation
            columns={[
              {
                title: "修改",
                onClick: () => {
                  navigate(SystemPaths.noticeHandle + "/" + r._id);
                },
              },
              {
                title: "删除",
                loading: delLoading,
                confirm: "delete",
                danger: true,
                onClick: () => {
                  delRun(r._id);
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
          <Button
            type="primary"
            onClick={() => {
              navigate(SystemPaths.noticeHandle);
            }}
            icon={<RiAddLine size={16} />}
          >
            新增
          </Button>
        }
        onRow={(r) => ({
          onClick: () => {
            navigate(SystemPaths.notice + "/" + r._id);
          },
        })}
      />
    </TablePageContainer>
  );
};

export default Notice;
