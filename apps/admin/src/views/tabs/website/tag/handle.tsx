import { addWebsiteTag, getWebsiteTagDetail, updateWebsiteTag, WebsiteTag } from "@/services/tabs/website_tag";
import { baseFormItemLayout } from "@/utils/utils";
import { ModalForm, ProFormInstance, ProFormText, ProFormTextArea, ProFormSwitch } from "@ant-design/pro-components";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { FC, useEffect, useRef } from "react";

export interface HandleModalProps {
  onFinished?: (values: any) => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onDetailLoading?: (loading: boolean) => void;
}

const TagHandle: FC<HandleModalProps> = (props) => {
  const { onFinished, open, editId, onClose, onDetailLoading } = props;

  const ref = useRef<ProFormInstance<WebsiteTag>>(null);

  const { data, loading, run } = useRequest(getWebsiteTagDetail, {
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
    <ModalForm<WebsiteTag>
      {...baseFormItemLayout}
      open={open}
      formRef={ref}
      trigger={
        <Button type="primary" icon={<RiAddLine size={16} />}>
          新增标签
        </Button>
      }
      title={editId ? "编辑标签" : "新增标签"}
      onOpenChange={(visible) => {
        if (!visible) {
          onClose?.();
        }
        ref.current?.resetFields();
      }}
      onFinish={(values) => {
        return new Promise((resolve) => {
          (editId ? updateWebsiteTag(editId, values) : addWebsiteTag(values))
            .then(() => {
              message.success(editId ? "修改成功" : "新增成功");
              onFinished?.(values);
              resolve(true);
              ref.current?.resetFields();
            })
            .catch(() => {
              resolve(false);
            });
        });
      }}
      modalProps={{
        destroyOnClose: true,
      }}
    >
      <ProFormText name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]} />
      <ProFormTextArea name="description" label="描述" />
      <ProFormSwitch name="enable" label="是否启用" initialValue={true} />
    </ModalForm>
  );
};

export default TagHandle;
