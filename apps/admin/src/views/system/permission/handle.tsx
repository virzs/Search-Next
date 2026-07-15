import { PermissionListData, addPermission, getPermissionDetail, updatePermission } from "@/services/system/permission";
import { baseFormItemLayout } from "@/utils/utils";
import { useRequest } from "ahooks";
import { Button, Form, Input, message, Modal, Select } from "antd";
import { FC, useEffect, useMemo, useState } from "react";
import { permissionMethodOptions } from "./method";
import Access from "@/components/Access";
import type { PermissionAuth } from "@/contexts/AccessContext";

export interface HandleModalProps {
  onFinished?: (values: any) => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onDetailLoading?: (loading: boolean) => void;
  parent?: string;
  auth?: PermissionAuth;
}

const PermissionHandle: FC<HandleModalProps> = (props) => {
  const { onFinished, open, editId, onClose, parent, onDetailLoading, auth } = props;

  const [form] = Form.useForm<PermissionListData>();
  const [internalOpen, setInternalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, run } = useRequest(getPermissionDetail, {
    manual: true,
  });

  const mergedOpen = Boolean(open || internalOpen);
  const isEdit = Boolean(editId);
  const isCurrentDetail = Boolean(editId && data?._id === editId);
  const isAutoPermission = Boolean(isCurrentDetail && data?.source === "auto");
  const showApiFields = Boolean(parent || (isCurrentDetail && data?.parent));

  const title = useMemo(() => (isEdit ? "修改权限" : "新增权限"), [isEdit]);

  useEffect(() => {
    if (mergedOpen && editId) {
      run(editId);
    }
  }, [mergedOpen, editId]);

  useEffect(() => {
    if (mergedOpen && !editId) {
      form.resetFields();
      form.setFieldsValue({
        name: undefined,
        description: undefined,
        method: "GET",
        url: undefined,
      } as PermissionListData);
    }
  }, [mergedOpen, editId, parent]);

  useEffect(() => {
    if (mergedOpen && editId && isCurrentDetail && data) {
      form.setFieldsValue({
        ...data,
      } as PermissionListData);
    }
  }, [mergedOpen, editId, isCurrentDetail, data]);

  useEffect(() => {
    onDetailLoading?.(loading);
  }, [loading]);

  const handleClose = () => {
    setInternalOpen(false);
    form.resetFields();
    onClose?.();
  };

  const handleFinish = async (values: PermissionListData) => {
    setSubmitting(true);
    try {
      const payload = parent && !editId ? { ...values, parent } : values;
      if (editId) {
        await updatePermission(editId, payload);
      } else {
        await addPermission(payload);
      }
      message.success(editId ? "修改成功" : "新增成功");
      onFinished?.(values);
      handleClose();
    } catch {
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Access auth={auth}>
        <Button type="primary" onClick={() => setInternalOpen(true)}>
          新增权限
        </Button>
      </Access>
      <Modal
        open={mergedOpen}
        title={title}
        okText="保存"
        cancelText="取消"
        confirmLoading={submitting}
        onOk={() => form.submit()}
        onCancel={handleClose}
        destroyOnHidden
      >
        <Form<PermissionListData>
          {...baseFormItemLayout}
          form={form}
          preserve={false}
          initialValues={{ method: "GET" }}
          onFinish={handleFinish}
        >
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}>
            <Input disabled={isAutoPermission} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          {showApiFields ? (
            <>
              <Form.Item name="method" label="请求方式">
                <Select
                  disabled={isAutoPermission}
                  optionFilterProp="value"
                  options={permissionMethodOptions}
                  showSearch
                />
              </Form.Item>
              <Form.Item name="url" label="URL">
                <Input disabled={isAutoPermission} />
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Modal>
    </>
  );
};

export default PermissionHandle;
