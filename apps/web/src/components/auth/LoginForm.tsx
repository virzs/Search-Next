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
  const [form] = Form.useForm<LoginFormData>();
  const { login, loginLoading: contextLoginLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = externalLoading || contextLoginLoading;

  // 默认登录处理
  const defaultLogin = async (data: LoginFormData): Promise<LoginResponse> => {
    return await login(data);
  };

  // 表单提交处理
  const handleSubmit = async (values: LoginFormData) => {
    try {
      const submitHandler = onSubmit || defaultLogin;
      const result = await submitHandler(values);

      if (result.success) {
        message.success(result.message || "登录成功");
      } else {
        message.error(result.message || "登录失败");
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || "登录过程中发生错误";
      message.error(errorMessage);
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
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: "请输入邮箱地址" },
            { type: "email", message: "请输入有效的邮箱地址" },
          ]}
        >
          <Input
            prefix={<RiMailFill size={16} className="apple-auth-field-icon" />}
            placeholder="请输入邮箱地址"
            autoComplete="email"
          />
        </Item>

        {/* 密码输入 */}
        <Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码长度至少6位" },
          ]}
        >
          <Input
            prefix={<RiLockFill size={16} className="apple-auth-field-icon" />}
            type={showPassword ? "text" : "password"}
            placeholder="请输入密码"
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
                <Checkbox>记住我</Checkbox>
              </Item>
            )}
            {showForgotPassword && (
              <Link href="#" className="apple-auth-link">
                忘记密码？
              </Link>
            )}
          </div>
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
            <span>{isLoading ? "登录中..." : "登录"}</span>
          </Button>
        </Item>
      </Form>
    </div>
  );
};

export default LoginForm;
