import { useState, useCallback } from "react";
import { Alert, message } from "antd";
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

const authActions: AuthAction[] = ["login", "register"];
const authActionLabel: Record<AuthAction, string> = {
  login: "登录",
  register: "注册",
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
    projectInfo?.register?.registerDisabledTip || "当前项目暂不开放注册";

  // 处理登录成功
  const handleLoginSuccess = useCallback(
    (user: UserInfo) => {
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(user);
      } else {
        switch (onLoginSuccess) {
          case "show-toast":
            message.success("登录成功！");
            break;
          case "close-modal":
            if (mode === "modal" && modalProps.onClose) {
              modalProps.onClose();
            }
            break;
          case "show-account":
            // 这里可以触发显示账号信息的逻辑
            message.success(`欢迎回来，${user.username}！`);
            break;
          case "redirect":
            // 这里可以添加页面跳转逻辑
            window.location.reload();
            break;
          default:
            message.success("登录成功！");
        }
      }
    },
    [onLoginSuccess, mode, modalProps],
  );

  // 处理注册成功
  const handleRegisterSuccess = useCallback(
    (user: UserInfo) => {
      if (typeof onRegisterSuccess === "function") {
        onRegisterSuccess(user);
      } else {
        switch (onRegisterSuccess) {
          case "show-toast":
            message.success("注册成功！");
            break;
          case "close-modal":
            if (mode === "modal" && modalProps.onClose) {
              modalProps.onClose();
            }
            break;
          case "show-account":
            message.success(`注册成功，欢迎 ${user.username}！`);
            break;
          case "redirect":
            window.location.reload();
            break;
          default:
            message.success("注册成功！");
        }
      }
    },
    [onRegisterSuccess, mode, modalProps],
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
      });

      if (response.success && response.user) {
        handleLoginSuccess(response.user);
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "登录失败",
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
        turnstileToken: data.turnstileToken,
      });

      if (response.success && response.user) {
        handleRegisterSuccess(response.user);
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "注册失败",
      };
    }
  };

  // 渲染内容
  const defaultTitle = currentAction === "login" ? "欢迎回来" : "创建账号";
  const defaultDescription =
    currentAction === "login"
      ? "登录后可以同步您的数据和设置"
      : "注册账号以享受完整功能";

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
        showForgotPassword={true}
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
              label: authActionLabel[action],
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
          {currentAction === "login" ? "还没有账号？" : "已有账号？"}
          <button
            type="button"
            onClick={() =>
              setCurrentAction(currentAction === "login" ? "register" : "login")
            }
          >
            {currentAction === "login" ? "立即注册" : "立即登录"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UnloggedView;
