import { useAuth } from "@/hooks/useAuth";
import UnloggedView from "@/components/auth/UnloggedView";
import AccountInfo from "@/components/auth/AccountInfo";
import { DefaultAppView } from "@/components";
import { Card } from "antd";

const AccountView = () => {
  const { user, isAuthenticated } = useAuth();

  // 未登录视图
  const renderUnloggedView = () => (
    <Card>
      <div className="w-full max-w-[520px] mx-auto">
        <UnloggedView
          mode="inline"
          title="欢迎使用"
          description="登录后可以同步您的数据和设置"
          onLoginSuccess="show-account"
          onRegisterSuccess="show-account"
          showToggle={true}
        />
      </div>
    </Card>
  );

  // 已登录视图
  const renderLoggedView = () => {
    if (!user) return null;

    return <AccountInfo user={user} showActions />;
  };

  return (
    <DefaultAppView>
      {isAuthenticated ? renderLoggedView() : renderUnloggedView()}
    </DefaultAppView>
  );
};

export default AccountView;
