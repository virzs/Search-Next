import { useTablePage } from "@/hooks/useTablePage2";
import {
  getDesktopWallpaperPreviewUrl,
  getDesktopWallpapers,
  type DesktopWallpaper,
} from "@/services/tabs/desktop/wallpaper";
import { Checkbox, Empty, Input, Modal, Pagination, Spin, Tag } from "antd";
import { FC, useEffect, useState } from "react";

interface WallpaperSelectModalProps {
  open: boolean;
  value?: DesktopWallpaper[];
  onOk: (wallpapers: DesktopWallpaper[]) => void | Promise<void>;
  onCancel: () => void;
}

const WallpaperSelectModal: FC<WallpaperSelectModalProps> = ({
  open,
  value,
  onOk,
  onCancel,
}) => {
  const [selectedMap, setSelectedMap] = useState<Map<string, DesktopWallpaper>>(
    new Map(),
  );
  const [keyword, setKeyword] = useState("");
  const table = useTablePage<DesktopWallpaper>(getDesktopWallpapers, {
    pathname: "/tabs/wallpaper-collection-select-modal",
    defaultParams: { page: 1, pageSize: 200, isActive: true },
  });
  const {
    data = [],
    total = 0,
    current,
    setCurrent,
    pageSize,
    setPageSize,
    loading,
  } = table;

  useEffect(() => {
    if (!open) return;
    setSelectedMap(() => {
      const next = new Map<string, DesktopWallpaper>();
      for (const wallpaper of value ?? []) {
        if (wallpaper?._id) next.set(wallpaper._id, wallpaper);
      }
      return next;
    });
    table.run({ ...table.params, page: 1, isActive: true });
  }, [open, value]);

  const toggleSelect = (wallpaper: DesktopWallpaper, checked?: boolean) => {
    if (!wallpaper._id) return;
    setSelectedMap((previous) => {
      const next = new Map(previous);
      if (checked ?? !next.has(wallpaper._id!)) {
        next.set(wallpaper._id!, wallpaper);
      } else {
        next.delete(wallpaper._id!);
      }
      return next;
    });
  };

  const handleSearch = (value: string) => {
    const search = value.trim();
    setKeyword(search);
    table.run({
      ...table.params,
      page: 1,
      isActive: true,
      search: search || undefined,
    });
  };

  return (
    <Modal
      open={open}
      width={920}
      title="选择壁纸"
      okText="确定"
      onCancel={onCancel}
      onOk={() => onOk(Array.from(selectedMap.values()))}
    >
      <div className="min-h-[540px]">
        <Input.Search
          allowClear
          className="mb-4"
          placeholder="搜索壁纸名称、作者或简介"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onSearch={handleSearch}
          onClear={() => handleSearch("")}
        />

        <Spin spinning={loading} className="w-full">
          {data.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {data.map((wallpaper) => {
                const id = wallpaper._id || "";
                const selected = Boolean(id && selectedMap.has(id));
                const previewUrl = getDesktopWallpaperPreviewUrl(wallpaper);
                return (
                  <button
                    type="button"
                    key={id}
                    className={`overflow-hidden rounded-lg border bg-white text-left transition-colors ${
                      selected
                        ? "border-[var(--ant-color-primary)]"
                        : "border-black/10 hover:border-black/25"
                    }`}
                    onClick={() => toggleSelect(wallpaper)}
                  >
                    <div className="aspect-video bg-black/5">
                      {wallpaper.type === "gradient" && wallpaper.css ? (
                        <div
                          className="h-full w-full"
                          style={{ background: wallpaper.css }}
                        />
                      ) : previewUrl ? (
                        <img
                          src={previewUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 p-3">
                      <Checkbox
                        checked={selected}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          toggleSelect(wallpaper, event.target.checked)
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">
                          {wallpaper.name || "未命名壁纸"}
                        </div>
                        <Tag className="mt-1" bordered={false}>
                          {wallpaper.type === "application"
                            ? "网页壁纸"
                            : wallpaper.type === "gradient"
                              ? "渐变壁纸"
                              : "图片壁纸"}
                        </Tag>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <Empty className="mt-20" description="暂无可添加壁纸" />
          )}
        </Spin>

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm">已选择：{selectedMap.size} 项</span>
          <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            pageSizeOptions={[100, 200, 500, 1000]}
            onChange={(page, size) => {
              if (size !== pageSize) {
                setCurrent(1);
                setPageSize(size);
                return;
              }
              setCurrent(page);
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default WallpaperSelectModal;
