import { PermissionListData, addPermission, getPermissionDetail, updatePermission } from "@/services/system/permission";
import { baseFormItemLayout } from "@/utils/utils";
import { BetaSchemaForm, ProFormInstance } from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import { Button, message } from "antd";
import { FC, useEffect, useRef } from "react";

export interface HandleModalProps {
  onFinished?: (values: any) => void;
  open?: boolean;
  editId?: string;
  onClose?: () => void;
  onDetailLoading?: (loading: boolean) => void;
  parent?: string;
}

const PermissionHandle: FC<HandleModalProps> = (props) => {
  const { onFinished, open, editId, onClose, parent, onDetailLoading } = props;

  const ref = useRef<ProFormInstance<PermissionListData>>(null);

  const { data, loading, run } = useRequest(getPermissionDetail, {
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
    <BetaSchemaForm
      {...baseFormItemLayout}
      open={open}
      formRef={ref}
      layoutType="ModalForm"
      trigger={<Button type="primary">新增权限</Button>}
      title="新增权限"
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
        ref.current?.resetFields();
      }}
      onFinish={(values: PermissionListData) => {
        return new Promise((resolve) => {
          (editId ? updatePermission(editId, values) : addPermission(parent ? { ...values, parent } : values))
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
      columns={[
        {
          title: "名称",
          dataIndex: "name",
          valueType: "text",
          formItemProps: {
            rules: [
              {
                required: true,
                message: "请输入名称",
              },
            ],
          },
        },
        {
          title: "描述",
          dataIndex: "description",
          valueType: "textarea",
        },
        ...(!!parent || (editId && data?.parent)
          ? [
              {
                title: "请求方式",
                dataIndex: "method",
                valueType: "select",
                valueEnum: {
                  GET: "GET",
                  POST: "POST",
                  PUT: "PUT",
                  DELETE: "DELETE",
                },
              },
              {
                title: "URL",
                dataIndex: "url",
                valueType: "text",
              },
            ]
          : []),
      ]}
    ></BetaSchemaForm>
  );
};

export default PermissionHandle;
