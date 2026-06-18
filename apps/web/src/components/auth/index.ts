// 认证相关组件导出
export { default as UnloggedView } from './UnloggedView';
export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as AccountInfo } from './AccountInfo';
export { default as BoringAccountAvatar } from './BoringAccountAvatar';

// 认证上下文与 hooks 导出
export { AuthProvider } from '../../contexts/AuthContext';
export { useAuth } from '../../hooks/useAuth';

// 类型定义导出
export type {
  UserInfo,
  LoginFormData,
  RegisterFormData,
  LoginResponse,
  UnloggedViewMode,
  AuthAction,
  LoginSuccessAction,
  UnloggedViewProps,
  LoginFormProps,
  RegisterFormProps,
  AuthState,
  AuthContextValue,
} from '../../types/auth';
