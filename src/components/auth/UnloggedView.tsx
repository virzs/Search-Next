import { useState, useCallback } from "react";
import { Button, Typography, Tabs, message } from "antd";
import {
  UnloggedViewProps,
  AuthAction,
  UserInfo,
  LoginResponse,
  LoginFormData,
  RegisterFormData,
} from "../../types/auth";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UnloggedView: React.FC<UnloggedViewProps> = ({
  mode = "inline",
  defaultAction = "login",
  showToggle = true,
  onLoginSuccess = "show-toast",
  onRegisterSuccess = "show-toast",
  title,
  description,
  modalProps = {},
}) => {
  const [currentAction, setCurrentAction] = useState<AuthAction>(defaultAction);
  // 使用 AuthContext 提供的登录/注册与加载状态
  const { login, register, loginLoading, registerLoading } = useAuth();

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
    [onLoginSuccess, mode, modalProps]
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
    [onRegisterSuccess, mode, modalProps]
  );

  // 已迁移到 useRequest 上方

  // 登录提交处理
  const handleLogin = async (data: LoginFormData): Promise<LoginResponse> => {
    try {
      const response = await login({ email: data.email, password: data.password, remember: data.remember });

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
  const handleRegister = async (data: RegisterFormData): Promise<LoginResponse> => {
    try {
      const response = await register({
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        captcha: data.captcha,
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
  const defaultDescription = currentAction === "login" ? "登录后可以同步您的数据和设置" : "注册账号以享受完整功能";

  return (
    <div className="unlogged-view-content">
      {/* 头部信息 */}
      <div className="text-center mb-8">
        <Title level={3} className="mb-2">
          {title || defaultTitle}
        </Title>
        <Text type="secondary" className="block">
          {description || defaultDescription}
        </Text>
      </div>
      {/* 表单区域 */}
      {showToggle ? (
        <Tabs
          activeKey={currentAction}
          onChange={(key) => setCurrentAction(key as AuthAction)}
          centered
          size="large"
          className="auth-tabs"
        >
          <TabPane tab="登录" key="login">
            <LoginForm onSubmit={handleLogin} loading={loginLoading} showRemember={true} showForgotPassword={true} />
          </TabPane>
          <TabPane tab="注册" key="register">
            <RegisterForm onSubmit={handleRegister} loading={registerLoading} requireCaptcha={false} />
          </TabPane>
        </Tabs>
      ) : (
        <div>
          {currentAction === "login" ? (
            <LoginForm onSubmit={handleLogin} loading={loginLoading} showRemember={true} showForgotPassword={true} />
          ) : (
            <RegisterForm onSubmit={handleRegister} loading={registerLoading} requireCaptcha={false} />
          )}
        </div>
      )}
      {/* 切换提示（当不显示Tab时） */}
      {!showToggle && (
        <div className="text-center mt-6">
          <Text type="secondary" className="text-sm">
            {currentAction === "login" ? "还没有账号？" : "已有账号？"}
            <Button
              type="link"
              size="small"
              onClick={() => setCurrentAction(currentAction === "login" ? "register" : "login")}
              className="!p-0 !h-auto ml-1"
            >
              {currentAction === "login" ? "立即注册" : "立即登录"}
            </Button>
          </Text>
        </div>
      )}
    </div>
  );
};

export default UnloggedView;
