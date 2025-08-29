import { Avatar, Button, Form, Input, Space, Typography, Card } from "antd";
import { useState } from "react";
import { motion } from "framer-motion";
import { css } from "@emotion/css";
import { RiEditFill, RiUserFill } from "@remixicon/react";
import { useAuth } from "@/contexts/AuthContext";
import UnloggedView from "@/components/auth/UnloggedView";
import AccountInfo from "@/components/auth/AccountInfo";

const { Title, Text } = Typography;
const { Item } = Form;

const AccountView = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = (values: { username: string; email: string }) => {
    updateUser({
      username: values.username,
      email: values.email,
    });
    setIsEditing(false);
  };

  const handleAvatarChange = () => {
    // 这里后续实现头像上传逻辑
    console.log("上传头像");
  };

  // 未登录视图
  const renderUnloggedView = () => (
    <UnloggedView
      mode="inline"
      title="欢迎使用"
      description="登录后可以同步您的数据和设置"
      onLoginSuccess="show-account"
      onRegisterSuccess="show-account"
      showToggle={true}
    />
  );

  // 已登录视图
  const renderLoggedView = () => {
    if (!user) return null;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Avatar size={100} src={user.avatar} icon={<RiUserFill />} className="!mb-4" />
            <Button
              type="primary"
              shape="circle"
              size="small"
              icon={<RiEditFill size={14} />}
              onClick={handleAvatarChange}
              className={css`
                position: absolute;
                bottom: 16px;
                right: -8px;
              `}
            />
          </div>
          <Title level={3} className="mb-2">
            {user.username}
          </Title>
          <Text type="secondary">{user.email}</Text>
        </div>

        <Card className="!mb-6">
          <Title level={4} className="mb-4">
            个人信息
          </Title>
          {isEditing ? (
            <Form
              layout="vertical"
              initialValues={{
                username: user.username,
                email: user.email,
              }}
              onFinish={handleSaveProfile}
            >
              <Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: "请输入用户名" },
                  { min: 2, max: 20, message: "用户名长度为2-20个字符" },
                ]}
              >
                <Input placeholder="请输入用户名" />
              </Item>
              <Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: "请输入邮箱" },
                  { type: "email", message: "请输入有效的邮箱地址" },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Item>
              <Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    保存
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>取消</Button>
                </Space>
              </Item>
            </Form>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <Text strong>用户名：</Text>
                <Text>{user.username}</Text>
              </div>
              <div className="flex justify-between items-center mb-3">
                <Text strong>邮箱：</Text>
                <Text strong>{user.email}</Text>
              </div>
              <div className="flex justify-between items-center mb-4">
                <Text strong>注册时间：</Text>
                <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
              </div>
              <Button type="primary" icon={<RiEditFill />} onClick={() => setIsEditing(true)}>
                编辑资料
              </Button>
            </div>
          )}
        </Card>

        <AccountInfo user={user} showActions={false} onEditProfile={() => setIsEditing(true)} />
      </motion.div>
    );
  };

  return <div className="flex-1 overflow-auto">{isAuthenticated ? renderLoggedView() : renderUnloggedView()}</div>;
};

export default AccountView;
