import { useAuth } from "@/hooks/useAuth";
import UnloggedView from "@/components/auth/UnloggedView";
import AccountInfo from "@/components/auth/AccountInfo";
import { DefaultAppView } from "@/components";

const AccountView = () => {
  const { user, isAuthenticated } = useAuth();

  // 未登录视图
  const renderUnloggedView = () => (
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="w-full max-w-[520px] py-10">
        <UnloggedView
          mode="inline"
          title="欢迎使用"
          description="登录后可以同步您的数据和设置"
          onLoginSuccess="show-account"
          onRegisterSuccess="show-account"
          showToggle={true}
        />
      </div>
    </div>
  );

  // 已登录视图
  const renderLoggedView = () => {
    if (!user) return null;

    return <AccountInfo user={user} showActions />;
  };

  return isAuthenticated ? (
    renderLoggedView()
  ) : (
    <DefaultAppView>{renderUnloggedView()}</DefaultAppView>
  );
};

export default AccountView;
