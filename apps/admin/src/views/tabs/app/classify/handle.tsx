import {
  addAppClassify,
  getAppClassifyDetail,
  updateAppClassify,
  AppClassify,
} from "@/services/tabs/app_classify";
import { baseFormItemLayout } from "@/utils/utils";
import { ModalForm, ProFormDigit, ProFormInstance, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { RiAddLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { FC, useEffect, useRef } from "react";
import Access from "@/components/Access";
import type { PermissionAuth } from "@/contexts/AccessContext";

export interface HandleModalProps {
  onFinished?: (values: any) => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onDetailLoading?: (loading: boolean) => void;
  auth?: PermissionAuth;
}

const ClassifyHandle: FC<HandleModalProps> = (props) => {
  const { onFinished, open, editId, onClose, onDetailLoading, auth } = props;

  const ref = useRef<ProFormInstance<AppClassify>>(null);

  const { data, loading, run } = useRequest(getAppClassifyDetail, {
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
    <ModalForm<AppClassify>
      {...baseFormItemLayout}
      open={open}
      formRef={ref}
      trigger={
        <Access auth={auth}>
          <Button type="primary" icon={<RiAddLine size={16} />}>
            新增
          </Button>
        </Access>
      }
      title={editId ? "编辑分类" : "新增分类"}
      initialValues={{ enable: true, sortOrder: 0 }}
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
        ref.current?.resetFields();
      }}
      onFinish={(values: AppClassify) => {
        return new Promise((resolve) => {
          (editId ? updateAppClassify(editId, values) : addAppClassify(values))
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
      <ProFormDigit name="sortOrder" label="排序" fieldProps={{ precision: 0, min: 0 }} />
    </ModalForm>
  );
};

export default ClassifyHandle;
