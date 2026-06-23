import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { useTablePage } from "@/hooks/useTablePage2";
import { delWebsiteTag, getWebsiteTag } from "@/services/tabs/website_tag";
import { useRequest } from "ahooks";
import { message, Modal, Image, Tag } from "antd";
import { useState } from "react";
import TagHandle from "./handle";
import { WindowTableColumnType } from "@/components/WindowTable";

const { useModal } = Modal;

const WebsiteTag = () => {
  const [modal, contextHolder] = useModal();
  const table = useTablePage(getWebsiteTag);

  const { refresh } = table;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const { runAsync: delRun } = useRequest(delWebsiteTag, {
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
      title: "排序",
      dataIndex: "sort",
      width: 80,
    },
    {
      title: "关联网站",
      dataIndex: "websites",
      render: (websites: any) => {
        if (!websites || websites.length === 0) return "-";
        return (
          <div className="flex flex-wrap gap-1">
            {websites.slice(0, 3).map((website: any, index: number) => (
              <Tag key={index}>{website.name}</Tag>
            ))}
            {websites.length > 3 && <Tag>+{websites.length - 3}</Tag>}
          </div>
        );
      },
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
        rowKey="_id"
        table={table}
        columns={columns}
        button={
          <TagHandle
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
      {contextHolder}
    </TablePageContainer>
  );
};

export default WebsiteTag;
