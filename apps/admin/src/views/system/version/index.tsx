import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import TablePageContainer from "@/components/containter/table";
import { useTablePage } from "@/hooks/useTablePage2";
import { deleteVersion, getVersion } from "@/services/system/version";
import { Button, Space, Tag, message } from "antd";
import { SystemPaths } from "../router";
import { useNavigate } from "react-router";
import { useRequest } from "ahooks";
import { PlusOutlined } from "@ant-design/icons";
import { getPlatformDicLabel, getUpdateTypeDicLabel } from "./dic";
import { WindowTableColumnType } from "@/components/WindowTable";

const Version = () => {
  const navigate = useNavigate();
  const table = useTablePage(getVersion);

  const { refresh } = table;

  const { loading: delLoading, run: delRun } = useRequest(deleteVersion, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "版本号",
      dataIndex: "version",
    },
    {
      title: "发布平台",
      dataIndex: "platform",
      render: (_, r) => (
        <Space>
          {r.platforms.map((i: any) => (
            <Tag>
              {getPlatformDicLabel(i.platform)} ({getUpdateTypeDicLabel(i.updateType)})
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "预定发布日期",
      dataIndex: "releaseTime",
      render: (v) => {
        return v === "-" ? "立即生效" : v;
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
      width: 120,
      render: (_, r) => {
        const { _id } = r;
        return (
          <Operation
            columns={[
              {
                title: "修改",
                onClick: () => {
                  navigate(SystemPaths.versionHandle + "/" + r._id);
                },
              },
              {
                title: "删除",
                loading: delLoading,
                danger: true,
                confirm: "delete",
                onClick: () => delRun(_id),
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
            icon={<PlusOutlined />}
            onClick={() => {
              navigate(SystemPaths.versionHandle);
            }}
          >
            新增版本
          </Button>
        }
        onRow={(r) => ({
          onClick: () => {
            navigate(SystemPaths.version + "/" + r._id);
          },
        })}
      />
    </TablePageContainer>
  );
};

export default Version;
