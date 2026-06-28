import {
  addConsumerKey,
  ConsumerKey,
  getConsumerKeyDetail,
  SaveConsumerKeyData,
  updateConsumerKey,
} from "@/services/ai/consumer-keys";
import { getModelOptions } from "@/services/ai/models";
import { getUsers } from "@/services/user";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormInstance,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useRef, useState } from "react";

interface ConsumerKeyHandleProps {
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onFinished?: () => void;
  onPlainKey?: (key: ConsumerKey) => void;
}

const ConsumerKeyHandle: FC<ConsumerKeyHandleProps> = ({ open, editId, onClose, onFinished, onPlainKey }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const formRef = useRef<ProFormInstance<SaveConsumerKeyData>>(null);
  const { data: models = [] } = useRequest(getModelOptions);
  const { data: usersRes } = useRequest(() => getUsers({ page: 1, pageSize: 200 }));
  const { data, run } = useRequest(getConsumerKeyDetail, { manual: true });
  const users = usersRes?.data || [];

  useEffect(() => {
    if (editId) run(editId);
  }, [editId]);

  useEffect(() => {
    if (data) {
      formRef.current?.setFieldsValue({
        ...data,
        ownerUser: data.ownerUser?._id || data.ownerUser,
        allowedModels: data.allowedModels?.map((model: any) => model._id || model),
        expiresAt: data.expiresAt ? dayjs(data.expiresAt) : undefined,
      } as any);
    }
  }, [data]);

  return (
    <>
      <Button type="primary" icon={<RiAddLine size={16} />} onClick={() => setModalOpen(true)}>
        新增 API Key
      </Button>
      <ModalForm<SaveConsumerKeyData>
        {...baseFormItemLayout}
        open={open || modalOpen}
        formRef={formRef}
        title={editId ? "修改 API Key" : "新增 API Key"}
        onOpenChange={(visible) => {
          if (!visible) {
            setModalOpen(false);
            onClose?.();
            formRef.current?.resetFields();
          }
        }}
        onFinish={async (values: any) => {
          const payload = {
            ...values,
            expiresAt: values.expiresAt ? dayjs(values.expiresAt).toISOString() : undefined,
          };
          const result = await (editId ? updateConsumerKey(editId, payload) : addConsumerKey(payload));
          if (!editId && result?.plainKey) {
            onPlainKey?.(result);
          }
          messageApi.success(editId ? "修改成功" : "新增成功");
          setModalOpen(false);
          formRef.current?.resetFields();
          onFinished?.();
          return true;
        }}
        modalProps={{ destroyOnClose: true }}
      >
        <ProFormText name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]} />
        <ProFormSelect
          name="ownerUser"
          label="所属用户"
          showSearch
          rules={[{ required: true, message: "请选择所属用户" }]}
          options={users.map((user: any) => ({
            label: `${user.username} (${user.email})`,
            value: user._id,
          }))}
          fieldProps={{
            filterOption: (input: string, option: any) => option?.label?.toLowerCase().includes(input.toLowerCase()),
          }}
        />
        <ProFormSelect
          name="allowedModels"
          label="允许模型"
          mode="multiple"
          placeholder="留空表示允许全部启用模型"
          options={models.map((model: any) => ({
            label: model.displayName || model.publicName || model.name,
            value: model._id,
          }))}
        />
        <ProFormDateTimePicker name="expiresAt" label="过期时间" />
        <ProFormTextArea name="description" label="描述" fieldProps={{ rows: 3 }} />
        <ProFormSwitch name="enabled" label="是否启用" initialValue={true} />
      </ModalForm>
      {contextHolder}
    </>
  );
};

export default ConsumerKeyHandle;
