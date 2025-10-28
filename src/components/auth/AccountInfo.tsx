import React from "react";
import { Avatar, Button, Card, Typography, Space } from "antd";
import { motion } from "framer-motion";
import { RiUserFill, RiLogoutBoxRLine, RiShieldCheckLine } from "@remixicon/react";
import { useAuth } from "../../contexts/AuthContext";
import { UserInfo } from "../../types/auth";
import { format } from "date-fns";

const { Title, Text } = Typography;

interface AccountInfoProps {
  user?: UserInfo;
  showActions?: boolean;
  className?: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ user: propUser, showActions = true, className = "" }) => {
  const { user: contextUser, logout } = useAuth();
  const user = propUser || contextUser;

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`account-info h-full flex flex-col gap-12 ${className}`}
    >
      <Card className="overflow-hidden grow" bodyStyle={{ padding: 0 }} variant="borderless">
        {/* 背景封面 */}
        <div className="h-32 relative" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          {/* 头像 */}
          <div className="absolute -bottom-8 left-6">
            <Avatar
              size={80}
              icon={<RiUserFill />}
              style={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                border: "4px solid white",
                color: "#666",
              }}
            />
          </div>
        </div>

        {/* 用户信息内容 */}
        <div className="pt-12 pb-6 px-6">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <Title level={3} className="!mb-1">
                {user.username}
              </Title>
              <Text type="secondary" className="block">
                {user.email}
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-4">
            <RiShieldCheckLine size={14} />
            <span>加入于 {format(user.createdAt, "yyyy-MM-dd")}</span>
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
