import { Form, Input, Button, Checkbox, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { cx } from "@emotion/css";
import {
  RiUserFill,
  RiMailFill,
  RiLockFill,
  RiEyeFill,
  RiEyeOffFill,
  RiShieldCheckFill,
} from "@remixicon/react";
import {
  RegisterFormProps,
  RegisterFormData,
  LoginResponse,
} from "../../types/auth";
import { getEmailCaptcha } from "../../services/auth";
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

const { Item } = Form;

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading: externalLoading = false,
  requireCaptcha,
  onGetCaptcha,
  className = "",
  initialValues = {},
}) => {
  const { t, language } = useI18n();
  const [form] = Form.useForm<RegisterFormData>();
  const { search } = useLocation();
  const { register, registerLoading: contextRegisterLoading } = useAuth();
  const { projectInfo } = useConfig();
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaSent, setCaptchaSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalInitialType, setLegalInitialType] =
    useState<LegalDocumentType>();
  const pendingValuesRef = useRef<RegisterFormData | null>(null);
  const {
    data: legalVersions = [],
    loading: legalVersionsLoading,
    runAsync: refreshLegalVersions,
  } = useRequest(getLegalDocumentVersions);

  const turnstileEnabled = projectInfo?.turnstile?.enabled ?? false;
  const turnstileSiteKey = projectInfo?.turnstile?.siteKey ?? "";
  const forceEmailCaptcha = projectInfo?.register?.forceEmailCaptcha ?? false;
  const forceInvitationCode = projectInfo?.register?.forceInvitationCode ?? false;
  const shouldRequireCaptcha = requireCaptcha ?? forceEmailCaptcha;
  const invitationCodeFromUrl = useMemo(() => {
    const searchParams = new URLSearchParams(search);
    const value = searchParams.get("code");

    return value?.trim() || undefined;
  }, [search]);
  const shouldShowInvitationCode =
    forceInvitationCode ||
    Boolean(initialValues.invitationCode || invitationCodeFromUrl);
  const resolvedInitialValues = {
    legalAccepted: false,
    ...initialValues,
    ...(invitationCodeFromUrl ? { invitationCode: invitationCodeFromUrl } : {}),
  };

  useEffect(() => {
    if (invitationCodeFromUrl) {
      (form as any).setFieldsValue({
        invitationCode: invitationCodeFromUrl,
      });
    }
  }, [form, invitationCodeFromUrl]);

  const isLoading =
    externalLoading || contextRegisterLoading || legalVersionsLoading;

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileResetKey((value) => value + 1);
  };

  // 默认注册处理
  const defaultRegister = async (
    data: RegisterFormData,
  ): Promise<LoginResponse> => {
    return await register(data);
  };

  // 默认获取验证码处理
  const defaultGetCaptcha = async (email: string): Promise<void> => {
    try {
      await getEmailCaptcha(email);
      message.success(t("ui.verificationCodeSentToYourEmail"));
    } catch (error: any) {
      throw new Error(error.message || t("ui.failedToSendVerificationCode"));
    }
  };

  // 获取验证码
  const handleGetCaptcha = async () => {
    try {
      const email = (form as any).getFieldValue("email");
      if (!email) {
        message.warning(t("ui.enterYourEmailAddressFirst"));
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        message.warning(t("ui.enterAValidEmailAddress"));
        return;
      }

      setCaptchaLoading(true);
      const getCaptchaHandler = onGetCaptcha || defaultGetCaptcha;
      await getCaptchaHandler(email);

      setCaptchaSent(true);

      // 开始倒计时
      let count = 60;
      setCountdown(count);
      const timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setCaptchaSent(false);
        }
      }, 1000);
    } catch (error: any) {
      message.error(error.message || t("ui.failedToGetVerificationCode"));
    } finally {
      setCaptchaLoading(false);
    }
  };

  const executeRegister = async (values: RegisterFormData) => {
    try {
      if (turnstileEnabled && !turnstileSiteKey) {
        message.error(t("ui.auth.turnstileConfigMissing"));
        return { success: false, message: t("ui.auth.turnstileConfigMissing") };
      }

      if (turnstileEnabled && !turnstileToken) {
        message.error(t("ui.completeHumanVerification"));
        return { success: false, message: t("ui.completeHumanVerification") };
      }

      const submitHandler = onSubmit || defaultRegister;
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
        message.success(result.message || t("ui.registeredSuccessfully2"));
        (form as any).resetFields();
      } else if (result.legalConfirmationRequired) {
        pendingValuesRef.current = values;
        (form as any).setFieldsValue({ legalAccepted: false });
        await refreshLegalVersions();
        setLegalInitialType(undefined);
        setLegalModalOpen(true);
      } else {
        message.error(result.message || t("ui.registrationFailed"));
        resetTurnstile();
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || t("ui.anErrorOccurredWhileRegistering");
      message.error(errorMessage);
      resetTurnstile();
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const handleSubmit = async (values: RegisterFormData) => {
    if (legalVersionsLoading) return;
    if (legalVersions.length && !values.legalAccepted) {
      pendingValuesRef.current = values;
      setLegalInitialType(undefined);
      setLegalModalOpen(true);
      return;
    }
    return executeRegister(values);
  };

  return (
    <div className={cx("register-form", appleAuthFormClassName, className)}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={resolvedInitialValues}
        size="large"
      >
        {/* 用户名输入 */}
        <Item
          label={t("ui.username")}
          name="username"
          rules={[
            { required: true, message: t("ui.enterAUsername") },
            { min: 2, max: 20, message: t("ui.usernameMustBe220Characters") },
            {
              pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
              message: t("ui.auth.usernamePattern"),
            },
          ]}
        >
          <Input
            prefix={<RiUserFill size={16} className="apple-auth-field-icon" />}
            placeholder={t("ui.enterAUsername")}
            autoComplete="username"
          />
        </Item>

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

        {shouldShowInvitationCode && (
          <Item
            label={t("ui.invitationCode")}
            name="invitationCode"
            rules={[
              {
                required: forceInvitationCode,
                message: t("ui.enterInvitationCode"),
              },
            ]}
          >
            <Input
              prefix={
                <RiShieldCheckFill
                  size={16}
                  className="apple-auth-field-icon"
                />
              }
              placeholder={t("ui.enterInvitationCode")}
              autoComplete="off"
            />
          </Item>
        )}

        {/* 验证码输入（如果需要） */}
        {shouldRequireCaptcha && (
          <Item
            label={t("ui.emailVerificationCode")}
            name="captcha"
            rules={[
              { required: true, message: t("ui.enterTheVerificationCode") },
              { len: 6, message: t("ui.theVerificationCodeMustBe6Digits") },
            ]}
          >
            <div className="apple-auth-captcha-row">
              <Input
                prefix={
                  <RiShieldCheckFill
                    size={16}
                    className="apple-auth-field-icon"
                  />
                }
                placeholder={t("ui.enterThe6DigitCode")}
                maxLength={6}
              />
              <Button
                onClick={handleGetCaptcha}
                loading={captchaLoading}
                disabled={captchaSent}
                className="apple-auth-code-button"
              >
                {captchaSent ? `${countdown}s` : t("ui.getCode")}
              </Button>
            </div>
          </Item>
        )}

        {/* 密码输入 */}
        <Item
          label={t("ui.password")}
          name="password"
          rules={[
            { required: true, message: t("ui.enterYourPassword") },
            { min: 6, message: t("ui.passwordMustBeAtLeast6Characters") },
            {
              pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
              message: t("ui.passwordMustIncludeLettersAndNumbers"),
            },
          ]}
        >
          <Input
            prefix={<RiLockFill size={16} className="apple-auth-field-icon" />}
            type={showPassword ? "text" : "password"}
            placeholder={t("ui.auth.passwordPlaceholder")}
            autoComplete="new-password"
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

        {/* 确认密码输入 */}
        <Item
          label={t("ui.confirmPassword")}
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: t("ui.confirmYourPassword") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("ui.theTwoPasswordsDoNotMatch")));
              },
            }),
          ]}
        >
          <Input
            prefix={<RiLockFill size={16} className="apple-auth-field-icon" />}
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("ui.enterYourPasswordAgain")}
            autoComplete="new-password"
            suffix={
              <Button
                type="text"
                size="small"
                icon={
                  showConfirmPassword ? (
                    <RiEyeOffFill size={16} />
                  ) : (
                    <RiEyeFill size={16} />
                  )
                }
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="apple-auth-icon-button"
              />
            }
          />
        </Item>

        {turnstileEnabled && (
          <Item className="mb-0! mt-6!">
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
            className="mb-4! mt-4!"
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

        {/* 注册按钮 */}
        <Item className="mb-0! mt-6!">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            className="apple-auth-primary-button"
          >
            {t(isLoading ? "ui.registering" : "ui.registerAccount")}
          </Button>
        </Item>
      </Form>
      <LegalDocumentModal
        open={legalModalOpen}
        versions={legalVersions}
        initialActiveType={legalInitialType}
        confirmText={t(
          pendingValuesRef.current
            ? "ui.legal.agreeAndRegister"
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
            await executeRegister({ ...values, legalAccepted: true });
          }
        }}
      />
    </div>
  );
};

export default RegisterForm;
