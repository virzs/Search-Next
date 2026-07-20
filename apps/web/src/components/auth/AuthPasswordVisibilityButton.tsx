import { RiEyeFill, RiEyeOffFill } from "@remixicon/react";
import { AppIconButton } from "@/components/ui";
import { useI18n } from "@/i18n";

interface AuthPasswordVisibilityButtonProps {
  visible: boolean;
  onToggle: () => void;
}

const AuthPasswordVisibilityButton = ({
  visible,
  onToggle,
}: AuthPasswordVisibilityButtonProps) => {
  const { t } = useI18n();

  return (
    <AppIconButton
      aria-label={t(
        visible ? "ui.account.hidePassword" : "ui.account.showPassword",
      )}
      intent="quiet"
      size="small"
      icon={visible ? <RiEyeOffFill size={16} /> : <RiEyeFill size={16} />}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
    />
  );
};

export default AuthPasswordVisibilityButton;
