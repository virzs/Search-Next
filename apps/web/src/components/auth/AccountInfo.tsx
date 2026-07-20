import React from "react";
import { Avatar } from "antd";
import { cx } from "@emotion/css";
import { RiLogoutBoxRLine, RiTimeLine } from "@remixicon/react";
import { useAuth } from "@/hooks/useAuth";
import { UserInfo } from "../../types/auth";
import { format } from "date-fns";
import { appleAccountInfoClassName } from "./apple-auth-styles";
import BoringAccountAvatar from "./BoringAccountAvatar";
import { useI18n } from "@/i18n";
import { AppButton } from "@/components/ui";

interface AccountInfoProps {
  user?: UserInfo;
  showActions?: boolean;
  className?: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  user: propUser,
  showActions = true,
  className = "",
}) => {
  const { t } = useI18n();
  const { user: contextUser, logout, coverGradientCss } = useAuth();
  const user = propUser || contextUser;

  const handleLogout = () => {
    logout();
  };

  // 头像由邮箱稳定生成；封面由 AuthContext 生成。
  const joinedAt = user?.createdAt
    ? format(user.createdAt, "yyyy-MM-dd")
    : t("ui.unknown");

  return (
    <div className={cx("account-info", appleAccountInfoClassName, className)}>
      <div className="apple-account-card">
        <div
          className="apple-account-cover"
          style={{
            backgroundImage:
              coverGradientCss ||
              "linear-gradient(135deg, #0a84ff 0%, #5e5ce6 52%, #30d158 100%)",
          }}
        >
          {showActions && (
            <AppButton
              intent="quiet"
              size="small"
              icon={<RiLogoutBoxRLine size={16} />}
              onClick={handleLogout}
              className="apple-account-action apple-account-logout"
              aria-label={t("ui.signOut")}
              title={t("ui.signOut")}
            >
              {t("ui.signOut")}
            </AppButton>
          )}
        </div>

        <div className="apple-account-profile">
          <Avatar
            className="apple-account-avatar"
            size={88}
            src={
              <BoringAccountAvatar
                seed={user?.email || user?.username}
                aria-label={user?.username || t("ui.accountAvatar")}
              />
            }
          />

          <div className="apple-account-identity">
            <div className="apple-account-name">{user?.username}</div>
            <div className="apple-account-email">{user?.email}</div>
            <div className="apple-account-meta-row">
              <span className="apple-account-joined">
                <RiTimeLine size={14} aria-hidden="true" />
                <span>{t("ui.account.joinedOn", { date: joinedAt })}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
