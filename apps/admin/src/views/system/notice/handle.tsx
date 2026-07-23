import FormPageContainer, {
  FormPageActions,
} from "@/components/containter/form";
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormInstance,
  ProFormSwitch,
  ProFormText,
} from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import { message } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { detailNotice, postNotice, putNotice } from "@/services/system/notice";
import { baseFormItemLayout, checkPath, getApiPrefix } from "@/utils/utils";
import { ProFormEditor, ProFormUpload } from "@/components/pro-form";
import { getToken } from "@/utils/token";
import { resourceDownload } from "@/services/resource";

type NoticeFormValues = {
  key: string;
  title: string;
  content: string;
  cover?: any;
  enable?: boolean;
  effectiveRange?: [any, any];
};

const NoticeHandle = () => {
  const ref = useRef<ProFormInstance>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const authorization = getToken() ?? "";

  const {
    data: detailData,
    loading: detailLoading,
    run: detailRun,
  } = useRequest(detailNotice, {
    manual: true,
  });

  const { run: downloadCover } = useRequest(resourceDownload, {
    manual: true,
    onSuccess: (url) => {
      ref.current?.setFieldsValue({
        cover: {
          ...detailData?.cover,
          url,
        },
      });
    },
  });

  const { loading: addLoading, runAsync: addRun } = useRequest(postNotice, {
    manual: true,
    onSuccess: () => {
      message.success("新增成功");
      navigate(-1);
    },
  });

  const { loading: editLoading, runAsync: editRun } = useRequest(putNotice, {
    manual: true,
    onSuccess: () => {
      message.success("修改成功");
      navigate(-1);
    },
  });

  useEffect(() => {
    if (id) {
      detailRun(id);
    }
  }, [id]);

  useEffect(() => {
    if (!detailData || !ref.current) return;

    const start = (detailData as any)?.effectiveStart;
    const end = (detailData as any)?.effectiveEnd;

    const { cover, ...rest } = detailData as any;
    if (cover?._id) {
      downloadCover(cover._id);
    }

    ref.current.setFieldsValue({
      ...rest,
      effectiveRange:
        start || end
          ? [start ? dayjs(start) : null, end ? dayjs(end) : null]
          : undefined,
    });
  }, [detailData]);

  const handleFinish = async (values: NoticeFormValues) => {
    const range = values.effectiveRange;
    const payload: any = {
      key: values.key,
      title: values.title,
      content: values.content,
      cover: values.cover,
      enable: values.enable ?? true,
      effectiveStart: range?.[0] ? dayjs(range[0]).toISOString() : undefined,
      effectiveEnd: range?.[1] ? dayjs(range[1]).toISOString() : undefined,
    };

    if (id) {
      await editRun(id, payload);
      return;
    }
    await addRun(payload);
  };

  return (
    <FormPageContainer form={ref} loading={detailLoading}>
      <ProForm<NoticeFormValues>
        {...baseFormItemLayout}
        formRef={ref}
        onFinish={handleFinish}
        initialValues={{ enable: true }}
        submitter={{
          searchConfig: { submitText: "保存" },
          render: (_, dom) => <FormPageActions>{dom}</FormPageActions>,
          submitButtonProps: {
            loading: addLoading || editLoading,
          },
        }}
      >
        <ProFormText
          name="key"
          label="Key"
          rules={[{ required: true, message: "Key 不能为空" }]}
        />
        <ProFormText
          name="title"
          label="标题"
          rules={[{ required: true, message: "标题不能为空" }]}
        />
        <ProFormSwitch name="enable" label="是否启用" />
        <ProFormDateRangePicker name="effectiveRange" label="生效时间范围" />
        <ProFormUpload
          name="cover"
          label="封面"
          fieldProps={{
            maxCount: 1,
            listType: "picture-card",
            dir: "notice",
            accept: "image/*",
          }}
        />
        <ProFormEditor
          name="content"
          label="内容"
          rules={[{ required: true, message: "内容不能为空" }]}
          fieldProps={{
            features: {
              image: {
                action: getApiPrefix(`/resource${checkPath("notice")}`),
                headers: {
                  authorization: `Bearer ${authorization}`,
                },
              },
            },
          }}
        />
      </ProForm>
    </FormPageContainer>
  );
};

export default NoticeHandle;
