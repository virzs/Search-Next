import { Form, Input, Button, Typography, message } from "antd";
import { useState } from "react";
import { RiUserFill, RiMailFill, RiLockFill, RiEyeFill, RiEyeOffFill, RiShieldCheckFill } from "@remixicon/react";
import { RegisterFormProps, RegisterFormData, LoginResponse } from "../../types/auth";
import { getEmailCaptcha } from "../../services/auth";
import { useAuth } from "@/hooks/useAuth";

const { Text } = Typography;
const { Item } = Form;

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading: externalLoading = false,
  requireCaptcha = false,
  onGetCaptcha,
  className = "",
  initialValues = {},
}) => {
  const [form] = Form.useForm<RegisterFormData>();
  const { register, registerLoading: contextRegisterLoading } = useAuth();
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaSent, setCaptchaSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLoading = externalLoading || contextRegisterLoading;

  // 默认注册处理
  const defaultRegister = async (data: RegisterFormData): Promise<LoginResponse> => {
    return await register(data);
  };

  // 默认获取验证码处理
  const defaultGetCaptcha = async (email: string): Promise<void> => {
    try {
      await getEmailCaptcha(email);
      message.success("验证码已发送到您的邮箱");
    } catch (error: any) {
      throw new Error(error.message || "发送验证码失败");
    }
  };

  // 获取验证码
  const handleGetCaptcha = async () => {
    try {
      const email = form.getFieldValue("email");
      if (!email) {
        message.warning("请先输入邮箱地址");
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        message.warning("请输入有效的邮箱地址");
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
      message.error(error.message || "获取验证码失败");
    } finally {
      setCaptchaLoading(false);
    }
  };

  // 表单提交处理
  const handleSubmit = async (values: RegisterFormData) => {
    try {
      const submitHandler = onSubmit || defaultRegister;
      const result = await submitHandler(values);

      if (result.success) {
        message.success(result.message || "注册成功");
        form.resetFields();
      } else {
        message.error(result.message || "注册失败");
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || "注册过程中发生错误";
      message.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  return (
    <div className={`register-form ${className}`}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={initialValues} size="large">
        {/* 用户名输入 */}
        <Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: "请输入用户名" },
            { min: 2, max: 20, message: "用户名长度为2-20个字符" },
            { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: "用户名只能包含字母、数字、下划线和中文" },
          ]}
        >
          <Input
            prefix={<RiUserFill size={16} className="text-gray-400" />}
            placeholder="请输入用户名"
            autoComplete="username"
          />
        </Item>

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
            prefix={<RiMailFill size={16} className="text-gray-400" />}
            placeholder="请输入邮箱地址"
            autoComplete="email"
          />
        </Item>

        {/* 验证码输入（如果需要） */}
        {requireCaptcha && (
          <Item
            label="邮箱验证码"
            name="captcha"
            rules={[
              { required: true, message: "请输入验证码" },
              { len: 6, message: "验证码为6位数字" },
            ]}
          >
            <div className="flex gap-2">
              <Input
                prefix={<RiShieldCheckFill size={16} className="text-gray-400" />}
                placeholder="请输入6位验证码"
                maxLength={6}
                className="flex-1"
              />
              <Button
                onClick={handleGetCaptcha}
                loading={captchaLoading}
                disabled={captchaSent}
                className="w-24 shrink-0"
              >
                {captchaSent ? `${countdown}s` : "获取验证码"}
              </Button>
            </div>
          </Item>
        )}

        {/* 密码输入 */}
        <Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码长度至少6位" },
            { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: "密码必须包含字母和数字" },
          ]}
        >
          <Input
            prefix={<RiLockFill size={16} className="text-gray-400" />}
            type={showPassword ? "text" : "password"}
            placeholder="请输入密码（至少6位，包含字母和数字）"
            autoComplete="new-password"
            suffix={
              <Button
                type="text"
                size="small"
                icon={showPassword ? <RiEyeOffFill size={16} /> : <RiEyeFill size={16} />}
                onClick={() => setShowPassword(!showPassword)}
                className="!p-0 !border-0 text-gray-400 hover:text-gray-600"
              />
            }
          />
        </Item>

        {/* 确认密码输入 */}
        <Item
          label="确认密码"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "请确认密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input
            prefix={<RiLockFill size={16} className="text-gray-400" />}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="请再次输入密码"
            autoComplete="new-password"
            suffix={
              <Button
                type="text"
                size="small"
                icon={showConfirmPassword ? <RiEyeOffFill size={16} /> : <RiEyeFill size={16} />}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="!p-0 !border-0 text-gray-400 hover:text-gray-600"
              />
            }
          />
        </Item>

        {/* 注册按钮 */}
        <Item className="!mb-0 !mt-6">
          <Button type="primary" htmlType="submit" loading={isLoading} block size="large" className="h-12 font-medium">
            {isLoading ? "注册中..." : "注册账号"}
          </Button>
        </Item>
      </Form>

      {/* 注册提示 */}
      <div className="mt-4 text-center">
        <Text type="secondary" className="text-sm">
          注册即表示您同意我们的
          <a href="#" className="text-blue-500 hover:text-blue-600 mx-1">
            服务条款
          </a>
          和
          <a href="#" className="text-blue-500 hover:text-blue-600 mx-1">
            隐私政策
          </a>
        </Text>
      </div>
    </div>
  );
};

export default RegisterForm;
