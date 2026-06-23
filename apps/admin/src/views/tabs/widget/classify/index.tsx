import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { useTablePage } from "@/hooks/useTablePage2";
import { delWidgetClassify, getWidgetClassify, updateWidgetClassifyEnable } from "@/services/tabs/widget_classify";
import { useRequest } from "ahooks";
import { message, Image, App } from "antd";
import { useState } from "react";
import { WindowTableColumnType } from "@/components/WindowTable";
import ClassifyHandle from "./handle";

const WidgetClassify = () => {
  const { modal } = App.useApp();
  const table = useTablePage(getWidgetClassify);
  const { refresh } = table;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const { runAsync: updateEnableRun } = useRequest(updateWidgetClassifyEnable, {
    manual: true,
    onSuccess: () => {
      message.success("切换启用状态成功");
      refresh();
    },
  });

  const { runAsync: delRun } = useRequest(delWidgetClassify, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "名称",
      dataIndex: "name",
      render: (text, r) => {
        return (
          <div className="flex gap-2 items-center">
            {r.icon?.url ? (
              <Image preview={false} loading="lazy" src={r.icon.url} alt="" style={{ width: 36, height: 36 }} />
            ) : (
              ""
            )}
            {text}
          </div>
        );
      },
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "是否启用",
      dataIndex: "enable",
      render: (text) => (text ? "是" : "否"),
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      render: (_: any, record: any) => (
        <Operation
          columns={[
            {
              title: record.enable ? "禁用" : "启用",
              onClick: async () => {
                await updateEnableRun(record._id);
              },
              confirm: {
                title: `确认${record.enable ? "禁用" : "启用"}吗？`,
                content: `${record.enable ? "禁用后，该分类将无法使用" : "启用后，该分类将可以使用"}。是否继续？`,
              },
            },
            {
              title: "修改",
              onClick: () => {
                setOpen(true);
                setEditId(record._id);
              },
            },
            {
              title: "删除",
              danger: true,
              onClick: () => {
                modal.confirm({
                  title: "确认删除?",
                  content: "删除后不可恢复",
                  onOk: async () => {
                    await delRun(record._id);
                  },
                });
              },
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
        pagination={false}
        expandable={{
          childrenColumnName: "children",
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: setExpandedKeys,
          indentSize: 24,
        }}
        button={
          <ClassifyHandle
            open={open}
            editId={editId}
            onFinished={() => {
              refresh();
            }}
            onClose={() => {
              setOpen(false);
              setEditId(undefined);
            }}
          />
        }
      />
    </TablePageContainer>
  );
};

export default WidgetClassify;
