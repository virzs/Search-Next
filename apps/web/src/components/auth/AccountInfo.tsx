import React from "react";
import { Avatar, Button } from "antd";
import { motion } from "framer-motion";
import { cx } from "@emotion/css";
import {
  RiLogoutBoxRLine,
  RiMailLine,
  RiShieldCheckLine,
  RiTimeLine,
} from "@remixicon/react";
import { useAuth } from "@/hooks/useAuth";
import { UserInfo } from "../../types/auth";
import { format } from "date-fns";
import { appleAccountInfoClassName } from "./apple-auth-styles";
import BoringAccountAvatar from "./BoringAccountAvatar";
import { useI18n } from "@/i18n";

const MotionDiv = motion.div as any;

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
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cx("account-info", appleAccountInfoClassName, className)}
    >
      <div className="apple-account-card">
        <div className="apple-account-header">
          <Avatar
            className="apple-account-avatar"
            size={84}
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

          <div className="min-w-0">
            <div className="apple-account-name">{user?.username}</div>
            <div className="apple-account-email">{user?.email}</div>
            <div className="apple-account-badge">
              <RiShieldCheckLine size={14} />
              <span>{t("ui.signedIn")}</span>
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

        <div className="apple-account-meta-grid">
          <div className="apple-account-meta">
            <div className="apple-account-meta-label">{t("ui.email")}</div>
            <div className="apple-account-meta-value">
              <RiMailLine size={14} className="mr-1 inline-block align-[-2px]" />
              {user?.email}
            </div>
          </div>
          <div className="apple-account-meta">
            <div className="apple-account-meta-label">{t("ui.joined")}</div>
            <div className="apple-account-meta-value">
              <RiTimeLine size={14} className="mr-1 inline-block align-[-2px]" />
              {joinedAt}
            </div>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default AccountInfo;
