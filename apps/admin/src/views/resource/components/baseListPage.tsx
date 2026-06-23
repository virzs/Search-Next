import TablePageContainer from "@/components/containter/table";
import TablePage, { TablePageProps } from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { filesize } from "filesize";
import { FC } from "react";
import { Link } from "react-router";
import { ResourcePaths } from "../router";
import { Button, message } from "antd";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { resourceDelete } from "@/services/resource";
import { WindowTableColumnType } from "@/components/WindowTable";

export interface BaseListPageProps extends TablePageProps<any> {
  /** 替换 */
  onReplace?: (record: any) => void;
  /** 删除 */
  onDelete?: () => void;
  /** 新增 */
  onAdd?: () => void;
}

const BaseListPage: FC<BaseListPageProps> = (props) => {
  const { onReplace, onDelete, onAdd, children, ...rest } = props;

  const { runAsync: delRun } = useRequest(resourceDelete, {
    manual: true,
    onSuccess: () => {
      onDelete?.();
      message.success("删除成功");
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "文件名",
      dataIndex: "name",
      render: (_, r) => (
        <Link
          to={ResourcePaths.r2Detail.replace(":id", r._id)}
          className="whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {_}
        </Link>
      ),
    },
    {
      title: "文件路径",
      dataIndex: "dir",
    },
    {
      title: "文件类型",
      dataIndex: "mimetype",
    },
    {
      title: "文件大小",
      dataIndex: "size",
      render: (_) => {
        return Number.isInteger(_) ? filesize(_ as number) : "-";
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
      width: 80,
      render: (_, r) => {
        return (
          <Operation
            columns={[
              {
                type: "link",
                title: "删除",
                danger: true,
                confirm: {
                  type: "error",
                  title: "确认删除?",
                  content: "删除文件将会影响所有关联的数据，请谨慎操作",
                  okText: "确认",
                  cancelText: "取消",
                  onOk: () => {
                    return delRun(r._id);
                  },
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
        columns={columns}
        button={
          <Button
            onClick={() => {
              onAdd?.();
            }}
            icon={<RiAddLine size={16} />}
            type="primary"
          >
            新增
          </Button>
        }
        {...rest}
      />
      {children}
    </TablePageContainer>
  );
};

export default BaseListPage;
