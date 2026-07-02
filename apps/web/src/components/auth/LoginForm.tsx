import { Form, Input, Button, Checkbox, Typography, message } from "antd";
import { useState } from "react";
import { cx } from "@emotion/css";
import {
  RiMailFill,
  RiLockFill,
  RiEyeFill,
  RiEyeOffFill,
} from "@remixicon/react";
import { LoginFormProps, LoginFormData, LoginResponse } from "../../types/auth";
import { useAuth } from "@/hooks/useAuth";
import { appleAuthFormClassName } from "./apple-auth-styles";
import useConfig from "@/hooks/useConfig";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";
import { useI18n } from "@/i18n";

const { Link } = Typography;
const { Item } = Form;

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading: externalLoading = false,
  showRemember = true,
  showForgotPassword = true,
  className = "",
  initialValues = {},
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm<LoginFormData>();
  const { login, loginLoading: contextLoginLoading } = useAuth();
  const { projectInfo } = useConfig();
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const turnstileEnabled = projectInfo?.turnstile?.enabled ?? false;
  const turnstileSiteKey = projectInfo?.turnstile?.siteKey ?? "";

  const isLoading = externalLoading || contextLoginLoading;

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileResetKey((value) => value + 1);
  };

  // 默认登录处理
  const defaultLogin = async (data: LoginFormData): Promise<LoginResponse> => {
    return await login(data);
  };

  // 表单提交处理
  const handleSubmit = async (values: LoginFormData) => {
    try {
      if (turnstileEnabled && !turnstileSiteKey) {
        message.error(t("ui.auth.turnstileConfigMissing"));
        return { success: false, message: t("ui.auth.turnstileConfigMissing") };
      }

      if (turnstileEnabled && !turnstileToken) {
        message.error(t("ui.completeHumanVerification"));
        return { success: false, message: t("ui.completeHumanVerification") };
      }

      const submitHandler = onSubmit || defaultLogin;
      const result = await submitHandler({
        ...values,
        ...(turnstileEnabled ? { turnstileToken } : {}),
      });

      if (result.success) {
        message.success(result.message || t("ui.signedInSuccessfully2"));
      } else {
        message.error(result.message || t("ui.signInFailed"));
        resetTurnstile();
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || t("ui.anErrorOccurredWhileSigningIn");
      message.error(errorMessage);
      resetTurnstile();
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  return (
    <div className={cx("login-form", appleAuthFormClassName, className)}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          remember: false,
          ...initialValues,
        }}
        size="large"
      >
        {/* 邮箱输入 */}
        <Item
          label={t("ui.email")}
          name="email"
          rules={[
            { required: true, message: t("ui.enterYourEmailAddress") },
            { type: "email", message: t("ui.enterAValidEmailAddress") },
          ]}
        >
          <Input
            prefix={<RiMailFill size={16} className="apple-auth-field-icon" />}
            placeholder={t("ui.enterYourEmailAddress")}
            autoComplete="email"
          />
        </Item>

        {/* 密码输入 */}
        <Item
          label={t("ui.password")}
          name="password"
          rules={[
            { required: true, message: t("ui.enterYourPassword") },
            { min: 6, message: t("ui.passwordMustBeAtLeast6Characters") },
          ]}
        >
          <Input
            prefix={<RiLockFill size={16} className="apple-auth-field-icon" />}
            type={showPassword ? "text" : "password"}
            placeholder={t("ui.enterYourPassword")}
            autoComplete="current-password"
            suffix={
              <Button
                type="text"
                size="small"
                icon={
                  showPassword ? (
                    <RiEyeOffFill size={16} />
                  ) : (
                    <RiEyeFill size={16} />
                  )
                }
                onClick={() => setShowPassword(!showPassword)}
                className="apple-auth-icon-button"
              />
            }
          />
        </Item>

        {/* 记住我和忘记密码 */}
        {(showRemember || showForgotPassword) && (
          <div className="apple-auth-form-options">
            {showRemember && (
              <Item name="remember" valuePropName="checked" className="mb-0!">
                <Checkbox>{t("ui.rememberMe")}</Checkbox>
              </Item>
            )}
            {showForgotPassword && (
              <Link href="#" className="apple-auth-link">
                {t("ui.forgotPassword")}
              </Link>
            )}
          </div>
        )}

        {turnstileEnabled && (
          <Item className="mb-4!">
            {turnstileSiteKey ? (
              <CloudflareTurnstile
                siteKey={turnstileSiteKey}
                resetKey={turnstileResetKey}
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />
            ) : (
              <div className="text-sm text-red-500">
                {t("ui.auth.turnstileConfigMissing")}
              </div>
            )}
          </Item>
        )}

        {/* 登录按钮 */}
        <Item className="mb-0!">
          <Button
            type="primary"
            htmlType="submit"
            autoInsertSpace={false}
            loading={isLoading}
            block
            size="large"
            className="apple-auth-primary-button"
          >
            <span>{t(isLoading ? "ui.signingIn" : "ui.signIn")}</span>
          </Button>
        </Item>
      </Form>
    </div>
  );
};

export default LoginForm;
