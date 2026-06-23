import { baseFormItemLayout } from "@/utils/utils";
import {
  ProForm,
  ProFormInstance,
  ProFormDigit,
  ProFormTextArea,
  ProFormList,
  ProFormSelect,
} from "@ant-design/pro-components";
import { message } from "antd";
import { useRequest } from "ahooks";
import { FC, useEffect, useRef, useState } from "react";
import {
  getDesktopUserLimit,
  createOrUpdateDesktopUserLimit,
  updateDesktopUserLimit,
  DesktopUserLimit,
  DesktopUserLimitResponse,
} from "@/services/tabs/desktop/user-limit";
import { getRoleList, RoleRequest } from "@/services/system/role";
import FullPageContainer from "@/components/containter/full";

const DesktopUserLimitConfig: FC = () => {
  const ref = useRef<ProFormInstance<any>>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [detailValues, setDetailValues] = useState<DesktopUserLimitResponse | null>(null);

  // 获取角色列表
  const { data: roleList = [], loading: roleLoading } = useRequest(getRoleList, {
    defaultParams: [{}],
  });

  const { run: detailRun, loading: detailLoading } = useRequest(getDesktopUserLimit, {
    manual: true,
    onSuccess: (data) => {
      const values = data as DesktopUserLimitResponse;
      setDetailValues(values);
    },
    onError: () => {
      // 如果获取失败，可能是还没有配置，设置默认值
      const defaultValues: DesktopUserLimitResponse = {
        defaultMaxConfigs: 10,
        defaultMaxPages: 50,
        roleConfigs: [],
        description: "",
      };
      setDetailValues(defaultValues);
    },
  });

  // 当服务端返回值更新时，尝试在表单实例就绪后填充
  useEffect(() => {
    if (detailValues && ref.current) {
      const roleConfigs =
        detailValues.roleConfigs?.map((item) => ({
          ...item,
          role: item.role?._id || item.role,
        })) || [];
      ref.current.setFieldsValue({ ...detailValues, roleConfigs });
    }
  }, [detailValues]);

  const { runAsync: saveRun } = useRequest(detailValues ? updateDesktopUserLimit : createOrUpdateDesktopUserLimit, {
    manual: true,
    onSuccess: () => {
      messageApi.success("保存成功");
      // 重新获取数据以更新状态
      detailRun({});
    },
  });

  useEffect(() => {
    // 页面加载时获取配置
    detailRun({});
  }, []);

  return (
    <FullPageContainer loading={detailLoading} showBackButton={false}>
      <div className="max-w-4xl mx-auto py-6">
        <ProForm
          {...baseFormItemLayout}
          formRef={ref}
          initialValues={{
            defaultMaxConfigs: 10,
            defaultMaxPages: 50,
            roleConfigs: [],
            description: "",
          }}
          submitter={{
            searchConfig: { submitText: "保存配置" },
            render: (_, dom) => <div className="flex items-center justify-center gap-2">{...dom}</div>,
            resetButtonProps: false,
          }}
          onFinish={async (values) => {
            const payload: DesktopUserLimit = {
              defaultMaxConfigs: values.defaultMaxConfigs || 10,
              defaultMaxPages: values.defaultMaxPages || 50,
              roleConfigs: values.roleConfigs || [],
              description: values.description || "",
            };
            try {
              await saveRun(payload);
              return true;
            } catch (error) {
              messageApi.error("保存失败");
              return false;
            }
          }}
        >
          <ProFormDigit
            name="defaultMaxConfigs"
            label="默认最大配置数"
            tooltip="用户默认可以创建的最大桌面配置数量"
            placeholder="请输入默认最大配置数"
            min={1}
            max={100}
            rules={[
              { required: true, message: "请输入默认最大配置数" },
              { type: "number", min: 1, message: "最小值为1" },
              { type: "number", max: 100, message: "最大值为100" },
            ]}
          />

          <ProFormDigit
            name="defaultMaxPages"
            label="默认最大页面数"
            tooltip="用户默认可以创建的最大页面数量"
            placeholder="请输入默认最大页面数"
            min={1}
            max={100}
            rules={[
              { required: true, message: "请输入默认最大页面数" },
              { type: "number", min: 1, message: "最小值为1" },
              { type: "number", max: 100, message: "最大值为100" },
            ]}
          />

          <ProFormList
            name="roleConfigs"
            label="角色配置"
            tooltip="为不同角色设置特定的配置数量限制"
            alwaysShowItemLabel={true}
            creatorButtonProps={{
              creatorButtonText: "添加角色配置",
            }}
            copyIconProps={false}
            deleteIconProps={{
              tooltipText: "删除此角色配置",
            }}
          >
            <ProFormSelect
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              name="role"
              label="角色"
              placeholder="请选择角色"
              options={roleList.map((role: RoleRequest) => ({
                label: role.name,
                value: role._id,
              }))}
              rules={[{ required: true, message: "请选择角色" }]}
              fieldProps={{
                loading: roleLoading,
                showSearch: true,
                filterOption: (input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
              }}
            />
            <ProFormDigit
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              name="maxConfigs"
              label="最大配置数"
              placeholder="请输入该角色的最大配置数"
              min={1}
              max={100}
              rules={[
                { required: true, message: "请输入最大配置数" },
                { type: "number", min: 1, message: "最小值为1" },
                { type: "number", max: 100, message: "最大值为100" },
              ]}
            />
            <ProFormDigit
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              name="maxPages"
              label="最大页面数"
              placeholder="请输入该角色的最大页面数"
              min={1}
              max={100}
              rules={[
                { required: true, message: "请输入最大页面数" },
                { type: "number", min: 1, message: "最小值为1" },
                { type: "number", max: 100, message: "最大值为100" },
              ]}
            />
          </ProFormList>

          <ProFormTextArea
            name="description"
            label="配置说明"
            placeholder="请输入配置说明（可选）"
            fieldProps={{ rows: 4, maxLength: 500, showCount: true }}
          />
        </ProForm>
      </div>
      {contextHolder}
    </FullPageContainer>
  );
};

export default DesktopUserLimitConfig;
