// 认证相关类型定义

// 用户信息接口
export interface UserInfo {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

// 登录表单数据
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

// 注册表单数据
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  captcha?: string;
}

// 登录响应
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
  token?: string;
  refreshToken?: string;
}

// 未登录视图显示模式
export type UnloggedViewMode =
  | "inline" // 内联显示（默认）
  | "modal" // 弹窗显示
  | "drawer" // 抽屉显示
  | "fullscreen"; // 全屏显示

// 认证操作类型
export type AuthAction = "login" | "register";

// 登录成功后的处理方式
export type LoginSuccessAction =
  | "show-account" // 显示账号信息
  | "show-toast" // 显示成功提示
  | "close-modal" // 关闭弹窗
  | "redirect" // 页面跳转
  | "custom"; // 自定义处理

// 未登录视图组件属性
export interface UnloggedViewProps {
  // 显示模式
  mode?: UnloggedViewMode;

  // 默认显示的操作（登录或注册）
  defaultAction?: AuthAction;

  // 是否显示切换按钮（登录/注册切换）
  showToggle?: boolean;

  // 登录成功后的处理方式
  onLoginSuccess?: LoginSuccessAction | ((user: UserInfo) => void);

  // 注册成功后的处理方式
  onRegisterSuccess?: LoginSuccessAction | ((user: UserInfo) => void);

  // 自定义标题
  title?: string;

  // 自定义描述
  description?: string;

  // 自定义样式类名
  className?: string;

  // 弹窗相关属性（当mode为modal时）
  modalProps?: {
    visible?: boolean;
    onClose?: () => void;
    width?: number;
    title?: string;
  };

  // 抽屉相关属性（当mode为drawer时）
  drawerProps?: {
    visible?: boolean;
    onClose?: () => void;
    placement?: "left" | "right" | "top" | "bottom";
    width?: number | string;
  };
}

// 登录表单组件属性
export interface LoginFormProps {
  // 提交回调
  onSubmit?: (data: LoginFormData) => Promise<LoginResponse> | LoginResponse;

  // 加载状态
  loading?: boolean;

  // 是否显示记住我选项
  showRemember?: boolean;

  // 是否显示忘记密码链接
  showForgotPassword?: boolean;

  // 自定义样式
  className?: string;

  // 表单初始值
  initialValues?: Partial<LoginFormData>;
}

// 注册表单组件属性
export interface RegisterFormProps {
  // 提交回调
  onSubmit?: (data: RegisterFormData) => Promise<LoginResponse> | LoginResponse;

  // 加载状态
  loading?: boolean;

  // 是否需要验证码
  requireCaptcha?: boolean;

  // 获取验证码回调
  onGetCaptcha?: (email: string) => Promise<void>;

  // 自定义样式
  className?: string;

  // 表单初始值
  initialValues?: Partial<RegisterFormData>;
}

// 认证状态
export interface AuthState {
  // 是否已登录
  isAuthenticated: boolean;

  // 用户信息
  user: UserInfo | null;

  // 是否正在加载
  loading: boolean;
}

// 认证上下文
export interface AuthContextValue extends AuthState {
  // 登录方法
  login: (data: LoginFormData) => Promise<LoginResponse>;

  // 注册方法
  register: (data: RegisterFormData) => Promise<LoginResponse>;

  // 登出方法
  logout: () => Promise<{ success: boolean; message: string }>;

  // 更新用户信息
  updateUser: (user: Partial<UserInfo>) => void;

  // 操作加载状态（由 AuthContext 管理）
  loginLoading: boolean;
  registerLoading: boolean;

  // 基于固定文本（邮箱）生成的头像 Data URI，未登录为 null
  avatarSrc: string | null;

  // 基于固定文本（邮箱）生成的封面 CSS（backgroundImage），未登录为 null
  coverGradientCss: string | null;
}
