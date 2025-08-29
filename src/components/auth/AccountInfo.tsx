import React from 'react';
import { Avatar, Button, Card, Typography, Space, Dropdown, Menu, message } from 'antd';
import { motion } from 'framer-motion';
import {
  RiUserFill,
  RiLogoutBoxRLine,
  RiSettings3Line,
  RiEditLine,
  RiShieldCheckLine,
} from '@remixicon/react';
import { useAuth } from '../../contexts/AuthContext';
import { UserInfo } from '../../types/auth';

const { Title, Text } = Typography;

interface AccountInfoProps {
  user?: UserInfo;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  onEditProfile?: () => void;
  onSettings?: () => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  user: propUser,
  showActions = true,
  compact = false,
  className = '',
  onEditProfile,
  onSettings,
}) => {
  const { user: contextUser, logout } = useAuth();
  const user = propUser || contextUser;

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        message.success('已成功登出');
      } else {
        message.error(result.message || '登出失败');
      }
    } catch (error) {
      message.error('登出失败');
    }
  };

  const menuItems = [
    {
      key: 'edit',
      icon: <RiEditLine size={16} />,
      label: '编辑资料',
      onClick: onEditProfile,
    },
    {
      key: 'settings',
      icon: <RiSettings3Line size={16} />,
      label: '账号设置',
      onClick: onSettings,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <RiLogoutBoxRLine size={16} />,
      label: '退出登录',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center space-x-3 ${className}`}
      >
        <Avatar size={40} icon={<RiUserFill />} />
        <div className="flex-1 min-w-0">
          <Text strong className="block truncate">
            {user.username}
          </Text>
          <Text type="secondary" className="text-xs block truncate">
            {user.email}
          </Text>
        </div>
        {showActions && (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<RiSettings3Line size={16} />} />
          </Dropdown>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`account-info ${className}`}
    >
      <Card className="text-center">
        <div className="mb-6">
          <Avatar size={80} icon={<RiUserFill />} className="mb-4" />
          <Title level={3} className="mb-2">
            {user.username}
          </Title>
          <Text type="secondary" className="block mb-2">
            {user.email}
          </Text>
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <RiShieldCheckLine size={14} />
            <span>加入于 {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {showActions && (
          <Space direction="vertical" className="w-full">
            <Space className="w-full justify-center">
              <Button
                type="default"
                icon={<RiEditLine size={16} />}
                onClick={onEditProfile}
              >
                编辑资料
              </Button>
              <Button
                type="default"
                icon={<RiSettings3Line size={16} />}
                onClick={onSettings}
              >
                账号设置
              </Button>
            </Space>
            <Button
              type="text"
              danger
              icon={<RiLogoutBoxRLine size={16} />}
              onClick={handleLogout}
              className="w-full"
            >
              退出登录
            </Button>
          </Space>
        )}
      </Card>
    </motion.div>
  );
};

export default AccountInfo;