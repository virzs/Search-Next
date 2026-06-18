import { DefaultAppView } from "@/components";
import { useRequest } from "ahooks";
import { Button, Empty, Pagination, Skeleton } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import {
  getWallpaperImageUrl,
  getUserWallpaperCategories,
  getUserWallpapers,
  type WallpaperApiItem,
  type WallpaperCategoryApiItem,
} from "@/services/desktop";
import PreviewCard from "../components/PreviewCard";
import { css } from "@emotion/css";

const wallpaperCategoryClassName = css`
  .apple-theme-action.ant-btn-primary:not(:disabled) {
    border-color: #007aff !important;
    background: #007aff !important;
    box-shadow: 0 8px 18px rgba(0, 122, 255, 0.2);
  }
`;

const WallpaperCategoryView: FC = () => {
  const { id } = useParams();
  const categoryId = id ? decodeURIComponent(String(id)) : "";
  const { personalization, setWallpaper } = useDesktopTheme();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const { data: categories, loading: categoryLoading } = useRequest(
    getUserWallpaperCategories,
  );

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  const { data: wallpapersPage, loading: wallpaperLoading } = useRequest(
    () => getUserWallpapers({ page, pageSize, categoryId: categoryId || undefined }),
    { ready: Boolean(categoryId), refreshDeps: [categoryId, page, pageSize] },
  );

  const activeCategory = useMemo(() => {
    const items: WallpaperCategoryApiItem[] = categories ?? [];
    return items.find((c) => c._id === categoryId) ?? null;
  }, [categories, categoryId]);

  const visibleWallpapers = useMemo(() => {
    return ((wallpapersPage as any)?.data as WallpaperApiItem[]) ?? [];
  }, [wallpapersPage]);

  const total = useMemo(() => {
    return (wallpapersPage as any)?.total ?? 0;
  }, [wallpapersPage]);

  const isImageActive = (url: string) => {
    return (
      personalization.wallpaper.type === "image" &&
      personalization.wallpaper.url === url
    );
  };

  const handleSelectImage = (wallpaper: WallpaperApiItem) => {
    const url = getWallpaperImageUrl(wallpaper);
    if (!url) return;
    setWallpaper({ type: "image", url, name: wallpaper.name });
  };

  return (
    <DefaultAppView
      className={`h-full ${wallpaperCategoryClassName}`}
      animate
      title={
        activeCategory?.name ? (
          activeCategory.name
        ) : (
          <Skeleton.Input active size="small" style={{ width: 180 }} />
        )
      }
      contentClassName="overflow-y-auto px-6 pb-8 pt-3 max-[640px]:px-4"
    >
      {categoryLoading || wallpaperLoading ? (
        <div className="h-[220px] w-full flex items-center justify-center">
          <div className="text-sm text-gray-500">正在加载壁纸…</div>
        </div>
      ) : visibleWallpapers.length ? (
        <div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWallpapers.map((w) => {
              const url = getWallpaperImageUrl(w);
              const active = url ? isImageActive(url) : false;
              return (
                <PreviewCard
                  key={w._id}
                  active={active}
                  disabled={!url}
                  title={w.name}
                  description={
                    active
                      ? "当前使用"
                      : w.description || (url ? "图片壁纸" : "资源不可用")
                  }
                  status={
                    active ? (
                      <span className="rounded-full bg-[#e9f3ff] px-2 py-0.5 text-[11px] font-bold text-[#007aff]">
                        当前
                      </span>
                    ) : null
                  }
                  action={
                    url ? (
                      <Button
                        size="small"
                        type={active ? "default" : "primary"}
                        shape="round"
                        disabled={active}
                        className={active ? undefined : "apple-theme-action"}
                        onClick={() => handleSelectImage(w)}
                      >
                        {active ? "已应用" : "应用"}
                      </Button>
                    ) : null
                  }
                  cover={
                    url ? (
                      <img
                        className="h-full w-full object-cover"
                        src={url}
                        alt={w.name}
                      />
                    ) : (
                      <div className="h-full w-full bg-black/5" />
                    )
                  }
                />
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showQuickJumper
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                if (nextPageSize !== pageSize) setPageSize(nextPageSize);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="h-[220px] w-full flex items-center justify-center">
          <Empty description="暂无壁纸" />
        </div>
      )}
    </DefaultAppView>
  );
};

export default WallpaperCategoryView;
