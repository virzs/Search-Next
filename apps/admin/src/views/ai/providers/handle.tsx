import FormPageContainer, {
  FormPageActions,
} from "@/components/containter/form";
import {
  addProvider,
  AddProviderData,
  getProviderDetail,
  syncProviderModels,
  testProvider,
  updateProvider,
} from "@/services/ai/providers";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { RiWifiLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { App, Button, Form, Space } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ProviderModelsSection from "./models";

const PROVIDERS_PATH = "/ai/providers";
const PROVIDER_HANDLE_PATH = "/ai/providers/handle";

const ProvidersHandle = () => {
  const [form] = Form.useForm<AddProviderData>();
  const [detail, setDetail] = useState<any>();
  const [modelsRefreshKey, setModelsRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const { message, modal } = App.useApp();

  const { run: detailRun, loading: detailLoading } = useRequest(getProviderDetail, {
    manual: true,
    onSuccess: (data: any) => {
      setDetail(data);
      form.setFieldsValue({
        ...data,
        apiKey: data?.apiKey,
      });
    },
  });

  const { runAsync: testRun, loading: testLoading } = useRequest(testProvider, {
    manual: true,
    onSuccess: (res: any) => {
      if (res?.success) {
        message.success(res.message || "连接成功");
      } else {
        message.error(res?.message || "连接失败");
      }
      if (id) {
        detailRun(id);
      }
    },
  });

  const { runAsync: syncRun, loading: syncLoading } = useRequest(syncProviderModels, {
    manual: true,
    onSuccess: (res: any) => {
      message.success(
        `同步完成：新增公共模型 ${res?.createdPublicModels || 0}，新增模型 ${res?.createdProviderModels || 0}`,
      );
      setModelsRefreshKey((value) => value + 1);
    },
  });

  useEffect(() => {
    if (id) {
      detailRun(id);
    } else {
      setDetail(undefined);
      form.resetFields();
    }
  }, [id]);

  const getCurrentConnectionValues = async () => {
    await form.validateFields(["baseUrl", "apiKey"]);
    return form.getFieldsValue();
  };

  const handleTest = async () => {
    if (!id) return;
    try {
      const values = await getCurrentConnectionValues();
      await testRun(id, values);
    } catch {
      return;
    }
  };

  const handleSync = async () => {
    if (!id) return;
    try {
      const values = await getCurrentConnectionValues();
      modal.confirm({
        title: "确认从上游同步模型？",
        content: "同步结果会生成待确认的模型，不会直接影响前台可见模型。",
        onOk: async () => {
          await syncRun(id, values);
        },
      });
    } catch {
      return;
    }
  };

  return (
    <FormPageContainer
      form={form}
      loading={detailLoading}
      title={id ? "修改服务商" : "新增服务商"}
      backButtonProps={{ onBack: () => navigate(PROVIDERS_PATH) }}
      cardProps={{
        extra: (
          <Button
            icon={<RiWifiLine size={16} />}
            disabled={!id}
            loading={testLoading}
            onClick={handleTest}
          >
            测试连接
          </Button>
        ),
      }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div className="max-w-5xl mx-auto py-6">
            <ProForm<AddProviderData>
              {...baseFormItemLayout}
              form={form}
              initialValues={{
                type: "openai-compatible",
                priority: 100,
                timeoutMs: 60000,
                enabled: true,
              }}
              submitter={{
                searchConfig: { submitText: "保存" },
                render: (_, dom) => <FormPageActions>{dom}</FormPageActions>,
              }}
              onFinish={async (values) => {
                try {
                  if (id) {
                    const nextDetail = await updateProvider(id, values);
                    message.success("修改成功");
                    setDetail(nextDetail || { ...detail, ...values });
                    form.resetFields();
                    form.setFieldsValue(nextDetail || { ...detail, ...values });
                    detailRun(id);
                  } else {
                    const created: any = await addProvider(values);
                    const nextId = created?._id || created?.id;
                    message.success("新增成功");
                    form.resetFields();
                    if (nextId) {
                      navigate(`${PROVIDER_HANDLE_PATH}/${nextId}`, { replace: true });
                    } else {
                      navigate(PROVIDERS_PATH);
                    }
                  }
                  return true;
                } catch {
                  return false;
                }
              }}
            >
              <ProFormText
                name="name"
                label="服务商标识"
                placeholder="如：openai、claude等"
                rules={[{ required: true, message: "请输入服务商标识" }]}
              />
              <ProFormText
                name="displayName"
                label="显示名称"
                placeholder="如：OpenAI、Claude等"
                rules={[{ required: true, message: "请输入显示名称" }]}
              />
              <ProFormSelect
                name="type"
                label="协议类型"
                options={[{ label: "OpenAI Compatible", value: "openai-compatible" }]}
                rules={[{ required: true, message: "请选择协议类型" }]}
              />
              <ProFormText
                name="baseUrl"
                label="Base URL"
                placeholder="如：https://api.openai.com/v1"
                rules={[{ required: true, message: "请输入 Base URL" }]}
              />
              <ProFormText.Password
                name="apiKey"
                label="API Key"
                placeholder="只填写 sk-...，不要包含 Bearer"
                rules={[{ required: true, message: "请输入 API Key" }]}
                fieldProps={{ autoComplete: "new-password", visibilityToggle: true }}
              />
              <ProFormText
                name="testModel"
                label="测试模型"
                placeholder="可选，不填则使用上游模型列表第一个"
              />
              <ProFormDigit name="priority" label="优先级" fieldProps={{ precision: 0, min: 0 }} />
              <ProFormDigit name="timeoutMs" label="超时(ms)" fieldProps={{ precision: 0, min: 1000 }} />
              <ProFormTextArea name="description" label="描述" placeholder="请输入服务商描述" fieldProps={{ rows: 3 }} />
              <ProFormSwitch name="enabled" label="是否启用" />
            </ProForm>
          </div>
        <ProviderModelsSection
          key={`${id || "new"}-${modelsRefreshKey}`}
          providerId={id}
          provider={detail}
          syncLoading={syncLoading}
          onSync={handleSync}
        />
      </Space>
    </FormPageContainer>
  );
};

export default ProvidersHandle;
