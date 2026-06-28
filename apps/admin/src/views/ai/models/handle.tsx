import { addModel, getModelDetail, SaveAiModelData, updateModel } from "@/services/ai/models";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ModalForm,
  ProFormDigit,
  ProFormInstance,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { Button, message, Table, Tag } from "antd";
import { FC, useEffect, useRef, useState } from "react";

interface ModelHandleProps {
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onFinished?: () => void;
}

const ModelHandle: FC<ModelHandleProps> = ({ open, editId, onClose, onFinished }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const formRef = useRef<ProFormInstance<SaveAiModelData>>(null);
  const { data, run } = useRequest(getModelDetail, { manual: true });

  useEffect(() => {
    if (editId) run(editId);
  }, [editId]);

  useEffect(() => {
    if (data) {
      formRef.current?.setFieldsValue({
        ...data,
      } as any);
    }
  }, [data]);

  return (
    <>
      <Button type="primary" icon={<RiAddLine size={16} />} onClick={() => setModalOpen(true)}>
        新增模型
      </Button>
      <ModalForm<SaveAiModelData>
        {...baseFormItemLayout}
        open={open || modalOpen}
        formRef={formRef}
        title={editId ? "修改模型" : "新增模型"}
        onOpenChange={(visible) => {
          if (!visible) {
            setModalOpen(false);
            onClose?.();
            formRef.current?.resetFields();
          }
        }}
        onFinish={async (values) => {
          await (editId ? updateModel(editId, values) : addModel(values));
          messageApi.success(editId ? "修改成功" : "新增成功");
          setModalOpen(false);
          formRef.current?.resetFields();
          onFinished?.();
          return true;
        }}
        modalProps={{ destroyOnClose: true, width: 760 }}
      >
        <ProFormText name="publicName" label="对外模型名" rules={[{ required: true, message: "请输入对外模型名" }]} />
        <ProFormText name="displayName" label="显示名称" rules={[{ required: true, message: "请输入显示名称" }]} />
        <ProFormDigit name="contextWindow" label="上下文窗口" fieldProps={{ precision: 0, min: 0 }} />
        <ProFormDigit name="inputPricePer1K" label="用户输入价/1K积分" fieldProps={{ min: 0, precision: 8 }} />
        <ProFormDigit name="outputPricePer1K" label="用户输出价/1K积分" fieldProps={{ min: 0, precision: 8 }} />
        <ProFormTextArea name="description" label="描述" fieldProps={{ rows: 3 }} />
        <ProFormSwitch name="enabled" label="是否启用" initialValue={true} />
        {editId ? (
          <div className="px-6 pb-2">
            <div className="mb-2 text-sm text-gray-500">服务商模型（在服务商管理中维护）</div>
            <Table
              rowKey="_id"
              size="small"
              pagination={false}
              dataSource={data?.providerModels || []}
              columns={[
                { title: "服务商", dataIndex: ["provider", "displayName"] },
                { title: "上游模型", dataIndex: "upstreamModel" },
                { title: "成本输入/1K", dataIndex: "costInputPricePer1K" },
                { title: "成本输出/1K", dataIndex: "costOutputPricePer1K" },
                { title: "优先级", dataIndex: "priority" },
                {
                  title: "标签",
                  dataIndex: "tag",
                  render: (value) => (value === "official" ? "官方" : "中转"),
                },
                {
                  title: "状态",
                  dataIndex: "enabled",
                  render: (value) => (value ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>),
                },
              ]}
            />
          </div>
        ) : null}
      </ModalForm>
      {contextHolder}
    </>
  );
};

export default ModelHandle;
