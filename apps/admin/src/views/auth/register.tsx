import { getEmailCaptcha, postRegister } from "@/services/auth";
import {
  LoginForm,
  ProFormCaptcha,
  ProFormInstance,
  ProFormText,
} from "@ant-design/pro-components";
import { Alert, Space, Spin, message } from "antd";
import { AuthPaths } from "./router";
import { useNavigate } from "react-router";
import { RegisterRequest } from "@/services/auth/interface";
import { useRequest } from "ahooks";
import { getPublicProject } from "@/services/system/project";
import { useCallback, useEffect, useRef, useState } from "react";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";

const RegisterView = () => {
  const navigate = useNavigate();
  const ref = useRef<ProFormInstance<RegisterRequest>>(null);
  const query = new URLSearchParams(window.location.search);
  const code = query.get("code");

  const { data, loading } = useRequest(getPublicProject);
  const forceEmailCaptcha = data?.register?.forceEmailCaptcha ?? false;
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const turnstileEnabled = data?.turnstile?.enabled ?? false;
  const turnstileSiteKey = data?.turnstile?.siteKey ?? "";

  const clearTurnstileToken = useCallback(() => {
    setTurnstileToken("");
  }, []);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken("");
    setTurnstileResetKey((value) => value + 1);
  }, []);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const hideAutoComplete = {};

  useEffect(() => {
    if (code && ref.current) {
      ref.current.setFieldsValue({ invitationCode: code });
    }
  }, [code, ref.current]);

  return (
    <div className="w-screen h-screen flex justify-center items-center overflow-hidden">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Spin spinning={loading}>
          <LoginForm<RegisterRequest>
            title={data?.register?.title}
            subTitle={data?.register?.subTitle}
            formRef={ref}
            onFinish={(values) => {
              return new Promise((resolve) => {
                if (turnstileEnabled && !turnstileSiteKey) {
                  message.error("人机验证未配置完整，请联系管理员");
                  resolve(false);
                  return;
                }

                if (turnstileEnabled && !turnstileToken) {
                  message.error("请完成人机验证");
                  resolve(false);
                  return;
                }

                postRegister({
                  ...values,
                  ...(turnstileEnabled ? { turnstileToken } : {}),
                })
                  .then(() => {
                    message.success("注册成功");
                    navigate(AuthPaths.login);
                    resolve(true);
                  })
                  .catch(() => {
                    resetTurnstile();
                    resolve(false);
                  });
              });
            }}
          >
            {/* 防止浏览器自动填充 */}
            <div className="h-0 overflow-hidden">
              <input type="text" name="username" />
              <input type="text" name="email" />
              <input type="password" name="password" />
            </div>
            <ProFormText
              name="username"
              placeholder="用户名"
              rules={[
                {
                  required: true,
                  message: "请输入用户名",
                },
              ]}
            />
            <ProFormText
              name="email"
              placeholder="邮箱"
              rules={[
                {
                  required: true,
                  message: "请输入邮箱",
                },
                {
                  type: "email",
                  message: "邮箱格式不正确",
                },
              ]}
              fieldProps={hideAutoComplete}
            />
            {forceEmailCaptcha && (
              <ProFormCaptcha
                phoneName="email"
                name="captcha"
                placeholder="验证码"
                rules={[
                  {
                    required: true,
                    message: "请输入验证码",
                  },
                ]}
                onGetCaptcha={(email) => {
                  return new Promise((resolve, reject) => {
                    if (!email) {
                      reject();
                      return;
                    }
                    getEmailCaptcha(email)
                      .then(() => {
                        message.success(`邮箱 ${email} 验证码发送成功!`);
                        resolve();
                      })
                      .catch(() => {
                        reject();
                      });
                  });
                }}
              />
            )}
            <ProFormText.Password
              name="password"
              placeholder="密码"
              rules={[
                {
                  required: true,
                  message: "请输入确认密码",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      !value ||
                      !getFieldValue("password2") ||
                      getFieldValue("password2") === value
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次密码输入不一致"));
                  },
                }),
              ]}
              fieldProps={hideAutoComplete}
            />
            <ProFormText.Password
              name="password2"
              placeholder="确认密码"
              rules={[
                {
                  required: true,
                  message: "请输入确认密码",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次密码输入不一致"));
                  },
                }),
              ]}
              fieldProps={hideAutoComplete}
            />
            {turnstileEnabled ? (
              turnstileSiteKey ? (
                <div className="mb-4">
                  <CloudflareTurnstile
                    siteKey={turnstileSiteKey}
                    resetKey={turnstileResetKey}
                    onVerify={handleTurnstileVerify}
                    onExpire={clearTurnstileToken}
                    onError={clearTurnstileToken}
                  />
                </div>
              ) : (
                <Alert className="mb-4" type="error" showIcon message="人机验证未配置完整，请联系管理员" />
              )
            ) : null}
            <ProFormText
              name="invitationCode"
              placeholder="邀请码"
              rules={[
                {
                  required: data?.register?.forceInvitationCode ?? false,
                  message: "请输入邀请码",
                },
              ]}
            />
            <Space className="justify-between mb-6 w-full">
              <a
                onClick={() => {
                  navigate(AuthPaths.login);
                }}
              >
                已有帐号？立即登录
              </a>
            </Space>
          </LoginForm>
        </Spin>
      </div>
    </div>
  );
};

export default RegisterView;
