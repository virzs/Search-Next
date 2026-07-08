import { useNavigate } from "react-router";
import { HomePaths } from "../home/router";
import { postLogin } from "../../services/auth";
import { setRefreshToken, setToken } from "../../utils/token";
import { setUserInfo } from "../../utils/userInfo";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { LoginRequest } from "@/services/auth/interface";
import { useRequest } from "ahooks";
import { getPublicProject } from "@/services/system/project";
import { getSetupStatus } from "@/services/setup";
import { Alert, Image, Space, Spin, message } from "antd";
import { AuthPaths } from "./router";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";
import { useCallback, useState } from "react";

const LoginView = () => {
  const navigate = useNavigate();

  const { data, loading } = useRequest(getPublicProject);
  useRequest(getSetupStatus, {
    onSuccess: (setupStatus) => {
      if (setupStatus.canSetup) {
        navigate(AuthPaths.setup, { replace: true });
      }
    },
  });
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

  return (
    <div className="w-screen h-screen flex justify-center items-center overflow-hidden relative">
      <div className="absolute left-0 right-0">
        <Image
          className="!w-screen !h-screen object-cover"
          src={data?.login?.background?.url}
          preview={false}
        />
      </div>
      <div className="bg-white dark:bg-[#141414] rounded-lg shadow overflow-hidden relative">
        <Spin spinning={loading}>
          <LoginForm<LoginRequest>
            title={data?.login?.title}
            subTitle={data?.login?.subTitle}
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

                postLogin({
                  ...values,
                  ...(turnstileEnabled ? { turnstileToken } : {}),
                })
                  .then((res) => {
                    const { access_token, refresh_token, ...rest } = res;
                    setUserInfo(rest);
                    setToken(access_token);
                    setRefreshToken(refresh_token);
                    navigate(HomePaths.home);
                    resolve(true);
                  })
                  .catch(() => {
                    resetTurnstile();
                    resolve(false);
                  });
              });
            }}
          >
            <ProFormText
              name="email"
              placeholder="邮箱"
              rules={[
                {
                  required: true,
                  message: "请输入邮箱",
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              placeholder="密码"
              rules={[
                {
                  required: true,
                  message: "请输入密码",
                },
              ]}
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
            <Space className="justify-between mb-6 w-full">
              <a
                onClick={() => {
                  navigate(AuthPaths.register);
                }}
              >
                注册账号
              </a>
              <a href="">忘记密码</a>
            </Space>
          </LoginForm>
        </Spin>
      </div>
    </div>
  );
};

export default LoginView;
