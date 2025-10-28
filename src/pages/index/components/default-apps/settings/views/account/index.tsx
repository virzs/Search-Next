import { useAuth } from "@/contexts/AuthContext";
import UnloggedView from "@/components/auth/UnloggedView";
import AccountInfo from "@/components/auth/AccountInfo";
import { SettingsViewContainer } from "@/components/settings";

const AccountView = () => {
  const { user, isAuthenticated } = useAuth();

  // 未登录视图
  const renderUnloggedView = () => (
    <UnloggedView
      mode="inline"
      title="欢迎使用"
      description="登录后可以同步您的数据和设置"
      onLoginSuccess="show-account"
      onRegisterSuccess="show-account"
      showToggle={true}
    />
  );

  // 已登录视图
  const renderLoggedView = () => {
    if (!user) return null;

    return <AccountInfo user={user} showActions />;
  };

  return isAuthenticated ? renderLoggedView() : <SettingsViewContainer>{renderUnloggedView()}</SettingsViewContainer>;
};

export default AccountView;
