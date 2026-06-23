import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { App, Button, Image, Space, Tooltip } from "antd";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import WebsiteHandle from "./handle";
import { useTablePage } from "@/hooks/useTablePage2";
import { useState } from "react";
import { deleteWebsite, getWebsiteList, updateWebsitePublic } from "@/services/tabs/website";
import { useRequest } from "ahooks";
import { WindowTableColumnType } from "@/components/WindowTable";

const Website = () => {
  const { message } = App.useApp();

  const table = useTablePage(getWebsiteList);

  const { refresh, selectedRowKeys } = table;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const { runAsync: publicRun } = useRequest(updateWebsitePublic, {
    manual: true,
    onSuccess: () => {
      message.success("操作成功");
      refresh();
    },
  });

  const { runAsync: delRun } = useRequest(deleteWebsite, {
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
        const iconUrl = r.iconEdited?.url ?? r.icon?.url;
        return (
          <div className="flex gap-2 items-center w-full">
            {iconUrl ? (
              <Tooltip
                placement="topLeft"
                title={
                  <Image className="!w-9 !h-9 object-contain" preview={false} loading="lazy" src={iconUrl} alt="" />
                }
              >
                <span className="flex-1 w-0 whitespace-nowrap overflow-hidden text-ellipsis">{text}</span>
              </Tooltip>
            ) : (
              <span className="flex-1 w-0 whitespace-nowrap overflow-hidden text-ellipsis">{text}</span>
            )}
          </div>
        );
      },
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "URL",
      dataIndex: "url",
    },
    {
      title: "点击量",
      dataIndex: "click",
    },
    {
      title: "是否启用",
      dataIndex: "enable",
      render: (text) => (text ? "是" : "否"),
    },
    {
      title: "是否公开",
      dataIndex: "public",
      render: (text) => (text ? "是" : "否"),
    },
    {
      title: "所属分类",
      dataIndex: "classify",
      render: (_, r) => {
        return r.classify?.name;
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => {
        return (
          <Operation
            key={`operation-${record._id}`}
            columns={[
              {
                title: record.public ? "取消公开" : "公开",
                onClick: async () => {
                  await publicRun({
                    ids: [record._id],
                    isPublic: !record.public,
                  });
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
                onClick: async () => {
                  await delRun(record._id);
                },
                confirm: "delete",
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
          <Space>
            <WebsiteHandle
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
            {selectedRowKeys.length > 0 && (
              <>
                <Button
                  icon={<RiEyeLine size={16} />}
                  onClick={async () => {
                    await publicRun({ ids: selectedRowKeys as string[], isPublic: true });
                  }}
                >
                  批量公开
                </Button>
                <Button
                  icon={<RiEyeOffLine size={16} />}
                  onClick={async () => {
                    await publicRun({ ids: selectedRowKeys as string[], isPublic: false });
                  }}
                >
                  批量取消公开
                </Button>
              </>
            )}
          </Space>
        }
      />
    </TablePageContainer>
  );
};

export default Website;
