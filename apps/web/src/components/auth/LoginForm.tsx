import { Form, Input, Button, Checkbox, Typography, message } from "antd";
import { useRef, useState } from "react";
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
import { useRequest } from "ahooks";
import {
  getLegalDocumentVersions,
  type LegalDocumentType,
} from "@/services/system";
import LegalAgreementText from "@/components/legal/LegalAgreementText";
import LegalDocumentModal from "@/components/legal/LegalDocumentModal";

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
  const { t, language } = useI18n();
  const [form] = Form.useForm<LoginFormData>();
  const { login, loginLoading: contextLoginLoading } = useAuth();
  const { projectInfo } = useConfig();
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalInitialType, setLegalInitialType] =
    useState<LegalDocumentType>();
  const pendingValuesRef = useRef<LoginFormData | null>(null);
  const {
    data: legalVersions = [],
    loading: legalVersionsLoading,
    runAsync: refreshLegalVersions,
  } = useRequest(getLegalDocumentVersions);

  const turnstileEnabled = projectInfo?.turnstile?.enabled ?? false;
  const turnstileSiteKey = projectInfo?.turnstile?.siteKey ?? "";

  const isLoading =
    externalLoading || contextLoginLoading || legalVersionsLoading;

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileResetKey((value) => value + 1);
  };

  // 默认登录处理
  const defaultLogin = async (data: LoginFormData): Promise<LoginResponse> => {
    return await login(data);
  };

  const executeLogin = async (values: LoginFormData) => {
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
        legalConfirmations: legalVersions.map((document) => ({
          documentType: document.type,
          revisionId: document.revisionId,
        })),
        legalConfirmationLocale: language,
      });

      if (result.success) {
        message.success(result.message || t("ui.signedInSuccessfully2"));
      } else if (result.legalConfirmationRequired) {
        pendingValuesRef.current = values;
        (form as any).setFieldsValue({ legalAccepted: false });
        await refreshLegalVersions();
        setLegalInitialType(undefined);
        setLegalModalOpen(true);
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

  // 未主动勾选时先阅读确认，再继续同一次登录。
  const handleSubmit = async (values: LoginFormData) => {
    if (legalVersionsLoading) return;
    if (legalVersions.length && !values.legalAccepted) {
      pendingValuesRef.current = values;
      setLegalInitialType(undefined);
      setLegalModalOpen(true);
      return;
    }
    return executeLogin(values);
  };

  return (
    <div className={cx("login-form", appleAuthFormClassName, className)}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          remember: false,
          legalAccepted: false,
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

        {legalVersions.length ? (
          <Item
            name="legalAccepted"
            valuePropName="checked"
            className="mb-4!"
          >
            <Checkbox>
              <LegalAgreementText
                onOpenDocument={(type) => {
                  pendingValuesRef.current = null;
                  setLegalInitialType(type);
                  setLegalModalOpen(true);
                }}
              />
            </Checkbox>
          </Item>
        ) : null}

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
      <LegalDocumentModal
        open={legalModalOpen}
        versions={legalVersions}
        initialActiveType={legalInitialType}
        confirmText={t(
          pendingValuesRef.current
            ? "ui.legal.agreeAndSignIn"
            : "ui.legal.agreeAndContinue",
        )}
        onCancel={() => {
          setLegalModalOpen(false);
          setLegalInitialType(undefined);
          pendingValuesRef.current = null;
        }}
        onConfirm={async () => {
          const values = pendingValuesRef.current;
          (form as any).setFieldsValue({ legalAccepted: true });
          setLegalModalOpen(false);
          setLegalInitialType(undefined);
          pendingValuesRef.current = null;
          if (values) {
            await executeLogin({ ...values, legalAccepted: true });
          }
        }}
      />
    </div>
  );
};

export default LoginForm;
