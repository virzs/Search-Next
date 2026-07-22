import TablePage from "@/components/TablePage2";
import Operation from "@/components/TablePage2/Operation";
import { useTablePage } from "@/hooks/useTablePage2";
import {
  deleteDesktopWallpaper,
  getDesktopWallpaperPreviewUrl,
  getDesktopWallpapers,
  toggleDesktopWallpaper,
  type DesktopWallpaper,
} from "@/services/tabs/desktop/wallpaper";
import { Button, message, Tooltip } from "antd";
import { useRequest } from "ahooks";
import { useNavigate } from "react-router";
import { RiAddLine } from "@remixicon/react";
import { TabsPaths } from "../router";
import { WindowTableColumnType } from "@/components/WindowTable";
import TablePageContainer from "@/components/containter/table";

const WallpaperNameCell = ({
  record,
  onOpen,
}: {
  record: DesktopWallpaper;
  onOpen: () => void;
}) => {
  const previewUrl = getDesktopWallpaperPreviewUrl(record);
  const name = record.name || record.application?.packageName || "未命名壁纸";
  const content = (
    <span
      role="link"
      tabIndex={0}
      className="block max-w-full cursor-pointer truncate font-medium text-[var(--ant-color-text)] outline-none focus-visible:text-[var(--ant-color-primary)]"
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onOpen();
      }}
    >
      {name}
    </span>
  );

  if (!previewUrl && record.type !== "gradient") return content;
  return (
    <Tooltip
      placement="right"
      mouseEnterDelay={0.25}
      title={
        <div className="h-[126px] w-[224px] overflow-hidden rounded-md bg-black/5">
          {record.type === "gradient" ? (
            <div className="h-full w-full" style={{ background: record.css }} />
          ) : (
            <img
              src={previewUrl || ""}
              alt={`${name}预览`}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      }
    >
      {content}
    </Tooltip>
  );
};

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

  const openDetail = (record: DesktopWallpaper) => {
    if (!record._id) return;
    navigate(`${TabsPaths.wallpaperDetail}/${record._id}`);
  };

  const columns: WindowTableColumnType<DesktopWallpaper>[] = [
    {
      title: "名称",
      dataIndex: "name",
      width: 180,
      render: (_, record) => (
        <WallpaperNameCell record={record} onOpen={() => openDetail(record)} />
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 100,
      render: (type) =>
        type === "application"
          ? "网页壁纸"
          : type === "gradient"
            ? "渐变壁纸"
            : "图片壁纸",
    },
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
      title: "版本",
      dataIndex: ["application", "version"],
      width: 100,
      render: (version) => version || "-",
    },
    {
      title: "作者",
      dataIndex: "author",
      width: 140,
      render: (author, record) => author || record.application?.author || "-",
    },
    {
      title: "项目",
      dataIndex: "url",
      width: 90,
      render: (url, record) => {
        const href = url || record.application?.projectUrl;
        return href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            查看
          </a>
        ) : (
          "-"
        );
      },
    },
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
        onRow={(record) => ({ onClick: () => openDetail(record) })}
        showSearch
        searchPlaceholder="搜索壁纸名称/描述/作者/URL"
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
