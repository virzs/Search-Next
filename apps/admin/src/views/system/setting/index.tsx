import FullPageContainer from "@/components/containter/full";
import {
  ProjectData,
  addProject,
  getProject,
  updateProject,
} from "@/services/system/project";
import {
  ProForm,
  ProFormInstance,
  ProFormDependency,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import { Button, message, Switch } from "antd";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RiExternalLinkLine } from "@remixicon/react";

const TURNSTILE_URL = "https://dash.cloudflare.com/?to=/:account/turnstile";

const passwordFieldProps = {
  autoComplete: "new-password",
  autoCorrect: "off",
  spellCheck: false,
  "data-lpignore": "true",
  "data-1p-ignore": "true",
} as const;

interface SettingsSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

const SettingsSection = (props: SettingsSectionProps) => {
  const { title, action, children } = props;

  return (
    <section className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="m-0 text-base font-semibold text-gray-900">{title}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
};

interface SettingSwitchRowProps {
  name: any;
  title: string;
}

const SettingSwitchRow = (props: SettingSwitchRowProps) => {
  const { name, title } = props;

  return (
    <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0">
      <div className="min-w-0 text-sm font-medium text-gray-900">{title}</div>
      <ProForm.Item name={name} valuePropName="checked" noStyle>
        <Switch />
      </ProForm.Item>
    </div>
  );
};

const Setting = () => {
  const { data, loading, run } = useRequest(getProject);
  const [submitting, setSubmitting] = useState(false);

  const ref = useRef<ProFormInstance<ProjectData>>(null);

  const resetForm = () => {
    ref.current?.resetFields();
    if (data) {
      requestAnimationFrame(() => {
        ref.current?.setFieldsValue({
          ...data,
        } as any);
      });
    }
  };

  const submitForm = () => {
    ref.current?.submit?.();
  };

  useEffect(() => {
    if (data) {
      ref.current?.setFieldsValue({
        ...data,
      } as any);
    }
  }, [data]);

  return (
    <FullPageContainer
      loading={loading}
      showBackButton={false}
      cardProps={{
        extra: (
          <>
            <Button onClick={resetForm} disabled={submitting}>
              重置
            </Button>
            <Button type="primary" onClick={submitForm} loading={submitting}>
              保存设置
            </Button>
          </>
        ),
      }}
    >
      <div className="mx-auto max-w-5xl">
        <ProForm<ProjectData>
          layout="vertical"
          formRef={ref}
          onFinish={(values) => {
            setSubmitting(true);
            return (
              data?._id ? updateProject(data?._id, values) : addProject(values)
            )
              .then(() => {
                message.success("保存成功");
                run({});
                return true;
              })
              .catch(() => false)
              .finally(() => {
                setSubmitting(false);
              });
          }}
          submitter={false}
        >
          <div className="space-y-2">
            <SettingsSection title="基础设置">
              <div className="grid gap-4">
                <ProFormText
                  name="name"
                  label="系统名称"
                  rules={[{ required: true, message: "请输入名称" }]}
                />
                <ProFormTextArea
                  name="description"
                  label="描述"
                  fieldProps={{ rows: 3 }}
                />
              </div>
            </SettingsSection>
            <SettingsSection title="登录页设置">
              <div className="grid gap-4 md:grid-cols-2">
                <ProFormText name={["login", "title"]} label="标题" />
                <ProFormText name={["login", "subTitle"]} label="副标题" />
              </div>
            </SettingsSection>
            <SettingsSection title="注册页设置">
              <div className="grid gap-4 md:grid-cols-2">
                <ProFormText name={["register", "title"]} label="标题" />
                <ProFormText name={["register", "subTitle"]} label="副标题" />
              </div>
              <div className="mt-1 overflow-hidden rounded-lg border border-gray-200">
                <SettingSwitchRow
                  name={["register", "allowRegister"]}
                  title="允许注册"
                />
                <SettingSwitchRow
                  name={["register", "forceInvitationCode"]}
                  title="强制需要邀请码注册"
                />
                <SettingSwitchRow
                  name={["register", "forceEmailCaptcha"]}
                  title="强制邮箱验证码注册"
                />
              </div>

              <div className="mt-4">
                <ProFormTextArea
                  name={["register", "registerDisabledTip"]}
                  label="注册禁用提示"
                  fieldProps={{ rows: 3 }}
                />
              </div>
            </SettingsSection>
            <SettingsSection
              title="Cloudflare 人机验证"
              action={
                <Button
                  type="link"
                  size="small"
                  href={TURNSTILE_URL}
                  target="_blank"
                  rel="noreferrer"
                  icon={<RiExternalLinkLine size={14} />}
                >
                  打开 Turnstile
                </Button>
              }
            >
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <SettingSwitchRow
                  name={["turnstile", "enabled"]}
                  title="启用 Turnstile"
                />
              </div>
              <ProFormDependency name={["turnstile"]}>
                {({ turnstile }) =>
                  turnstile?.enabled ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <ProFormText.Password
                        name={["turnstile", "siteKey"]}
                        label="Site Key"
                        placeholder="请输入 Cloudflare Turnstile Site Key"
                        fieldProps={{
                          ...passwordFieldProps,
                          name: "search-next-turnstile-site-key",
                        }}
                        rules={[{ required: true, message: "请输入 Site Key" }]}
                      />
                      <ProFormText.Password
                        name={["turnstile", "secretKey"]}
                        label="Secret Key"
                        placeholder="请输入 Cloudflare Turnstile Secret Key"
                        fieldProps={{
                          ...passwordFieldProps,
                          name: "search-next-turnstile-secret-key",
                        }}
                        rules={[
                          { required: true, message: "请输入 Secret Key" },
                        ]}
                      />
                    </div>
                  ) : null
                }
              </ProFormDependency>
            </SettingsSection>
          </div>
        </ProForm>
      </div>
    </FullPageContainer>
  );
};

export default Setting;
