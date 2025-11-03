import { DesktopBaseModal } from "zs_library";
import AccountView from "../settings/views/account";

export interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal = ({ open, onClose }: AccountModalProps) => {
  return (
    <DesktopBaseModal visible={open} onClose={onClose}>
      <AccountView />
    </DesktopBaseModal>
  );
};

export default AccountModal;
