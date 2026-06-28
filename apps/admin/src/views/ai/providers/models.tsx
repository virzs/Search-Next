import { getAllModelOptions } from "@/services/ai/models";
import {
  addProviderModel,
  deleteProviderModel,
  getProviderModelsByProvider,
  SaveProviderModelData,
  updateProviderModel,
} from "@/services/ai/providers";
import {
  ModalForm,
  ProCard,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import { Alert, Button, Popconfirm, Space, Table, Tag, message } from "antd";
import { FC, useEffect, useRef, useState } from "react";

interface ProviderModelsSectionProps {
  provider?: any;
  providerId?: string;
  syncLoading?: boolean;
  onSync?: () => void;
  onChanged?: () => void;
}

const ProviderModelsSection: FC<ProviderModelsSectionProps> = ({
  provider,
  providerId: propProviderId,
  syncLoading,
  onSync,
  onChanged,
}) => {
  const providerId = propProviderId || provider?._id;
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>();
  const formRef = useRef<ProFormInstance<SaveProviderModelData>>(null);

  const { data: publicModels = [] } = useRequest(getAllModelOptions);
  const {
    data: providerModels = [],
    loading,
    run,
  } = useRequest(getProviderModelsByProvider, {
    manual: true,
  });

  useEffect(() => {
    if (providerId) {
      run(providerId);
    }
  }, [providerId]);

  useEffect(() => {
    if (editRecord && formOpen) {
      formRef.current?.setFieldsValue({
        publicModel: editRecord.publicModel?._id || editRecord.publicModel,
        upstreamModel: editRecord.upstreamModel,
        priority: editRecord.priority,
        enabled: editRecord.enabled,
        tag: editRecord.tag,
        costInputPricePer1K: editRecord.costInputPricePer1K,
        costOutputPricePer1K: editRecord.costOutputPricePer1K,
      });
    }
  }, [editRecord, formOpen]);

  const refresh = () => {
    if (providerId) {
      run(providerId);
      onChanged?.();
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditRecord(undefined);
    formRef.current?.resetFields();
  };

  const { runAsync: remove } = useRequest(
    async (providerModelId: string) => deleteProviderModel(providerId!, providerModelId),
    {
      manual: true,
      onSuccess: () => {
        message.success("删除成功");
        refresh();
      },
    }
  );

  return (
    <ProCard
      title="模型"
      extra={
        <Space>
          {onSync && (
            <Button disabled={!providerId} loading={syncLoading} onClick={onSync}>
              从上游同步模型
            </Button>
          )}
          <Button
            type="primary"
            disabled={!providerId}
            onClick={() => {
              setEditRecord(undefined);
              setFormOpen(true);
            }}
          >
            新增模型
          </Button>
        </Space>
      }
    >
      {!providerId ? (
        <Alert message="保存服务商后可从上游同步模型并管理模型" type="info" showIcon />
      ) : (
        <Table
          rowKey="_id"
          loading={loading}
          dataSource={providerModels}
          pagination={false}
          size="small"
          scroll={{ x: 1100 }}
          columns={[
            {
              title: "公共模型",
              dataIndex: ["publicModel", "publicName"],
              width: 180,
              render: (_, record: any) => record.publicModel?.publicName || record.publicModel?.name || "-",
            },
            { title: "显示名称", dataIndex: ["publicModel", "displayName"], width: 160 },
            { title: "上游模型", dataIndex: "upstreamModel", width: 180 },
            { title: "用户输入价/1K", dataIndex: ["publicModel", "inputPricePer1K"], width: 120 },
            { title: "用户输出价/1K", dataIndex: ["publicModel", "outputPricePer1K"], width: 120 },
            { title: "成本输入/1K", dataIndex: "costInputPricePer1K", width: 120 },
            { title: "成本输出/1K", dataIndex: "costOutputPricePer1K", width: 120 },
            { title: "优先级", dataIndex: "priority", width: 80 },
            {
              title: "标签",
              dataIndex: "tag",
              width: 80,
              render: (value) => (value === "official" ? "官方" : "中转"),
            },
            {
              title: "状态",
              dataIndex: "enabled",
              width: 80,
              render: (value) => (value ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>),
            },
            {
              title: "操作",
              key: "operation",
              fixed: "right",
              width: 120,
              render: (_, record: any) => (
                <Space>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setEditRecord(record);
                      setFormOpen(true);
                    }}
                  >
                    修改
                  </Button>
                  <Popconfirm title="确认删除该模型？" onConfirm={() => remove(record._id)}>
                    <Button type="link" danger size="small">
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      )}
      <ModalForm<SaveProviderModelData>
        open={formOpen}
        formRef={formRef}
        title={editRecord ? "修改模型" : "新增模型"}
        modalProps={{ destroyOnClose: true }}
        onOpenChange={(visible) => {
          if (!visible) {
            closeForm();
          }
        }}
        onFinish={async (values) => {
          if (!providerId) {
            message.warning("请先保存服务商");
            return false;
          }
          if (editRecord?._id) {
            await updateProviderModel(providerId, editRecord._id, values);
          } else {
            await addProviderModel(providerId, values);
          }
          message.success(editRecord ? "修改成功" : "新增成功");
          closeForm();
          refresh();
          return true;
        }}
      >
        <ProFormSelect
          name="publicModel"
          label="公共模型"
          showSearch
          rules={[{ required: true, message: "请选择公共模型" }]}
          options={publicModels.map((model: any) => ({
            label: `${model.displayName || model.publicName || model.name} (${model.publicName || model.name})${
              model.enabled ? "" : " - 停用"
            }`,
            value: model._id,
          }))}
          fieldProps={{
            filterOption: (input: string, option: any) => option?.label?.toLowerCase().includes(input.toLowerCase()),
          }}
        />
        <ProFormText
          name="upstreamModel"
          label="上游模型名"
          rules={[{ required: true, message: "请输入上游模型名" }]}
        />
        <ProFormSelect
          name="tag"
          label="标签"
          initialValue="proxy"
          options={[
            { label: "官方", value: "official" },
            { label: "中转", value: "proxy" },
          ]}
        />
        <ProFormDigit name="priority" label="优先级" initialValue={100} fieldProps={{ precision: 0, min: 0 }} />
        <ProFormDigit name="costInputPricePer1K" label="成本输入/1K" fieldProps={{ min: 0, precision: 8 }} />
        <ProFormDigit name="costOutputPricePer1K" label="成本输出/1K" fieldProps={{ min: 0, precision: 8 }} />
        <ProFormSwitch name="enabled" label="是否启用" initialValue={true} />
      </ModalForm>
    </ProCard>
  );
};

export default ProviderModelsSection;
