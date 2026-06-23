import { addProvider, AddProviderData, getProviderDetail, updateProvider } from "@/services/ai/providers";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ModalForm,
  ProFormInstance,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormSwitch,
} from "@ant-design/pro-components";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { FC, useEffect, useRef, useState } from "react";

export interface HandleModalProps {
  onFinished?: (values: any) => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onDetailLoading?: (loading: boolean) => void;
}

const ProvidersHandle: FC<HandleModalProps> = (props) => {
  const { onFinished, open, editId, onClose, onDetailLoading } = props;

  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);

  const ref = useRef<ProFormInstance<AddProviderData>>(null);

  const { data, loading, run } = useRequest(getProviderDetail, {
    manual: true,
  });

  useEffect(() => {
    if (editId) {
      run(editId);
    }
  }, [editId]);

  useEffect(() => {
    if (data) {
      ref.current?.setFieldsValue({
        ...data,
      } as any);
    }
  }, [data]);

  useEffect(() => {
    onDetailLoading?.(loading);
  }, [loading]);

  return (
    <>
      <Button type="primary" icon={<RiAddLine size={16} />} onClick={() => setModalOpen(true)}>
        新增服务商
      </Button>

      <ModalForm<AddProviderData>
        {...baseFormItemLayout}
        open={open || modalOpen}
        formRef={ref}
        title={editId ? "修改服务商" : "新增服务商"}
        onOpenChange={(visible) => {
          if (!visible) {
            setModalOpen(false);
            onClose?.();
            ref.current?.resetFields();
          }
        }}
        onFinish={async (values) => {
          try {
            await (editId ? updateProvider(editId, values) : addProvider(values));
            messageApi.success(editId ? "修改成功" : "新增成功");
            onFinished?.(values);
            ref.current?.resetFields();
            setModalOpen(false);
            return true;
          } catch (error) {
            return false;
          }
        }}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="name"
          label="服务商标识"
          placeholder="如：openai、claude等"
          rules={[
            {
              required: true,
              message: "请输入服务商标识",
            },
          ]}
        />
        <ProFormText
          name="displayName"
          label="显示名称"
          placeholder="如：OpenAI、Claude等"
          rules={[
            {
              required: true,
              message: "请输入显示名称",
            },
          ]}
        />
        <ProFormText
          name="baseUrl"
          label="基础URL"
          placeholder="如：https://api.openai.com/v1"
          fieldProps={{
            autoComplete: "off",
          }}
          rules={[
            {
              required: true,
              message: "请输入基础URL",
            },
            {
              type: "url",
              message: "请输入正确的URL格式",
            },
          ]}
        />
        <ProFormText.Password
          name="apiKey"
          label="API密钥"
          placeholder="请输入API密钥"
          fieldProps={{
            autoComplete: "new-password",
          }}
        />
        <ProFormText
          name="defaultModel"
          label="默认模型"
          placeholder="如：gpt-3.5-turbo、claude-3-sonnet等"
          rules={[
            {
              required: true,
              message: "请输入默认模型",
            },
          ]}
        />
        <ProFormSelect
          name="supportedModels"
          label="支持模型"
          mode="tags"
          placeholder="请输入支持的模型，按回车添加"
          rules={[
            {
              required: true,
              message: "请输入至少一个支持的模型",
            },
          ]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入服务商描述"
          fieldProps={{
            rows: 3,
          }}
        />
        <ProFormSwitch name="enabled" label="是否启用" initialValue={true} />
      </ModalForm>
      {contextHolder}
    </>
  );
};

export default ProvidersHandle;
