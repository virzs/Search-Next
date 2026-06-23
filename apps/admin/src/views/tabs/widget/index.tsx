import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import { delWidget, getWidget, updateWidgetEnable } from "@/services/tabs/widget";
import { message, Button, Tag } from "antd";
import { useRequest } from "ahooks";
import { useNavigate } from "react-router";
import { RiAddLine } from "@remixicon/react";
import { TabsPaths } from "../router";
import { useState } from "react";
import WidgetVersionModal from "./version-modal";

const WidgetIndex = () => {
  const navigate = useNavigate();
  const table = useTablePage(getWidget);
  const { refresh } = table;
  const [versionTarget, setVersionTarget] = useState<any>(null);

  const { runAsync: delRun } = useRequest(delWidget, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const { runAsync: updateEnableRun } = useRequest(updateWidgetEnable, {
    manual: true,
    onSuccess: () => {
      message.success("操作成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "简介",
      dataIndex: "description",
    },
    {
      title: "分类",
      dataIndex: "classify",
      render: (c: any) => c?.name ?? "-",
    },
    // 版本号列
    {
      title: "版本",
      dataIndex: "version",
      width: 80,
      render: (text: string) => text || "-",
    },
    // 作者列
    {
      title: "作者",
      dataIndex: "author",
      width: 100,
      render: (text: string) => text || "-",
    },
    // 图标模式支持状态列
    {
      title: "图标模式",
      dataIndex: "supportIconMode",
      width: 90,
      render: (val: boolean) => val ? "支持" : "不支持",
    },
    // 标签展示列
    {
      title: "标签",
      dataIndex: "tags",
      width: 150,
      render: (tags: string[]) => tags?.length ? tags.join("、") : "-",
    },
    {
      title: "是否启用",
      dataIndex: "enable",
      render: (text) => (text ? "是" : "否"),
      width: 100,
    },
    {
      title: "来源",
      dataIndex: "sourceType",
      width: 110,
      render: (value: string) => value === "snwidget" ? <Tag color="blue">snwidget</Tag> : <Tag>legacy</Tag>,
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 220,
      render: (_: any, record: any) => (
        <Operation
          columns={[
            {
              title: "修改",
              onClick: () => navigate(TabsPaths.widgetHandle + "/" + record._id),
            },
            {
              title: "版本",
              onClick: () => setVersionTarget(record),
            },
            {
              title: record.enable ? "禁用" : "启用",
              confirm: record.enable ? { title: "确认禁用?", content: "禁用后前台将不再展示该小组件" } : undefined,
              onClick: async () => {
                await updateEnableRun(record._id);
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
      ),
    },
  ];

  return (
    <TablePageContainer>
      <TablePage
        table={table}
        columns={columns}
        button={
          <Button type="primary" icon={<RiAddLine size={16} />} onClick={() => navigate(TabsPaths.widgetHandle)}>
            新增
          </Button>
        }
      />
      <WidgetVersionModal
        open={!!versionTarget}
        widgetId={versionTarget?._id}
        widgetName={versionTarget?.name}
        onClose={() => setVersionTarget(null)}
        onPublished={refresh}
      />
    </TablePageContainer>
  );
};

export default WidgetIndex;
