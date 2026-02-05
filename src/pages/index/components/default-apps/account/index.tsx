import { DesktopBaseModal } from "zs_library";
import useAuth from "@/hooks/useAuth";
import { AccountInfo, UnloggedView } from "@/components/auth";

export interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal = ({ open, onClose }: AccountModalProps) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <DesktopBaseModal visible={open} onClose={onClose}>
      {isAuthenticated && user ? (
        <AccountInfo user={user} showActions />
      ) : (
        <div className="max-w-[400px] mx-auto py-4">
          <UnloggedView
            mode="inline"
            title="欢迎使用"
            description="登录后可以同步您的数据和设置"
            onLoginSuccess="show-account"
            onRegisterSuccess="show-account"
            showToggle={true}
          />
        </div>
      )}
    </DesktopBaseModal>
  );
};

export default AccountModal;
