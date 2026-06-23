import {
  addWebsiteClassify,
  getWebsiteClassifyDetail,
  updateWebsiteClassify,
  WebsiteClassify,
} from "@/services/tabs/website_classifty";
import { baseFormItemLayout } from "@/utils/utils";
import { ModalForm, ProFormInstance, ProFormText, ProFormTextArea, ProFormSwitch } from "@ant-design/pro-components";
import ProFormUpload from "@/components/pro-form/fields/upload";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { FC, useEffect, useRef } from "react";
import { RiAddLine } from "@remixicon/react";

export interface HandleModalProps {
  onFinished?: (values: any) => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onDetailLoading?: (loading: boolean) => void;
  parent?: string;
}

const ClassifyHandle: FC<HandleModalProps> = (props) => {
  const { onFinished, open, editId, onClose, parent, onDetailLoading } = props;

  const ref = useRef<ProFormInstance<WebsiteClassify>>(null);

  const { data, loading, run } = useRequest(getWebsiteClassifyDetail, {
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
    <ModalForm<WebsiteClassify>
      {...baseFormItemLayout}
      open={open}
      formRef={ref}
      trigger={
        <Button type="primary" icon={<RiAddLine size={16} />}>
          新增分类
        </Button>
      }
      title={editId ? "编辑分类" : "新增分类"}
      onOpenChange={(visible) => {
        if (!visible) {
          onClose?.();
        }
        ref.current?.resetFields();
      }}
      onFinish={(values) => {
        return new Promise((resolve) => {
          (editId ? updateWebsiteClassify(editId, values) : addWebsiteClassify(parent ? { ...values, parent } : values))
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
      <ProFormText
        name="name"
        label="名称"
        rules={[
          {
            required: true,
            message: "请输入名称",
          },
        ]}
      />
      <ProFormTextArea name="description" label="描述" />
      <ProFormUpload
        name="icon"
        label="图标"
        fieldProps={{
          dir: "website_classify",
          accept: "image/*",
          maxCount: 1,
        }}
      />
      <ProFormSwitch name="enable" label="是否启用" initialValue={true} />
    </ModalForm>
  );
};

export default ClassifyHandle;
