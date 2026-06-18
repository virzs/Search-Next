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
  const { user: contextUser, logout, coverGradientCss } = useAuth();
  const user = propUser || contextUser;

  const handleLogout = () => {
    logout();
  };

  // 头像由邮箱稳定生成；封面由 AuthContext 生成。
  const joinedAt = user?.createdAt
    ? format(user.createdAt, "yyyy-MM-dd")
    : "未知";

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
                aria-label={user?.username || "账号头像"}
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
              <span>已登录</span>
            </div>
          </div>

          {showActions && (
            <Button
              type="text"
              icon={<RiLogoutBoxRLine size={16} />}
              onClick={handleLogout}
              className="apple-account-logout"
            >
              退出登录
            </Button>
          )}
        </div>

        <div className="apple-account-meta-grid">
          <div className="apple-account-meta">
            <div className="apple-account-meta-label">邮箱</div>
            <div className="apple-account-meta-value">
              <RiMailLine size={14} className="mr-1 inline-block align-[-2px]" />
              {user?.email}
            </div>
          </div>
          <div className="apple-account-meta">
            <div className="apple-account-meta-label">加入时间</div>
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
