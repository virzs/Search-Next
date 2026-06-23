import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import { delWebsiteCollection, getWebsiteCollection } from "@/services/tabs/website_collection";
import { App, Button, Modal, Switch } from "antd";
import { useMemo, useState } from "react";
import { RiAddLine } from "@remixicon/react";
import { useNavigate } from "react-router";
import { TabsPaths } from "../../router";
import { useRequest } from "ahooks";

const { useModal } = Modal;

const WebsiteCollection = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [modal, contextHolder] = useModal();
  const [onlyActive, setOnlyActive] = useState(true);

  const table = useTablePage(getWebsiteCollection, {
    defaultParams: useMemo(() => ({ active: "true" }), []),
  });
  const { refresh, params } = table;

  const { runAsync: delRun } = useRequest(delWebsiteCollection, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "名称",
      dataIndex: "title",
      render: (text) => text ?? "-",
    },
    {
      title: "简介",
      dataIndex: "description",
      render: (text) => text ?? "-",
    },
    {
      title: "排序",
      dataIndex: "sort",
      width: 80,
    },
    {
      title: "是否启用",
      dataIndex: "enable",
      width: 100,
      render: (v) => (v ? "是" : "否"),
    },
    {
      title: "生效开始",
      dataIndex: "effectiveStart",
      render: (v) => (v ? String(v).slice(0, 19).replace("T", " ") : "-"),
    },
    {
      title: "生效结束",
      dataIndex: "effectiveEnd",
      render: (v) => (v ? String(v).slice(0, 19).replace("T", " ") : "-"),
    },
    {
      title: "网站数",
      dataIndex: "websites",
      width: 100,
      render: (v, record: any) => {
        if (record?.type === "dynamic") return "动态规则自动生成";
        return Array.isArray(v) ? v.length : 0;
      },
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 180,
      render: (_: any, record: any) => (
        <Operation
          columns={[
            {
              title: "详情",
              onClick: () => navigate(`${TabsPaths.websiteCollectionDetail}/${record._id}`),
            },
            {
              title: "修改",
              onClick: () => navigate(`${TabsPaths.websiteCollectionHandle}/${record._id}`),
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
      <TablePage<any>
        rowKey="_id"
        table={table}
        showSearch
        columns={columns}
        button={
          <Button type="primary" icon={<RiAddLine size={16} />} onClick={() => navigate(TabsPaths.websiteCollectionHandle)}>
            新增
          </Button>
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">仅生效中</span>
          <Switch
            checked={onlyActive}
            onChange={(checked) => {
              setOnlyActive(checked);
              table.run({
                ...params,
                page: 1,
                active: checked ? "true" : "false",
              });
            }}
          />
        </div>
      </TablePage>
      {contextHolder}
    </TablePageContainer>
  );
};

export default WebsiteCollection;
