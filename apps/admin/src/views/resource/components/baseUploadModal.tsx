import ProFormUpload from "@/components/pro-form/fields/upload";
import { resourceBatchUpload } from "@/services/resource";
import { baseFormItemLayout } from "@/utils/utils";
import { ModalForm, ProFormInstance, ProFormText } from "@ant-design/pro-components";
import { message, ModalProps } from "antd";
import { FC, useRef } from "react";

export interface BaseUploadFormType {
  dir: string;
  files: File[];
}

export interface BaseUploadModalProps extends Omit<ModalProps, "onOk" | "onCancel" | "onClose"> {
  title?: string;
  onOk?: () => void;
  onClose?: () => void;
}

const BaseUploadModal: FC<BaseUploadModalProps> = (props) => {
  const { title, onClose, onOk, open, ...rest } = props;

  const ref = useRef<ProFormInstance<BaseUploadFormType>>(null);

  return (
    <ModalForm<BaseUploadFormType>
      {...baseFormItemLayout}
      title={title || "上传文件"}
      formRef={ref}
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
        ref.current?.resetFields();
      }}
      onFinish={(values) => {
        return new Promise((resolve) => {
          resourceBatchUpload(values.dir, values.files)
            .then(() => {
              message.success("上传成功");
              onOk?.();
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        });
      }}
      open={open}
      modalProps={{
        destroyOnClose: true,
        ...rest,
      }}
    >
      <ProFormText
        name="dir"
        label="路径"
        placeholder="请输入路径"
        rules={[
          {
            required: true,
            message: "路径不能为空",
          },
        ]}
      />
      <ProFormUpload
        name="files"
        label="文件"
        rules={[
          {
            required: true,
            message: "文件不能为空",
          },
        ]}
        fieldProps={{
          dir: "default",
          dragger: true,
          multiple: true,
          manually: true,
        }}
      />
    </ModalForm>
  );
};

export default BaseUploadModal;
