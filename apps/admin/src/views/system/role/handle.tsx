import FormPageContainer, {
  FormPageActions,
} from "@/components/containter/form";
import { PermissionListData, getPermissionTree } from "@/services/system/permission";
import { RoleRequest, detailRolePermissions, postRole, putRole } from "@/services/system/role";
import { baseFormItemLayout } from "@/utils/utils";
import { useRequest } from "ahooks";
import { Alert, Button, Form, Input, message, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import type { Key } from "react";
import { FC, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";

const getRoleFormValues = (role: RoleRequest): RoleRequest => ({
  ...role,
  permissions: role.permissions ?? [],
});

const getPermissionTreeData = (permissions: PermissionListData[] = []): DataNode[] => {
  return permissions
    .filter((item) => !item.isStale)
    .map((item) => ({
      title: item.name,
      key: item._id!,
      children: item.children?.length ? getPermissionTreeData(item.children) : undefined,
    }));
};

const getAssignablePermissionKeys = (permissions: PermissionListData[] = []): Set<string> => {
  const keys = new Set<string>();

  const visit = (items: PermissionListData[]) => {
    items.forEach((item) => {
      if (!item.isStale && item.type === 1 && item._id) {
        keys.add(item._id);
      }
      if (item.children?.length) {
        visit(item.children);
      }
    });
  };

  visit(permissions);
  return keys;
};

interface PermissionTreeFieldProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  treeData: DataNode[];
  assignableKeys: Set<string>;
  disabled?: boolean;
}

const PermissionTreeField: FC<PermissionTreeFieldProps> = (props) => {
  const { value = [], onChange, treeData, assignableKeys, disabled } = props;
  const checkedKeys = value.filter((key) => assignableKeys.has(`${key}`));

  return (
    <Tree
      blockNode
      checkable
      disabled={disabled}
      treeData={treeData}
      checkedKeys={checkedKeys}
      height={420}
      onCheck={(checked) => {
        const keys = Array.isArray(checked) ? checked : checked.checked;
        onChange?.(
          keys
            .map((key: Key) => `${key}`)
            .filter((key) => assignableKeys.has(key)),
        );
      }}
    />
  );
};

const RoleHandle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm<RoleRequest>();

  const { data: pData = [], loading: pLoading } = useRequest(() =>
    getPermissionTree({ simple: true, activeOnly: true }),
  );
  const permissionTreeData = useMemo(() => getPermissionTreeData(pData as PermissionListData[]), [pData]);
  const assignablePermissionKeys = useMemo(
    () => getAssignablePermissionKeys(pData as PermissionListData[]),
    [pData],
  );

  const { data, loading, run } = useRequest(detailRolePermissions, {
    manual: true,
  });

  const isSystemRole = !!data?.isSystem;

  useEffect(() => {
    if (id) {
      run(id);
    } else {
      form.resetFields();
    }
  }, [id]);

  useEffect(() => {
    if (data) {
      form.setFieldsValue(getRoleFormValues(data));
    }
  }, [data]);

  const handleFinish = async (values: RoleRequest) => {
    if (isSystemRole) {
      return;
    }

    const payload = {
      ...values,
      permissions: (values.permissions ?? []).filter((permissionId) =>
        assignablePermissionKeys.has(permissionId),
      ),
    };

    try {
      if (id) {
        await putRole(id, payload);
      } else {
        await postRole(payload);
      }
      message.success(id ? "修改成功" : "新增成功");
      form.resetFields();
      navigate(-1);
    } catch {
      return;
    }
  };

  return (
    <FormPageContainer form={form} loading={pLoading || loading}>
      <div className="max-w-5xl mx-auto">
        {isSystemRole ? (
          <Alert className="mb-4" message="系统内置角色不可修改，也不需要配置具体权限。" type="info" showIcon />
        ) : null}
        <Form<RoleRequest>
          {...baseFormItemLayout}
          form={form}
          disabled={isSystemRole}
          initialValues={{ permissions: [] }}
          onFinish={handleFinish}
        >
          <Form.Item name="name" label="名称" rules={[{ required: true, message: "名称不能为空" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="权限"
            extra="模块节点仅用于批量选择，实际保存接口权限；自动同步的新接口需要明确勾选后才会授权。"
          >
            <PermissionTreeField treeData={permissionTreeData} assignableKeys={assignablePermissionKeys} />
          </Form.Item>
          {!isSystemRole ? (
            <FormPageActions>
              <Button type="primary" onClick={() => form.submit()}>
                保存
              </Button>
            </FormPageActions>
          ) : null}
        </Form>
      </div>
    </FormPageContainer>
  );
};

export default RoleHandle;
