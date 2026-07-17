import React from "react";
import { Avatar, Button } from "antd";
import { cx } from "@emotion/css";
import {
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiTimeLine,
} from "@remixicon/react";
import { useAuth } from "@/hooks/useAuth";
import { UserInfo } from "../../types/auth";
import { format } from "date-fns";
import { appleAccountInfoClassName } from "./apple-auth-styles";
import BoringAccountAvatar from "./BoringAccountAvatar";
import { useI18n } from "@/i18n";

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
        <div className="apple-account-header">
          <Avatar
            className="apple-account-avatar"
            size={88}
            src={
              <BoringAccountAvatar
                seed={user?.email || user?.username}
                aria-label={user?.username || t("ui.accountAvatar")}
              />
            }
            style={{
              backgroundImage:
                coverGradientCss ||
                "linear-gradient(135deg, #0a84ff, #30d158)",
            }}
          />

          <div className="apple-account-identity">
            <div className="apple-account-name">{user?.username}</div>
            <div className="apple-account-email">{user?.email}</div>
            <div className="apple-account-status-row">
              <span className="apple-account-badge">
                <RiShieldCheckLine size={14} />
                <span>{t("ui.signedIn")}</span>
              </span>
              <span className="apple-account-joined">
                <RiTimeLine size={14} aria-hidden="true" />
                <span>{t("ui.account.joinedOn", { date: joinedAt })}</span>
              </span>
            </div>
          </div>

          {showActions && (
            <Button
              type="text"
              icon={<RiLogoutBoxRLine size={16} />}
              onClick={handleLogout}
              className="apple-account-logout"
            >
              {t("ui.signOut")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
