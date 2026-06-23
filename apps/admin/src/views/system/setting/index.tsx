import BasePageContainer from "@/components/containter/base";
import { ProjectData, addProject, getProject, updateProject } from "@/services/system/project";
import { baseFormItemLayout } from "@/utils/utils";
import {
  ProForm,
  ProCard,
  ProFormInstance,
  ProFormText,
  ProFormTextArea,
  ProFormSwitch,
} from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import { message } from "antd";
import { useEffect, useRef } from "react";

const Setting = () => {
  const { data, loading, run } = useRequest(getProject);

  const ref = useRef<ProFormInstance<ProjectData>>(null);

  useEffect(() => {
    if (data) {
      ref.current?.setFieldsValue({
        ...data,
      } as any);
    }
  }, [data]);

  return (
    <BasePageContainer>
      <ProCard loading={loading}>
        <div className="max-w-5xl mx-auto">
          <ProForm<ProjectData>
            {...baseFormItemLayout}
            formRef={ref}
            onFinish={(values) => {
              return new Promise((resolve) => {
                (data?._id ? updateProject(data?._id, values) : addProject(values))
                  .then(() => {
                    message.success("保存成功");
                    resolve(true);
                    run({});
                  })
                  .catch(() => {
                    resolve(false);
                  });
              });
            }}
            submitter={{
              searchConfig: {
                submitText: "保存",
              },
              render: (_, dom) => <div className="flex items-center justify-center gap-2">{...dom}</div>,
            }}
          >
            <div className="text-base font-medium mb-2">基础设置</div>
            <ProFormText name="name" label="系统名称" rules={[{ required: true, message: "请输入名称" }]} />
            <ProFormTextArea name="description" label="描述" />

            <div className="text-base font-medium mt-6 mb-2">登录页设置</div>
            <ProFormText name={["login", "title"]} label="标题" fieldProps={{ style: { width: "100%" } }} />
            <ProFormText name={["login", "subTitle"]} label="副标题" />
            {/* <ProFormUpload
              name={["login", "background"]}
              label="背景"
              fieldProps={{ maxCount: 1, accept: "image/*" }}
            /> */}
            {/* <ProForm.Item name={["login", "agreement"]} label="用户协议">
              <Editor
                uploadImageProps={{
                  action: "/resource/editor",
                  headers: { "Content-Type": "multipart/form-data" },
                }}
              />
            </ProForm.Item> */}

            <div className="text-base font-medium mt-6 mb-2">注册页设置</div>
            <ProFormText name={["register", "title"]} label="标题" />
            <ProFormText name={["register", "subTitle"]} label="副标题" />
            <ProFormSwitch name={["register", "allowRegister"]} label="允许注册" />
            <ProFormTextArea name={["register", "registerDisabledTip"]} label="注册禁用提示" />
            <ProFormSwitch name={["register", "forceInvitationCode"]} label="强制需要邀请码注册" />
            <ProFormSwitch name={["register", "forceEmailCaptcha"]} label="强制邮箱验证码注册" />
            {/* <ProFormUpload
              name={["register", "background"]}
              label="背景"
              fieldProps={{ maxCount: 1, accept: "image/*" }}
            /> */}
            {/* <ProForm.Item name={["login", "agreement"]} label="用户协议">
              <Editor
                uploadImageProps={{
                  action: "/resource/editor",
                  headers: { "Content-Type": "multipart/form-data" },
                }}
              />
            </ProForm.Item> */}
          </ProForm>
        </div>
      </ProCard>
    </BasePageContainer>
  );
};

export default Setting;
