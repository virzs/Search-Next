import { Avatar } from "antd";
import { cx } from "@emotion/css";
import { RiDeviceLine, RiLoginBoxLine } from "@remixicon/react";
import { AppButton } from "@/components/ui";
import { useI18n } from "@/i18n";
import { appleAccountInfoClassName } from "./apple-auth-styles";
import BoringAccountAvatar from "./BoringAccountAvatar";
import { LOCAL_ACCOUNT_AVATAR_SEED } from "./local-account";

interface LocalAccountInfoProps {
  showActions?: boolean;
  className?: string;
  onAuthenticate: () => void;
}

const LocalAccountInfo = ({
  showActions = true,
  className = "",
  onAuthenticate,
}: LocalAccountInfoProps) => {
  const { t } = useI18n();

  return (
    <div
      className={cx(
        "account-info local-account-info",
        appleAccountInfoClassName,
        className,
      )}
    >
      <div className="apple-account-card">
        <div
          className="apple-account-cover"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #34c759 0%, #0a84ff 52%, #ff9f0a 100%)",
          }}
        >
          {showActions ? (
            <AppButton
              intent="quiet"
              size="small"
              icon={<RiLoginBoxLine size={16} />}
              onClick={onAuthenticate}
              className="apple-account-action apple-account-login"
              aria-label={t("ui.auth.signInOrRegister")}
              title={t("ui.auth.signInOrRegister")}
            >
              {t("ui.auth.signInOrRegister")}
            </AppButton>
          ) : null}
        </div>

        <div className="apple-account-profile">
          <Avatar
            className="apple-account-avatar"
            size={88}
            src={
              <BoringAccountAvatar
                seed={LOCAL_ACCOUNT_AVATAR_SEED}
                aria-label={t("ui.account.localAvatar")}
              />
            }
          />

          <div className="apple-account-identity">
            <div className="apple-account-name">
              {t("ui.account.localName")}
            </div>
            <div className="apple-account-email">
              {t("ui.account.localSubtitle")}
            </div>
            <div className="apple-account-meta-row">
              <span className="apple-account-joined">
                <RiDeviceLine size={14} aria-hidden="true" />
                <span>{t("ui.account.localStatus")}</span>
              </span>
            </div>
            <p className="apple-account-local-description">
              {t("ui.account.localDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalAccountInfo;
