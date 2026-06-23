import { useTablePage } from "@/hooks/useTablePage2";
import { resourceRecycleDelete, resourceRecycleList, resourceRestore } from "@/services/resource";
import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { filesize } from "filesize";
import { message } from "antd";
import { useRequest } from "ahooks";
import { WindowTableColumnType } from "@/components/WindowTable";

const RecyclePage = () => {
  const table = useTablePage(resourceRecycleList);

  const { refresh } = table;

  const { runAsync: restoreRun } = useRequest(resourceRestore, {
    manual: true,
    onSuccess: () => {
      message.success("恢复成功");
      refresh();
    },
  });

  const { runAsync: delRun } = useRequest(resourceRecycleDelete, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "文件名",
      dataIndex: "name",
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
      width: 120,
      render: (_, r) => {
        return (
          <Operation
            columns={[
              {
                title: "恢复",
                type: "link",
                confirm: {
                  title: "确认恢复?",
                  content: "恢复后将会移动到资源列表中",
                  onOk: () => restoreRun(r._id),
                },
              },
              {
                type: "link",
                title: "删除",
                danger: true,
                confirm: {
                  type: "error",
                  title: "确认删除?",
                  content: "删除后将同步删除对象存储中的文件且无法恢复",
                  okText: "确认",
                  cancelText: "取消",
                  onOk: () => delRun(r._id),
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
        table={table}
        button={<div className="text-gray-500">超过60天的数据将会自动清除</div>}
      />
    </TablePageContainer>
  );
};

export default RecyclePage;
