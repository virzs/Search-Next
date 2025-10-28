import { AccountInfo } from "@/components/auth";
import { DesktopBaseModal } from "zs_library";

export interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal = ({ open, onClose }: AccountModalProps) => {
  return (
    <DesktopBaseModal visible={open} onClose={onClose}>
      <AccountInfo />
    </DesktopBaseModal>
  );
};

export default AccountModal;
