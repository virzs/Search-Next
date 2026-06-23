import {
  addWidgetClassify,
  getWidgetClassifyDetail,
  updateWidgetClassify,
  WidgetClassify,
} from "@/services/tabs/widget_classify";
import { baseFormItemLayout } from "@/utils/utils";
import { ModalForm, ProFormInstance, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
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

const ClassifyHandle: FC<HandleModalProps> = (props) => {
  const { onFinished, open, editId, onClose, onDetailLoading } = props;

  const ref = useRef<ProFormInstance<WidgetClassify>>(null);

  const { data, loading, run } = useRequest(getWidgetClassifyDetail, {
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
    <ModalForm<WidgetClassify>
      {...baseFormItemLayout}
      open={open}
      formRef={ref}
      trigger={
        <Button type="primary" icon={<RiAddLine size={16} />}>
          新增
        </Button>
      }
      title={editId ? "编辑分类" : "新增分类"}
      initialValues={{ enable: true }}
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
        ref.current?.resetFields();
      }}
      onFinish={(values: WidgetClassify) => {
        return new Promise((resolve) => {
          (editId ? updateWidgetClassify(editId, values) : addWidgetClassify(values))
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
    </ModalForm>
  );
};

export default ClassifyHandle;
