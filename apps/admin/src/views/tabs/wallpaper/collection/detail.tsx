import FullPageContainer from "@/components/containter/full";
import {
  getDesktopWallpaperPreviewUrl,
  type DesktopWallpaper,
} from "@/services/tabs/desktop/wallpaper";
import { getDesktopWallpaperCollectionDetail } from "@/services/tabs/desktop/wallpaper-collection";
import { App, Button, Descriptions, Empty, Tag } from "antd";
import { useRequest } from "ahooks";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { TabsPaths } from "../../router";

const formatDate = (value?: string) =>
  value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-";

const WallpaperCollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { data, loading, run } = useRequest(
    getDesktopWallpaperCollectionDetail,
    {
      manual: true,
      onError: () => message.error("获取壁纸合集详情失败"),
    },
  );

  useEffect(() => {
    if (id) run(id);
  }, [id, run]);

  const collection = data as any;
  const wallpapers = (collection?.wallpapers ?? []) as DesktopWallpaper[];

  return (
    <FullPageContainer
      loading={loading}
      title={collection?.title || "壁纸合集详情"}
      cardProps={{
        extra: (
          <Button
            type="primary"
            onClick={() =>
              id && navigate(`${TabsPaths.wallpaperCollectionHandle}/${id}`)
            }
          >
            编辑
          </Button>
        ),
      }}
    >
      <div className="mx-auto max-w-6xl py-2">
        <Descriptions bordered size="small" column={{ xs: 1, lg: 2 }}>
          <Descriptions.Item label="名称">
            {collection?.title || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="合集类型">
            <Tag color={collection?.type === "dynamic" ? "blue" : undefined}>
              {collection?.type === "dynamic" ? "动态" : "静态"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="短标题">
            {collection?.kicker || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="展示样式">
            {collection?.layout === "compact" ? "紧凑列表" : "大卡故事"}
          </Descriptions.Item>
          <Descriptions.Item label="简介" span={2}>
            {collection?.description || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="是否启用">
            {collection?.enable ? "是" : "否"}
          </Descriptions.Item>
          <Descriptions.Item label="推荐大卡">
            {collection?.featured ? "是" : "否"}
          </Descriptions.Item>
          <Descriptions.Item label="预览数量">
            {collection?.itemLimit ?? 8}
          </Descriptions.Item>
          <Descriptions.Item label="排序">
            {collection?.sort ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="生效开始">
            {formatDate(collection?.effectiveStart)}
          </Descriptions.Item>
          <Descriptions.Item label="生效结束">
            {formatDate(collection?.effectiveEnd)}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDate(collection?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {formatDate(collection?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>

        <div className="mb-3 mt-6 text-sm font-medium">
          {collection?.type === "dynamic" ? "动态匹配壁纸" : "绑定壁纸"}（
          {wallpapers.length}）
        </div>
        {wallpapers.length ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {wallpapers.map((wallpaper) => {
              const preview = getDesktopWallpaperPreviewUrl(wallpaper);
              return (
                <div
                  key={wallpaper._id}
                  className="overflow-hidden rounded-lg border border-black/10"
                >
                  <div className="aspect-video bg-black/5">
                    {wallpaper.type === "gradient" && wallpaper.css ? (
                      <div
                        className="h-full w-full"
                        style={{ background: wallpaper.css }}
                      />
                    ) : preview ? (
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <span className="truncate font-medium">
                      {wallpaper.name || "未命名壁纸"}
                    </span>
                    <Tag bordered={false}>
                      {wallpaper.type === "application"
                        ? "网页"
                        : wallpaper.type === "gradient"
                          ? "渐变"
                          : "图片"}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty description="暂无壁纸" />
        )}
      </div>
    </FullPageContainer>
  );
};

export default WallpaperCollectionDetail;
