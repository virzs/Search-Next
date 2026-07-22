import TablePageContainer from "@/components/containter/table";
import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { WindowTableColumnType } from "@/components/WindowTable";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  deleteDesktopWallpaperCollection,
  getDesktopWallpaperCollections,
  type DesktopWallpaperCollection,
} from "@/services/tabs/desktop/wallpaper-collection";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { App, Button, Modal, Switch, Tag } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { TabsPaths } from "../../router";

const WallpaperCollectionIndex = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [modal, contextHolder] = Modal.useModal();
  const [onlyActive, setOnlyActive] = useState(true);
  const table = useTablePage(getDesktopWallpaperCollections, {
    defaultParams: useMemo(() => ({ active: "true" }), []),
  });
  const { refresh, params } = table;
  const { runAsync: deleteRun } = useRequest(deleteDesktopWallpaperCollection, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      refresh();
    },
  });

  const columns: WindowTableColumnType<DesktopWallpaperCollection>[] = [
    { title: "名称", dataIndex: "title", render: (value) => value || "-" },
    {
      title: "合集类型",
      dataIndex: "type",
      width: 100,
      render: (value) => (
        <Tag color={value === "dynamic" ? "blue" : undefined}>
          {value === "dynamic" ? "动态" : "静态"}
        </Tag>
      ),
    },
    {
      title: "简介",
      dataIndex: "description",
      ellipsis: true,
      render: (value) => value || "-",
    },
    {
      title: "推荐",
      dataIndex: "featured",
      width: 80,
      render: (value) => (value ? "是" : "否"),
    },
    { title: "排序", dataIndex: "sort", width: 80 },
    {
      title: "预览数",
      dataIndex: "itemLimit",
      width: 90,
      render: (value) => value ?? 8,
    },
    {
      title: "壁纸数",
      dataIndex: "wallpapers",
      width: 120,
      render: (value, record) =>
        record.type === "dynamic"
          ? "按规则生成"
          : Array.isArray(value)
            ? value.length
            : 0,
    },
    {
      title: "是否启用",
      dataIndex: "enable",
      width: 100,
      render: (value) => (value ? "是" : "否"),
    },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Operation
          columns={[
            {
              title: "详情",
              onClick: () =>
                navigate(
                  `${TabsPaths.wallpaperCollectionDetail}/${record._id}`,
                ),
            },
            {
              title: "修改",
              onClick: () =>
                navigate(
                  `${TabsPaths.wallpaperCollectionHandle}/${record._id}`,
                ),
            },
            {
              title: "删除",
              danger: true,
              onClick: () => {
                modal.confirm({
                  title: "确认删除？",
                  content: "删除后不可恢复",
                  onOk: () => record._id && deleteRun(record._id),
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
        rowKey="_id"
        table={table}
        showSearch
        columns={columns}
        button={
          <Button
            type="primary"
            icon={<RiAddLine size={16} />}
            onClick={() => navigate(TabsPaths.wallpaperCollectionHandle)}
          >
            新增壁纸合集
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

export default WallpaperCollectionIndex;
