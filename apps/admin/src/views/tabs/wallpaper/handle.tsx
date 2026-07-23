import FormPageContainer, {
  FormPageActions,
} from "@/components/containter/form";
import ProFormUpload from "@/components/pro-form/fields/upload";
import {
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import {
  Alert,
  App,
  Button,
  Form,
  Image,
  Space,
  Tag,
  Typography,
  Upload,
} from "antd";
import { RiUploadCloud2Line } from "@remixicon/react";
import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { baseFormItemLayout } from "@/utils/utils";
import {
  createApplicationWallpaper,
  createDesktopWallpaper,
  createGradientWallpaper,
  getApplicationWallpaperEntryUrl,
  getApplicationWallpaperPreviewUrl,
  getDesktopWallpaperDetail,
  getEnabledDesktopWallpaperCategories,
  updateApplicationWallpaper,
  updateDesktopWallpaper,
  updateGradientWallpaper,
  type DesktopWallpaper,
} from "@/services/tabs/desktop/wallpaper";
import GradientEditor from "./components/gradient-editor";
import { isSafeGradientCss } from "./components/gradient-utils";

const buildWallpaperFormValues = (data: DesktopWallpaper) => {
  const image = data?.image;
  const imageValue =
    image && typeof image === "object"
      ? {
          uid: image?._id,
          name: image?.name,
          url: image?.url,
          status: "done",
          response: image,
        }
      : undefined;
  return {
    ...data,
    type:
      data?.type === "application"
        ? "application"
        : data?.type === "gradient"
          ? "gradient"
          : "image",
    name: data.name || data.application?.packageName,
    description: data.description || data.application?.description,
    author: data.author || data.application?.author,
    url: data.url || data.application?.projectUrl,
    image: imageValue,
    categoryId:
      typeof data?.categoryId === "object"
        ? data?.categoryId?._id
        : data?.categoryId,
  };
};

const WallpaperHandle = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { message } = App.useApp();
  const [detail, setDetail] = useState<DesktopWallpaper | null>(null);
  const [packageWallpaperId, setPackageWallpaperId] = useState<string>();
  const [packageFileName, setPackageFileName] = useState("");
  const wallpaperType =
    Form.useWatch<"image" | "gradient" | "application">("type", form) ??
    "image";
  const formAuthor = Form.useWatch<string>("author", form);
  const formUrl = Form.useWatch<string>("url", form);
  const formDescription = Form.useWatch<string>("description", form);

  const { data: categoryPage } = useRequest(
    getEnabledDesktopWallpaperCategories,
  );
  const categoryOptions = useMemo(() => {
    const rawItems = (categoryPage as any)?.data ?? categoryPage;
    const items = Array.isArray(rawItems) ? rawItems : [];
    return items.map((category) => ({
      label: category?.name ?? "-",
      value: category?._id,
    }));
  }, [categoryPage]);

  const { run: detailRun, loading: detailLoading } = useRequest(
    getDesktopWallpaperDetail,
    {
      manual: true,
      onSuccess: (data: DesktopWallpaper) => {
        setDetail(data);
        form.setFieldsValue(buildWallpaperFormValues(data));
      },
    },
  );

  useEffect(() => {
    if (id) detailRun(id);
  }, [detailRun, id]);

  const previewUrl = getApplicationWallpaperPreviewUrl(detail);
  const entryUrl = getApplicationWallpaperEntryUrl(detail);
  const targetApplicationId = id || packageWallpaperId;

  const { runAsync: importApplicationPackage, loading: packageLoading } =
    useRequest(
      async (file: File) => {
        setPackageFileName(file.name);
        if (targetApplicationId) {
          return updateApplicationWallpaper(targetApplicationId, { file });
        }
        return createApplicationWallpaper({ file, isActive: false });
      },
      {
        manual: true,
        onSuccess: (data: DesktopWallpaper) => {
          const operationalValues = form.getFieldsValue([
            "categoryId",
            "isActive",
            "sortOrder",
          ]);
          setPackageWallpaperId(data._id);
          setDetail(data);
          form.setFieldsValue({
            ...buildWallpaperFormValues(data),
            categoryId:
              operationalValues.categoryId ??
              buildWallpaperFormValues(data).categoryId,
            isActive: operationalValues.isActive ?? true,
            sortOrder: operationalValues.sortOrder ?? 0,
          });
          message.success("已读取 .snwall 配置并回填表单");
        },
        onError: (error) => {
          setPackageFileName("");
          message.error(
            error instanceof Error ? error.message : "网页壁纸包读取失败",
          );
        },
      },
    );

  return (
    <FormPageContainer form={form} loading={detailLoading}>
        <div className="max-w-5xl mx-auto py-6">
          <ProForm
            {...baseFormItemLayout}
            form={form}
            initialValues={{ type: "image", isActive: true, sortOrder: 0 }}
            submitter={{
              searchConfig: { submitText: "保存" },
              render: (_, dom) => <FormPageActions>{dom}</FormPageActions>,
            }}
            onFinish={async (values) => {
              try {
                if (values.type === "application") {
                  if (!targetApplicationId) {
                    message.error("请先上传并读取 .snwall 网页壁纸包");
                    return false;
                  }
                  const payload = {
                    name: values?.name,
                    description: values?.description,
                    author: values?.author || undefined,
                    url: values?.url || undefined,
                    categoryId: values?.categoryId || null,
                    isActive: !!values?.isActive,
                    sortOrder: Number(values?.sortOrder ?? 0),
                  };
                  await updateApplicationWallpaper(
                    targetApplicationId,
                    payload,
                  );
                } else if (values.type === "gradient") {
                  const payload = {
                    name: values?.name,
                    css: values?.css,
                    description: values?.description,
                    author: values?.author || undefined,
                    url: values?.url || undefined,
                    categoryId: values?.categoryId || null,
                    isActive: !!values?.isActive,
                    sortOrder: Number(values?.sortOrder ?? 0),
                  };
                  if (id) await updateGradientWallpaper(id, payload);
                  else await createGradientWallpaper(payload);
                } else {
                  const rawImage = values?.image;
                  const imageId =
                    typeof rawImage === "string"
                      ? rawImage
                      : (rawImage?._id ??
                        rawImage?.id ??
                        rawImage?.response?._id);
                  if (!imageId) {
                    message.error("请先上传壁纸图片");
                    return false;
                  }
                  const payload = {
                    image: imageId,
                    name: values?.name,
                    description: values?.description,
                    author: values?.author || undefined,
                    url: values?.url || undefined,
                    categoryId: values?.categoryId || undefined,
                    isActive: !!values?.isActive,
                    sortOrder: Number(values?.sortOrder ?? 0),
                  };
                  if (id) await updateDesktopWallpaper(id, payload as any);
                  else await createDesktopWallpaper(payload as any);
                }
                message.success(id ? "修改成功" : "新增成功");
                navigate(-1);
                return true;
              } catch (error) {
                message.error(
                  error instanceof Error ? error.message : "保存失败",
                );
                return false;
              }
            }}
          >
            <ProFormSelect
              name="type"
              label="类型"
              disabled={Boolean(id || packageWallpaperId)}
              options={[
                { label: "图片壁纸", value: "image" },
                { label: "渐变壁纸", value: "gradient" },
                { label: "网页壁纸", value: "application" },
              ]}
              rules={[{ required: true, message: "请选择壁纸类型" }]}
              extra={
                id || packageWallpaperId ? "创建后不可更改类型" : undefined
              }
            />
            {wallpaperType === "application" ? (
              <ProCard title="网页壁纸包" className="mb-5" bordered>
                <Space direction="vertical" size={12} className="w-full">
                  <Upload
                    accept=".snwall"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      importApplicationPackage(file);
                      return false;
                    }}
                  >
                    <Button
                      icon={<RiUploadCloud2Line size={16} />}
                      loading={packageLoading}
                    >
                      上传并读取 .snwall
                    </Button>
                  </Upload>
                  <Alert
                    type="info"
                    showIcon
                    message="上传后自动读取包信息"
                    description="名称、简介、作者、项目 URL、包名、版本、入口和预览图会从 wallpaper.config.json 自动读取；分类、启用状态和排序由管理员维护。"
                  />
                  {detail?.application ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Tag color="blue">snwall</Tag>
                      <Typography.Text type="secondary">
                        {packageFileName || detail.application.packageName}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {detail.application.packageName} ·{" "}
                        {detail.application.version}
                      </Typography.Text>
                    </div>
                  ) : null}
                </Space>
              </ProCard>
            ) : null}

            <ProCard title="基本信息" className="mb-5" bordered>
              <ProFormText
                name="name"
                label="名称"
                placeholder="请输入名称"
                rules={[
                  { required: true, message: "请输入名称" },
                  { max: 100, message: "名称不超过100个字符" },
                ]}
              />
              <ProFormTextArea
                name="description"
                label="简介"
                placeholder="请输入壁纸简介"
                fieldProps={{ rows: 3, maxLength: 500, showCount: true }}
              />
              <ProFormText
                name="author"
                label="作者"
                placeholder="请输入作者名称"
                rules={[{ max: 100, message: "作者不超过100个字符" }]}
              />
              <ProFormText
                name="url"
                label="项目 URL"
                placeholder="https://example.com/project"
                tooltip="用于在 Web 端展示项目来源，仅支持 HTTPS 地址"
                fieldProps={{ type: "url" }}
                rules={[
                  { type: "url", message: "请输入正确的 URL" },
                  {
                    pattern: /^https:\/\//,
                    message: "项目 URL 必须使用 HTTPS",
                  },
                ]}
              />
            </ProCard>

            <ProCard title="发布设置" className="mb-5" bordered>
              <ProFormSelect
                name="categoryId"
                label="分类"
                placeholder="请选择分类"
                allowClear
                options={categoryOptions}
                rules={
                  wallpaperType === "application"
                    ? [{ required: true, message: "请选择网页壁纸分类" }]
                    : undefined
                }
              />
              <ProFormDigit
                name="sortOrder"
                label="排序"
                fieldProps={{ min: 0 }}
                tooltip="数值越小排序越靠前"
              />
              <ProFormSwitch name="isActive" label="是否启用" />
            </ProCard>

            {wallpaperType === "image" ? (
              <ProCard title="图片资源" className="mb-5" bordered>
                <ProFormUpload
                  name="image"
                  label="壁纸图片"
                  rules={[{ required: true, message: "请上传壁纸图片" }]}
                  fieldProps={{
                    dragger: true,
                    multiple: false,
                    accept: "image/*",
                    maxCount: 1,
                    listType: "picture",
                    dir: "wallpaper",
                  }}
                />
              </ProCard>
            ) : null}

            {wallpaperType === "gradient" ? (
              <ProCard title="渐变配置" className="mb-5" bordered>
                <Form.Item
                  name="css"
                  className="mb-0"
                  labelCol={{ span: 0 }}
                  wrapperCol={{ span: 24 }}
                  rules={[
                    { required: true, message: "请选择或配置渐变样式" },
                    {
                      validator: async (_, value) => {
                        const css = String(value || "").trim();
                        if (!css) return;
                        if (!isSafeGradientCss(css)) {
                          throw new Error(
                            "请输入有效且不包含外部资源的 CSS 渐变",
                          );
                        }
                      },
                    },
                  ]}
                >
                  <GradientEditor />
                </Form.Item>
              </ProCard>
            ) : null}
          </ProForm>

          {wallpaperType === "application" && detail?.application ? (
            <ProCard title="网页壁纸预览" className="mt-5" bordered>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Typography.Text type="secondary">
                  {detail.application.packageName} ·{" "}
                  {detail.application.version}
                </Typography.Text>
                <div className="grid gap-2 rounded-xl bg-black/[0.025] p-4 sm:grid-cols-2">
                  <div>
                    <Typography.Text type="secondary">作者</Typography.Text>
                    <div>
                      <Typography.Text>
                        {formAuthor ||
                          detail.author ||
                          detail.application.author ||
                          "-"}
                      </Typography.Text>
                    </div>
                  </div>
                  <div>
                    <Typography.Text type="secondary">项目地址</Typography.Text>
                    <div>
                      {formUrl ||
                      detail.url ||
                      detail.application.projectUrl ? (
                        <Typography.Link
                          href={
                            formUrl ||
                            detail.url ||
                            detail.application.projectUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {formUrl ||
                            detail.url ||
                            detail.application.projectUrl}
                        </Typography.Link>
                      ) : (
                        <Typography.Text>-</Typography.Text>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Typography.Text type="secondary">项目简介</Typography.Text>
                    <div>
                      <Typography.Text>
                        {formDescription ||
                          detail.description ||
                          detail.application.description ||
                          "-"}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
                {!detail.isActive ? (
                  <Alert
                    showIcon
                    type="info"
                    message="当前背景已停用"
                    description="受控运行时只允许启用的网页壁纸加载，启用后可查看实时预览。"
                  />
                ) : null}
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={detail.name || "网页壁纸预览"}
                    width="100%"
                    height={260}
                    preview={false}
                    style={{ objectFit: "cover", borderRadius: 12 }}
                  />
                ) : null}
                {entryUrl && detail.isActive ? (
                  <iframe
                    title="网页壁纸运行预览"
                    src={entryUrl}
                    sandbox="allow-scripts"
                    referrerPolicy="no-referrer"
                    allow="accelerometer 'none'; autoplay 'none'; camera 'none'; clipboard-read 'none'; clipboard-write 'none'; display-capture 'none'; fullscreen 'none'; geolocation 'none'; gyroscope 'none'; microphone 'none'; payment 'none'; usb 'none'"
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 12,
                    }}
                  />
                ) : null}
              </Space>
            </ProCard>
          ) : null}
        </div>
    </FormPageContainer>
  );
};

export default WallpaperHandle;
