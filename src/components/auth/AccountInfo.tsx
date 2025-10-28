import React, { useMemo } from "react";
import { Avatar, Button, Card, Typography, Space } from "antd";
import { motion } from "framer-motion";
import { RiLogoutBoxRLine, RiShieldCheckLine } from "@remixicon/react";
import { useAuth } from "../../contexts/AuthContext";
import { UserInfo } from "../../types/auth";
import { format } from "date-fns";
import { emailToGradient } from "@/utils/emailGradient";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";

const { Title, Text } = Typography;

interface AccountInfoProps {
  user?: UserInfo;
  showActions?: boolean;
  className?: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ user: propUser, showActions = true, className = "" }) => {
  const { user: contextUser, logout } = useAuth();
  const user = propUser || contextUser;

  const handleLogout = () => {
    logout();
  };

  const coverGradient = emailToGradient(user?.email || "unknown");
  const avatarSrc = useMemo(() => {
    const seed = (user?.email || "unknown").trim().toLowerCase();
    return createAvatar(thumbs, { seed, size: 80 }).toDataUri();
  }, [user?.email]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`account-info h-full flex flex-col gap-12 ${className}`}
    >
      <Card className="overflow-hidden grow" bodyStyle={{ padding: 0 }} variant="borderless">
        {/* 背景封面 */}
        <div className="h-32 relative" style={{ backgroundImage: coverGradient.css }}>
          {/* 头像 */}
          <div className="absolute -bottom-8 left-6">
            <Avatar
              size={80}
              src={avatarSrc}
              style={{
                border: "4px solid white",
              }}
            />
          </div>
        </div>

        {/* 用户信息内容 */}
        <div className="pt-12 pb-6 px-6">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <Title level={3} className="!mb-1">
                {user?.username}
              </Title>
              <Text type="secondary" className="block">
                {user?.email}
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-4">
            <RiShieldCheckLine size={14} />
            <span>加入于 {user?.createdAt && format(user.createdAt, "yyyy-MM-dd")}</span>
          </div>
        </div>
      </Card>
      {showActions && (
        <Space direction="vertical" className="w-full shrink-0">
          <Button type="primary" danger icon={<RiLogoutBoxRLine size={16} />} onClick={handleLogout} block>
            退出登录
          </Button>
        </Space>
      )}
    </motion.div>
  );
};

export default AccountInfo;
