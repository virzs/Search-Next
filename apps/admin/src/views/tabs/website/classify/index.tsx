import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { useTablePage } from "@/hooks/useTablePage2";
import { delWebsiteClassify, getWebsiteClassify } from "@/services/tabs/website_classifty";
import { useRequest } from "ahooks";
import { message, Image, App } from "antd";
import { useState } from "react";
import ClassifyHandle from "./handle";
import { WindowTableColumnType } from "@/components/WindowTable";

const WebsiteClassify = () => {
  const { modal } = App.useApp();
  const table = useTablePage(getWebsiteClassify);

  const { refresh } = table;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [parent, setParent] = useState<string | undefined>(undefined);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(["1"]);

  const { runAsync: delRun } = useRequest(delWebsiteClassify, {
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
      render: (_, record) => {
        return (
          <Operation
            columns={[
              {
                title: "新增子分类",
                show: !record.parent,
                onClick: () => {
                  setParent(record._id);
                  setOpen(true);
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
                onClick: () => {
                  modal.confirm({
                    title: "确认删除?",
                    content: "删除后不可恢复",
                    onOk: async () => {
                      await delRun(record._id);
                    },
                  });
                },
                danger: true,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <TablePageContainer>
      <TablePage<any>
        table={table}
        columns={columns}
        pagination={false}
        expandable={{
          childrenColumnName: "children",
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: setExpandedKeys,
          onExpand: (expanded, record) => {
            console.log("展开状态改变:", expanded, record);
          },
          indentSize: 24,
        }}
        button={
          <ClassifyHandle
            parent={parent}
            open={open}
            editId={editId}
            onFinished={() => {
              refresh();
            }}
            onClose={() => {
              setOpen(false);
              setEditId(undefined);
              setParent(undefined);
            }}
          />
        }
      />
    </TablePageContainer>
  );
};

export default WebsiteClassify;
