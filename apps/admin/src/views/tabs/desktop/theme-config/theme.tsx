import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  deleteDesktopThemeConfig,
  getDesktopThemeConfig,
  toggleDesktopThemeConfig,
} from "@/services/tabs/desktop/theme-config";
import { RiAddLine } from "@remixicon/react";
import { App, Button, Tag } from "antd";
import { useRequest } from "ahooks";
import { useNavigate } from "react-router";
import { TabsPaths } from "../../router";

const DesktopThemeConfigTheme = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const table = useTablePage(getDesktopThemeConfig);

  const { refresh } = table;

  const { runAsync: toggleRun } = useRequest(toggleDesktopThemeConfig, {
    manual: true,
    onSuccess: () => {
      message.success("操作成功");
      refresh();
    },
  });

  const { runAsync: deleteRun } = useRequest(deleteDesktopThemeConfig, {
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
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "分类",
      dataIndex: "categoryId",
      width: 160,
      render: (v: any) => {
        const item = typeof v === "object" ? v : null;
        const name = item?.name ?? "-";
        return <Tag>{name}</Tag>;
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
      title: "是否启用",
      dataIndex: "isActive",
      render: (_, v) => {
        return v.isActive ? "是" : "否";
      },
    },
    {
      title: "操作",
      fixed: "right",
      width: 170,
      dataIndex: "actions",
      render: (_, r) => {
        return (
          <Operation
            columns={[
              {
                title: r.isActive ? "禁用" : "启用",
                onClick: async () => {
                  await toggleRun(r._id);
                },
                confirm: {
                  title: `确认${r.isActive ? "禁用" : "启用"}吗？`,
                  content: `${r.isActive ? "禁用" : "启用"}后，该主题配置将无法使用。是否继续？`,
                },
              },
              {
                title: "修改",
                onClick: () => {
                  navigate(TabsPaths.desktopThemeConfigHandle + `/${r._id}`);
                },
              },
              {
                title: "删除",
                danger: true,
                confirm: "delete",
                onClick: async () => {
                  await deleteRun(r._id);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <TablePage
      table={table}
      columns={columns}
      button={
        <Button
          type="primary"
          icon={<RiAddLine size={22} />}
          onClick={() => {
            navigate(TabsPaths.desktopThemeConfigHandle);
          }}
        >
          新增
        </Button>
      }
    />
  );
};

export default DesktopThemeConfigTheme;
