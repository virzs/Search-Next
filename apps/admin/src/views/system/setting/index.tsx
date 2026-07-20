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
  ProFormColorPicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { useRequest } from "ahooks";
import { Alert, Button, message, Switch } from "antd";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RiExternalLinkLine } from "@remixicon/react";
import {
  getRoleList,
  RoleRequest,
  SYSTEM_ADMIN_ROLE_CODE,
} from "@/services/system/role";
import { ProFormUpload } from "@/components/pro-form";
import { useSiteConfig } from "@/contexts/SiteConfigContext";

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
  description: string;
  action?: ReactNode;
  children: ReactNode;
}

const SettingsSection = (props: SettingsSectionProps) => {
  const { title, description, action, children } = props;

  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="m-0 text-base font-semibold tracking-[-0.01em] text-gray-950">
            {title}
          </h2>
          <p className="mb-0 mt-1 text-sm leading-5 text-gray-500">
            {description}
          </p>
        </div>
        {action ? <div className="shrink-0 md:pt-0.5">{action}</div> : null}
      </div>
      {children}
    </section>
  );
};

interface SettingSwitchRowProps {
  name: any;
  title: string;
  description?: string;
}

const SettingSwitchRow = (props: SettingSwitchRowProps) => {
  const { name, title, description } = props;

  return (
    <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-gray-100 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-gray-50/70">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        {description ? (
          <div className="mt-0.5 text-xs leading-5 text-gray-500">
            {description}
          </div>
        ) : null}
      </div>
      <ProForm.Item name={name} valuePropName="checked" noStyle>
        <Switch />
      </ProForm.Item>
    </div>
  );
};

const Setting = () => {
  const { data, loading, runAsync } = useRequest(getProject);
  const { data: roles = [], loading: rolesLoading } = useRequest(getRoleList);
  const [submitting, setSubmitting] = useState(false);
  const { refreshSiteConfig } = useSiteConfig();

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
        headerBordered: true,
        headStyle: {
          minHeight: 64,
          paddingTop: 16,
          paddingBottom: 16,
        },
        bodyStyle: { background: "#f7f8fa" },
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
              .then(async () => {
                message.success("保存成功");
                await Promise.all([runAsync({}), refreshSiteConfig()]);
                return true;
              })
              .catch(() => false)
              .finally(() => {
                setSubmitting(false);
              });
          }}
          submitter={false}
        >
          <div className="space-y-5 pb-6 [&_.ant-form-item]:mb-0 [&_.ant-form-item-extra]:mt-1 [&_.ant-form-item-extra]:text-xs [&_.ant-form-item-extra]:leading-5 [&_.ant-form-item-extra]:text-gray-500 [&_.ant-form-item-label]:pb-1.5 [&_.ant-form-item-label>label]:font-medium [&_.ant-form-item-label>label]:text-gray-800">
            <SettingsSection
              title="基础设置"
              description="控制站点在浏览器与管理后台中展示的品牌信息。"
            >
              <div className="grid gap-4">
                <ProFormText
                  name="name"
                  label="系统名称（网页标题）"
                  extra="Web 使用该名称作为网页标题，Admin 显示为“系统名称 - 管理后台”。"
                  rules={[{ required: true, message: "请输入名称" }]}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                    <ProFormUpload
                      name={["site", "icon"]}
                      label="站点图标"
                      extra="用于 Web 和 Admin 的浏览器标签图标。"
                      fieldProps={{
                        maxCount: 1,
                        listType: "picture-card",
                        dir: "system-site",
                        accept:
                          "image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon",
                      }}
                    />
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                    <ProFormColorPicker
                      name={["site", "themeColor"]}
                      label="主题色"
                      extra="用于 Web 和 Admin 的按钮、选中态、焦点环等组件强调状态。"
                      formItemProps={{
                        rules: [{ required: true, message: "请选择主题色" }],
                        getValueFromEvent: (color: any) =>
                          color?.toRgbString?.(),
                      }}
                      fieldProps={{
                        format: "rgb",
                        showText: true,
                        disabledAlpha: true,
                      } as any}
                    />
                  </div>
                </div>
                <ProFormTextArea
                  name="description"
                  label="描述"
                  fieldProps={{ rows: 3 }}
                />
              </div>
            </SettingsSection>
            <SettingsSection
              title="发布设置"
              description="配置通知页读取公开版本信息的来源。"
            >
              <Alert
                className="mb-4"
                type="info"
                showIcon
                message="通知页将从该公开 GitHub 仓库读取 Web/Admin Release。仅支持 github.com 仓库地址。"
              />
              <ProFormText
                name={["release", "repositoryUrl"]}
                label="GitHub 仓库地址"
                placeholder="https://github.com/owner/repository"
                initialValue="https://github.com/virzs/Search-Next"
                rules={[
                  { required: true, message: "请输入 GitHub 仓库地址" },
                  {
                    pattern:
                      /^https:\/\/github\.com\/[^/?#]+\/[^/?#]+(?:\.git)?\/?$/i,
                    message: "请输入完整的公开 GitHub 仓库地址",
                  },
                ]}
              />
            </SettingsSection>
            <SettingsSection
              title="登录页设置"
              description="调整后台登录页的主标题与辅助文案。"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ProFormText name={["login", "title"]} label="标题" />
                <ProFormText name={["login", "subTitle"]} label="副标题" />
              </div>
            </SettingsSection>
            <SettingsSection
              title="后台登录权限"
              description="选择除系统管理员外可以进入管理后台的角色。"
            >
              <Alert
                className="mb-4"
                type="info"
                showIcon
                message="未选择角色时，仅系统管理员角色可登录后台；已选择角色后，系统管理员和所选角色均可登录后台。"
              />
              <ProFormSelect
                name={["adminAccess", "loginRoleIds"]}
                label="可登录后台的角色"
                mode="multiple"
                placeholder="请选择角色"
                fieldProps={{
                  loading: rolesLoading,
                  optionFilterProp: "label",
                }}
                options={(roles as RoleRequest[]).map((role) => ({
                  label:
                    role.code === SYSTEM_ADMIN_ROLE_CODE
                      ? `${role.name}（默认允许）`
                      : role.name,
                  value: role._id,
                  disabled: role.code === SYSTEM_ADMIN_ROLE_CODE,
                }))}
              />
            </SettingsSection>
            <SettingsSection
              title="注册页设置"
              description="管理注册入口、验证要求以及不可用时的提示。"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ProFormText name={["register", "title"]} label="标题" />
                <ProFormText name={["register", "subTitle"]} label="副标题" />
              </div>
              <div className="mt-1 overflow-hidden rounded-lg border border-gray-200">
                <SettingSwitchRow
                  name={["register", "allowRegister"]}
                  title="允许注册"
                  description="关闭后，用户将无法通过注册页创建账号。"
                />
                <SettingSwitchRow
                  name={["register", "forceInvitationCode"]}
                  title="强制需要邀请码注册"
                  description="开启后，注册时必须填写有效的邀请码。"
                />
                <SettingSwitchRow
                  name={["register", "forceEmailCaptcha"]}
                  title="强制邮箱验证码注册"
                  description="开启后，注册前需要完成邮箱验证码校验。"
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
              description="使用 Turnstile 为公开访问流程增加机器人防护。"
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
                  description="启用后，将使用下方密钥校验相关访问请求。"
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
