import { postInvitationCode } from "@/services/user";
import { DatePicker, Form, InputNumber, Modal, Select } from "antd";
import { useRequest } from "ahooks";
import dayjs, { Dayjs } from "dayjs";
import { FC } from "react";
import { SYSTEM_ADMIN_ROLE_CODE, getRoleList } from "@/services/system/role";

interface HandleCodeProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
}

interface InvitationCodeFormValues {
  roles?: string[];
  maxUse?: number;
  expire?: Dayjs;
}

const HandleCode: FC<HandleCodeProps> = (props) => {
  const { open, onCancel, onOk } = props;
  const [form] = Form.useForm<InvitationCodeFormValues>();

  const { data, loading } = useRequest(getRoleList);
  const hasSystemAdminRole = (data ?? []).some((role) => role.code === SYSTEM_ADMIN_ROLE_CODE);

  const { loading: submitLoading, run: submit } = useRequest(
    (values: InvitationCodeFormValues) =>
      postInvitationCode({
        ...values,
        expire: values.expire ? dayjs(values.expire).format("YYYY-MM-DD") : undefined,
      }),
    {
      manual: true,
      onSuccess: () => {
        form.resetFields();
        onOk();
      },
    }
  );

  const handleClose = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      title="创建邀请码"
      width={480}
      confirmLoading={submitLoading}
      destroyOnHidden
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="创建"
      cancelText="取消"
    >
      <Form<InvitationCodeFormValues> form={form} layout="vertical" onFinish={submit} initialValues={{ maxUse: 1 }}>
        {hasSystemAdminRole && (
          <Form.Item name="roles" label="默认角色">
            <Select
              mode="multiple"
              loading={loading}
              placeholder="请选择默认角色"
              options={(data ?? [])
                .filter((role) => role._id)
                .map((role) => ({ label: role.name, value: String(role._id) }))}
            />
          </Form.Item>
        )}
        <Form.Item name="maxUse" label="最大使用次数" rules={[{ required: true, message: "请输入最大使用次数" }]}>
          <InputNumber min={1} max={9999} precision={0} style={{ width: "100%" }} placeholder="请输入最大使用次数" />
        </Form.Item>
        <Form.Item name="expire" label="有效期">
          <DatePicker style={{ width: "100%" }} placeholder="请选择有效期" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HandleCode;
