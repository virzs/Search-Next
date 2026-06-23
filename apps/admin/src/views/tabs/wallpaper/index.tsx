import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  deleteDesktopWallpaper,
  getDesktopWallpapers,
  toggleDesktopWallpaper,
} from "@/services/tabs/desktop/wallpaper";
import { Button, Image, message } from "antd";
import { useRequest } from "ahooks";
import { useNavigate } from "react-router";
import { RiAddLine } from "@remixicon/react";
import { TabsPaths } from "../router";
import { WindowTableColumnType } from "@/components/WindowTable";
import TablePageContainer from "@/components/containter/table";

const WallpaperIndex = () => {
  const navigate = useNavigate();
  const table = useTablePage(getDesktopWallpapers);
  const { refresh } = table;

  const { runAsync: toggleRun, loading: toggleLoading } = useRequest(
    toggleDesktopWallpaper,
    {
      manual: true,
      onSuccess: () => {
        message.success("操作成功");
        refresh();
      },
    },
  );

  const { runAsync: deleteRun, loading: deleteLoading } = useRequest(
    deleteDesktopWallpaper,
    {
      manual: true,
      onSuccess: () => {
        message.success("删除成功");
        refresh();
      },
    },
  );

  const columns: WindowTableColumnType<any>[] = [
    {
      title: "图片",
      dataIndex: "thumbnail",
      width: 92,
      render: (img: any) => {
        const src = typeof img === "string" ? img : img?.url;
        if (!src) return "-";
        return (
          <Image
            src={src}
            alt=""
            width={72}
            height={48}
            preview={false}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
        );
      },
    },
    { title: "名称", dataIndex: "name" },
    { title: "描述", dataIndex: "description" },
    {
      title: "分类",
      dataIndex: "categoryId",
      render: (cat: any) => {
        if (!cat) return "-";
        if (typeof cat === "string") return cat;
        return cat?.name ?? "-";
      },
    },
    { title: "排序", dataIndex: "sortOrder", width: 80 },
    {
      title: "是否启用",
      dataIndex: "isActive",
      width: 90,
      render: (v) => (v ? "是" : "否"),
    },
    {
      title: "创建人",
      dataIndex: "creator",
      render: (u: any) =>
        typeof u === "string" ? u : (u?.username ?? u?.name ?? "-"),
    },
    { title: "创建时间", dataIndex: "createdAt" },
    {
      title: "更新人",
      dataIndex: "updater",
      render: (u: any) =>
        typeof u === "string" ? u : (u?.username ?? u?.name ?? "-"),
    },
    { title: "更新时间", dataIndex: "updatedAt" },
    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
      width: 170,
      render: (_, record: any) => {
        return (
          <Operation
            columns={[
              {
                title: record.isActive ? "禁用" : "启用",
                loading: toggleLoading,
                onClick: async () => {
                  await toggleRun(record._id);
                },
              },
              {
                title: "修改",
                onClick: () => {
                  navigate(TabsPaths.wallpaperHandle + "/" + record._id);
                },
              },
              {
                title: "删除",
                danger: true,
                confirm: "delete",
                loading: deleteLoading,
                onClick: async () => {
                  await deleteRun(record._id);
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
        table={table}
        columns={columns}
        rowKey="_id"
        showSearch
        searchPlaceholder="搜索壁纸名称/描述"
        button={
          <Button
            type="primary"
            icon={<RiAddLine size={22} />}
            onClick={() => navigate(TabsPaths.wallpaperHandle)}
          >
            新增
          </Button>
        }
      />
    </TablePageContainer>
  );
};

export default WallpaperIndex;
