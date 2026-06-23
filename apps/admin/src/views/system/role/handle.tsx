import FullPageContainer from "@/components/containter/full";
import { getPermissionTree } from "@/services/system/permission";
import { RoleRequest, detailRolePermissions, postRole, putRole } from "@/services/system/role";
import { baseFormItemLayout } from "@/utils/utils";
import { BetaSchemaForm, ProCard, ProFormInstance, ProFormColumnsType } from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import { Alert, message } from "antd";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

const getRoleFormValues = (role: RoleRequest): RoleRequest => ({
  ...role,
  permissions: role.permissions ?? [],
});

const RoleHandle = () => {
  const navigate = useNavigate();

  const { data: pData = [], loading: pLoading } = useRequest(getPermissionTree);

  const { id } = useParams();

  const ref = useRef<ProFormInstance<RoleRequest> | undefined>(undefined);

  const { data, loading, run } = useRequest(detailRolePermissions, {
    manual: true,
  });

  const isSystemRole = !!data?.isSystem;

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id]);

  useEffect(() => {
    if (data) {
      ref.current?.setFieldsValue(getRoleFormValues(data));
    }
  }, [data]);

  return (
    <FullPageContainer>
      <div className="max-w-5xl mx-auto">
        <ProCard>
          {isSystemRole ? (
            <Alert className="mb-4" message="系统内置角色不可修改，也不需要配置具体权限。" type="info" showIcon />
          ) : null}
          <BetaSchemaForm<RoleRequest>
            loading={pLoading || loading}
            {...baseFormItemLayout}
            readonly={isSystemRole}
            submitter={
              isSystemRole
                ? false
                : {
                    searchConfig: {
                      submitText: "保存",
                    },
                    render(_, dom) {
                      return <div className="flex items-center justify-center gap-2">{...dom}</div>;
                    },
                  }
            }
            formRef={ref}
            onFinish={(values) => {
              if (isSystemRole) {
                return Promise.resolve(true);
              }
              return new Promise((resolve) => {
                (id ? putRole(id, values) : postRole(values))
                  .then(() => {
                    message.success(id ? "修改成功" : "新增成功");
                    resolve(true);
                    ref.current?.resetFields();
                    navigate(-1);
                  })
                  .catch(() => {
                    resolve(false);
                  });
              });
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
                      message: "名称不能为空",
                    },
                  ],
                },
              },
              {
                title: "描述",
                dataIndex: "description",
                valueType: "textarea",
              },
              {
                title: "权限",
                dataIndex: "permissions",
                valueType: "tree" as ProFormColumnsType<RoleRequest>["valueType"],
                valueEnum: pData,
              },
            ]}
          />
        </ProCard>
      </div>
    </FullPageContainer>
  );
};

export default RoleHandle;
