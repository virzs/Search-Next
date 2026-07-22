import FullPageContainer from "@/components/containter/full";
import {
  getApplicationWallpaperEntryUrl,
  getDesktopWallpaperDetail,
  getDesktopWallpaperPreviewUrl,
  type DesktopWallpaper,
} from "@/services/tabs/desktop/wallpaper";
import { RiEditLine, RiExternalLinkLine } from "@remixicon/react";
import {
  Alert,
  App,
  Button,
  Descriptions,
  Empty,
  Image,
  Segmented,
  Tag,
  Typography,
} from "antd";
import { useRequest } from "ahooks";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { TabsPaths } from "../router";

type PreviewMode = "static" | "runtime";

const getCategoryName = (value: DesktopWallpaper["categoryId"]) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || "-";
};

const getUserName = (value: any) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.username || value.name || "-";
};

const formatDate = (value?: string) =>
  value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-";

const WallpaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("static");

  const { data, loading, run } = useRequest(getDesktopWallpaperDetail, {
    manual: true,
    onError: () => message.error("获取壁纸详情失败"),
  });

  useEffect(() => {
    if (id) run(id);
  }, [id, run]);

  const wallpaper = data as DesktopWallpaper | undefined;
  const isWebWallpaper = wallpaper?.type === "application";
  const isGradientWallpaper = wallpaper?.type === "gradient";
  const previewUrl = getDesktopWallpaperPreviewUrl(wallpaper);
  const runtimeUrl =
    isWebWallpaper && wallpaper?.isActive
      ? getApplicationWallpaperEntryUrl(wallpaper)
      : null;
  const author = wallpaper?.author || wallpaper?.application?.author || "-";
  const projectUrl = wallpaper?.url || wallpaper?.application?.projectUrl;
  const description =
    wallpaper?.description || wallpaper?.application?.description || "-";

  useEffect(() => {
    if (!runtimeUrl) setPreviewMode("static");
  }, [runtimeUrl]);

  const previewOptions = useMemo(
    () => [
      { label: "静态预览", value: "static" as const },
      {
        label: "运行预览",
        value: "runtime" as const,
        disabled: !runtimeUrl,
      },
    ],
    [runtimeUrl],
  );

  return (
    <FullPageContainer
      loading={loading}
      title={wallpaper?.name || "壁纸详情"}
      cardProps={{
        extra: (
          <Button
            type="primary"
            icon={<RiEditLine size={16} />}
            onClick={() => {
              if (id) navigate(`${TabsPaths.wallpaperHandle}/${id}`);
            }}
          >
            修改
          </Button>
        ),
      }}
    >
      <div className="mx-auto w-full max-w-7xl py-2">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
          <section className="min-w-0">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-black/10 bg-black/[0.03] shadow-sm">
              {isWebWallpaper ? (
                <div className="absolute right-3 top-3 z-10">
                  <Segmented<PreviewMode>
                    size="small"
                    value={previewMode}
                    options={previewOptions}
                    onChange={setPreviewMode}
                  />
                </div>
              ) : null}

              {previewMode === "runtime" && runtimeUrl ? (
                <iframe
                  title={`${wallpaper?.name || "网页壁纸"}运行预览`}
                  src={runtimeUrl}
                  sandbox="allow-scripts"
                  referrerPolicy="no-referrer"
                  allow="accelerometer 'none'; autoplay 'none'; camera 'none'; clipboard-read 'none'; clipboard-write 'none'; display-capture 'none'; fullscreen 'none'; geolocation 'none'; gyroscope 'none'; microphone 'none'; payment 'none'; usb 'none'"
                  className="h-full w-full border-0 bg-transparent"
                />
              ) : isGradientWallpaper && wallpaper?.css ? (
                <div
                  className="h-full w-full"
                  style={{ background: wallpaper.css }}
                />
              ) : previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={`${wallpaper?.name || "壁纸"}预览`}
                  width="100%"
                  height="100%"
                  rootClassName="h-full w-full"
                  style={{ display: "block", objectFit: "contain" }}
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无预览"
                  />
                </div>
              )}
            </div>

            {isWebWallpaper && !wallpaper?.isActive ? (
              <Alert
                className="mt-3"
                showIcon
                type="info"
                message="当前网页壁纸已停用"
                description="运行预览仅对已启用的网页壁纸开放，静态预览仍可正常查看。"
              />
            ) : null}
          </section>

          <aside className="min-w-0">
            <Descriptions
              bordered
              size="small"
              column={1}
              className="[&_.ant-descriptions-item-label]:w-24 [&_.ant-descriptions-item-label]:whitespace-nowrap"
            >
              <Descriptions.Item label="名称">
                {wallpaper?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag
                  color={
                    isWebWallpaper
                      ? "blue"
                      : isGradientWallpaper
                        ? "purple"
                        : undefined
                  }
                >
                  {isWebWallpaper
                    ? "网页壁纸"
                    : isGradientWallpaper
                      ? "渐变壁纸"
                      : "图片壁纸"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="作者">{author}</Descriptions.Item>
              <Descriptions.Item label="分类">
                {getCategoryName(wallpaper?.categoryId)}
              </Descriptions.Item>
              <Descriptions.Item label="项目 URL">
                {projectUrl ? (
                  <Typography.Link
                    href={projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1 break-all"
                  >
                    {projectUrl}
                    <RiExternalLinkLine
                      size={14}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                  </Typography.Link>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="简介">
                <span className="whitespace-pre-wrap">{description}</span>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={wallpaper?.isActive ? "green" : "default"}>
                  {wallpaper?.isActive ? "已启用" : "已停用"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="排序">
                {wallpaper?.sortOrder ?? 0}
              </Descriptions.Item>

              {isGradientWallpaper ? (
                <Descriptions.Item label="渐变 CSS">
                  <Typography.Text copyable className="break-all">
                    {wallpaper?.css || "-"}
                  </Typography.Text>
                </Descriptions.Item>
              ) : null}

              {isWebWallpaper && wallpaper?.application ? (
                <>
                  <Descriptions.Item label="包名">
                    {wallpaper.application.packageName}
                  </Descriptions.Item>
                  <Descriptions.Item label="版本">
                    {wallpaper.application.version}
                  </Descriptions.Item>
                  <Descriptions.Item label="入口">
                    {wallpaper.application.entry}
                  </Descriptions.Item>
                  <Descriptions.Item label="预览文件">
                    {wallpaper.application.preview}
                  </Descriptions.Item>
                  <Descriptions.Item label="Revision">
                    <Typography.Text copyable className="break-all">
                      {wallpaper.application.revision}
                    </Typography.Text>
                  </Descriptions.Item>
                </>
              ) : null}

              <Descriptions.Item label="创建人">
                {getUserName(wallpaper?.creator)}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDate(wallpaper?.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="更新人">
                {getUserName(wallpaper?.updater)}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {formatDate(wallpaper?.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </aside>
        </div>
      </div>
    </FullPageContainer>
  );
};

export default WallpaperDetail;
