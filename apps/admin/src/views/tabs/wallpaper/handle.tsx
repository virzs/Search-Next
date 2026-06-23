import BasePageContainer from "@/components/containter/base";
import { baseFormItemLayout } from "@/utils/utils";
import ProFormUpload from "@/components/pro-form/fields/upload";
import {
  ProForm,
  ProCard,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { App, Button, Form, Space } from "antd";
import { RollbackOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router";
import { useEffect, useMemo } from "react";
import { useRequest } from "ahooks";
import {
  createDesktopWallpaper,
  getDesktopWallpaperDetail,
  updateDesktopWallpaper,
  getEnabledDesktopWallpaperCategories,
} from "@/services/tabs/desktop/wallpaper";

const WallpaperHandle = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { message } = App.useApp();

  const { data: categoryPage } = useRequest(
    getEnabledDesktopWallpaperCategories,
  );
  const categoryOptions = useMemo(() => {
    const rawItems = (categoryPage as any)?.data ?? categoryPage;
    const items = Array.isArray(rawItems) ? rawItems : [];
    return items.map((c) => ({ label: c?.name ?? "-", value: c?._id }));
  }, [categoryPage]);

  const { run: detailRun, loading: detailLoading } = useRequest(
    getDesktopWallpaperDetail,
    {
      manual: true,
      onSuccess: (data: any) => {
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

        form.setFieldsValue({
          ...data,
          image: imageValue,
          categoryId:
            typeof data?.categoryId === "object"
              ? data?.categoryId?._id
              : data?.categoryId,
        });
      },
    },
  );

  useEffect(() => {
    if (id) {
      detailRun(id);
    }
  }, [id]);

  return (
    <BasePageContainer loading={detailLoading}>
      <ProCard
        extra={
          <Space>
            <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
          </Space>
        }
      >
        <div className="max-w-5xl mx-auto py-6">
          <ProForm
            {...baseFormItemLayout}
            form={form}
            initialValues={{
              isActive: true,
              sortOrder: 0,
            }}
            submitter={{
              searchConfig: { submitText: "保存" },
              render: (_, dom) => (
                <div className="flex items-center justify-center gap-2">
                  {...dom}
                </div>
              ),
            }}
            onFinish={async (values) => {
              const rawImage = values?.image;
              const imageId =
                typeof rawImage === "string"
                  ? rawImage
                  : (rawImage?._id ?? rawImage?.id ?? rawImage?.response?._id);

              if (!imageId) {
                message.error("请先上传壁纸图片");
                return false;
              }

              const payload: any = {
                image: imageId,
                name: values?.name,
                description: values?.description,
                categoryId: values?.categoryId || undefined,
                isActive: !!values?.isActive,
                sortOrder: Number(values?.sortOrder ?? 0),
              };

              try {
                if (id) {
                  await updateDesktopWallpaper(id, payload);
                  message.success("修改成功");
                } else {
                  await createDesktopWallpaper(payload);
                  message.success("新增成功");
                }
                navigate(-1);
                form.resetFields();
                return true;
              } catch {
                return false;
              }
            }}
          >
            <ProFormText
              name="name"
              label="名称"
              placeholder="请输入名称"
              rules={[
                { required: true, message: "请输入名称" },
                { max: 50, message: "名称不超过50个字符" },
              ]}
            />
            <ProFormTextArea
              name="description"
              label="描述"
              placeholder="请输入描述"
              fieldProps={{ rows: 3, maxLength: 200, showCount: true }}
            />
            <ProFormSelect
              name="categoryId"
              label="分类"
              placeholder="请选择分类"
              allowClear
              options={categoryOptions}
            />
            <ProFormDigit
              name="sortOrder"
              label="排序"
              fieldProps={{ min: 0 }}
            />
            <ProFormSwitch name="isActive" label="是否启用" />
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
          </ProForm>
        </div>
      </ProCard>
    </BasePageContainer>
  );
};

export default WallpaperHandle;
