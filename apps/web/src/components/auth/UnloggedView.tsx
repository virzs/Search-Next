import { useState, useCallback } from "react";
import { Alert, message, theme as antdTheme } from "antd";
import type { CSSProperties } from "react";
import { cx } from "@emotion/css";
import {
  UnloggedViewProps,
  AuthAction,
  UserInfo,
  LoginResponse,
  LoginFormData,
  RegisterFormData,
} from "../../types/auth";
import { useAuth } from "@/hooks/useAuth";
import useConfig from "@/hooks/useConfig";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { appleAuthPanelClassName } from "./apple-auth-styles";
import { AppSegmented } from "@/components";
import { AppButton } from "@/components/ui";
import { useI18n } from "@/i18n";

const authActions: AuthAction[] = ["login", "register"];
const authActionLabel: Record<AuthAction, string> = {
  login: "ui.signIn",
  register: "ui.register",
};

const UnloggedView: React.FC<UnloggedViewProps> = ({
  mode = "inline",
  defaultAction = "login",
  activeAction,
  onActionChange,
  showToggle = true,
  onLoginSuccess = "show-toast",
  onRegisterSuccess = "show-toast",
  title,
  description,
  className,
  modalProps = {},
}) => {
  const { t } = useI18n();
  const { token } = antdTheme.useToken();
  const [internalAction, setInternalAction] =
    useState<AuthAction>(defaultAction);
  const currentAction = activeAction ?? internalAction;
  const setCurrentAction = useCallback(
    (action: AuthAction) => {
      if (activeAction === undefined) {
        setInternalAction(action);
      }
      onActionChange?.(action);
    },
    [activeAction, onActionChange],
  );
  // 使用 AuthContext 提供的登录/注册与加载状态
  const { login, register, loginLoading, registerLoading } = useAuth();
  // 使用 ConfigContext 提供的项目公共信息（用于控制注册提示）
  const { projectInfo } = useConfig();
  const allowRegister = projectInfo?.register?.allowRegister ?? true;
  const registerDisabledTip =
    projectInfo?.register?.registerDisabledTip || t("ui.auth.registrationDisabled");

  // 处理登录成功
  const handleLoginSuccess = useCallback(
    (user: UserInfo) => {
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(user);
      } else {
        switch (onLoginSuccess) {
          case "show-toast":
            message.success(t("ui.signedInSuccessfully"));
            break;
          case "close-modal":
            if (mode === "modal" && modalProps.onClose) {
              modalProps.onClose();
            }
            break;
          case "show-account":
            // 这里可以触发显示账号信息的逻辑
            message.success(t("ui.welcomeBackUsername", { username: user.username }));
            break;
          case "redirect":
            // 这里可以添加页面跳转逻辑
            window.location.reload();
            break;
          default:
            message.success(t("ui.signedInSuccessfully"));
        }
      }
    },
    [onLoginSuccess, mode, modalProps, t],
  );

  // 处理注册成功
  const handleRegisterSuccess = useCallback(
    (user: UserInfo) => {
      if (typeof onRegisterSuccess === "function") {
        onRegisterSuccess(user);
      } else {
        switch (onRegisterSuccess) {
          case "show-toast":
            message.success(t("ui.registeredSuccessfully"));
            break;
          case "close-modal":
            if (mode === "modal" && modalProps.onClose) {
              modalProps.onClose();
            }
            break;
          case "show-account":
            message.success(t("ui.registeredSuccessfullyWelcomeUsername", { username: user.username }));
            break;
          case "redirect":
            window.location.reload();
            break;
          default:
            message.success(t("ui.registeredSuccessfully"));
        }
      }
    },
    [onRegisterSuccess, mode, modalProps, t],
  );

  // 已迁移到 useRequest 上方

  // 登录提交处理
  const handleLogin = async (data: LoginFormData): Promise<LoginResponse> => {
    try {
      const response = await login({
        email: data.email,
        password: data.password,
        remember: data.remember,
        turnstileToken: data.turnstileToken,
        legalAccepted: data.legalAccepted,
        legalConfirmations: data.legalConfirmations,
        legalConfirmationLocale: data.legalConfirmationLocale,
      });

      if (response.success && response.user) {
        handleLoginSuccess(response.user);
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || t("ui.signInFailed"),
      };
    }
  };

  // 注册提交处理
  const handleRegister = async (
    data: RegisterFormData,
  ): Promise<LoginResponse> => {
    try {
      const response = await register({
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        captcha: data.captcha,
        invitationCode: data.invitationCode,
        turnstileToken: data.turnstileToken,
        legalAccepted: data.legalAccepted,
        legalConfirmations: data.legalConfirmations,
        legalConfirmationLocale: data.legalConfirmationLocale,
      });

      if (response.success && response.user) {
        handleRegisterSuccess(response.user);
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || t("ui.registrationFailed"),
      };
    }
  };

  // 渲染内容
  const defaultTitle = currentAction === "login" ? t("ui.welcomeBack") : t("ui.createAccount");
  const defaultDescription =
    currentAction === "login"
      ? t("ui.signInToSyncYourDataAndSettings")
      : t("ui.auth.createAccountSubtitle");

  const renderRegisterForm = () =>
    allowRegister ? (
      <RegisterForm onSubmit={handleRegister} loading={registerLoading} />
    ) : (
      <Alert
        className="apple-auth-alert"
        description={registerDisabledTip}
        type="warning"
        showIcon
      />
    );

  const renderForm = () =>
    currentAction === "login" ? (
      <LoginForm
        onSubmit={handleLogin}
        loading={loginLoading}
        showRemember={true}
      />
    ) : (
      renderRegisterForm()
    );

  return (
    <div
      className={cx(
        "unlogged-view-content",
        appleAuthPanelClassName,
        className,
      )}
      style={{ "--auth-accent": token.colorPrimary } as CSSProperties}
    >
      {/* 头部信息 */}
      <div className="apple-auth-copy">
        <div className="apple-auth-title">{title || defaultTitle}</div>
        <div className="apple-auth-description">
          {description || defaultDescription}
        </div>
      </div>
      {/* 表单区域 */}
      {showToggle ? (
        <>
          <AppSegmented<AuthAction>
            block
            className="apple-auth-segmented"
            options={authActions.map((action) => ({
              label: t(authActionLabel[action]),
              value: action,
            }))}
            value={currentAction}
            onChange={setCurrentAction}
          />
          {renderForm()}
        </>
      ) : (
        renderForm()
      )}
      {/* 切换提示（当不显示Tab时） */}
      {!showToggle && (
        <div className="apple-auth-switch-row">
          {t(currentAction === "login" ? "ui.noAccountYet" : "ui.alreadyHaveAnAccount")}
          <AppButton
            intent="link"
            size="small"
            className="ml-1.5"
            onClick={() =>
              setCurrentAction(currentAction === "login" ? "register" : "login")
            }
          >
            {t(currentAction === "login" ? "ui.registerNow" : "ui.signInNow")}
          </AppButton>
        </div>
      )}
    </div>
  );
};

export default UnloggedView;
