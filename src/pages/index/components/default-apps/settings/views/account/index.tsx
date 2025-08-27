import { Avatar, Button, Form, Input, Space, Typography, Divider, Card } from "antd";
import { useState } from "react";
import { motion } from "framer-motion";
import { css } from "@emotion/css";
import { RiEditFill, RiUserFill } from "@remixicon/react";

const { Title, Text } = Typography;
const { Item } = Form;

interface UserInfo {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

const AccountView = () => {
  // 模拟登录状态，后续可以从全局状态管理中获取
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 模拟用户信息
  const [userInfo, setUserInfo] = useState<UserInfo>({
    _id: "123456",
    username: "用户名",
    email: "user@example.com",
    avatar: "",
    createdAt: new Date("2024-01-01"),
  });

  const handleLogin = () => {
    // 这里后续实现登录逻辑
    setIsLoggedIn(true);
  };

  const handleRegister = () => {
    // 这里后续实现注册逻辑
    console.log("跳转到注册页面");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsEditing(false);
  };

  const handleSaveProfile = (values: { username: string; email: string }) => {
    setUserInfo((prev) => ({
      ...prev,
      username: values.username,
      email: values.email,
    }));
    setIsEditing(false);
  };

  const handleAvatarChange = () => {
    // 这里后续实现头像上传逻辑
    console.log("上传头像");
  };

  // 未登录视图
  const renderUnloggedView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px]"
    >
      <div className="text-center">
        <Avatar size={80} icon={<RiUserFill />} className="!mb-6" />
        <Title level={3} className="mb-2">
          欢迎使用
        </Title>
        <Text type="secondary" className="mb-8 block">
          登录后可以同步您的数据和设置
        </Text>
        <Space direction="vertical" size="middle" className="w-full">
          <Button type="primary" size="large" block onClick={handleLogin} className="h-12">
            登录
          </Button>
          <Button size="large" block onClick={handleRegister} className="h-12">
            注册
          </Button>
        </Space>
      </div>
    </motion.div>
  );

  // 已登录视图
  const renderLoggedView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <Avatar size={100} src={userInfo.avatar} icon={<RiUserFill />} className="!mb-4" />
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
          {userInfo.username}
        </Title>
        <Text type="secondary">{userInfo.email}</Text>
      </div>

      <Card className="!mb-6">
        <Title level={4} className="mb-4">
          个人信息
        </Title>
        {isEditing ? (
          <Form
            layout="vertical"
            initialValues={{
              username: userInfo.username,
              email: userInfo.email,
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
              <Text>{userInfo.username}</Text>
            </div>
            <div className="flex justify-between items-center mb-3">
              <Text strong>邮箱：</Text>
              <Text>{userInfo.email}</Text>
            </div>
            <div className="flex justify-between items-center mb-4">
              <Text strong>注册时间：</Text>
              <Text>{userInfo.createdAt.toLocaleDateString()}</Text>
            </div>
            <Button type="primary" icon={<RiEditFill />} onClick={() => setIsEditing(true)}>
              编辑资料
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <Title level={4} className="mb-4">
          账号管理
        </Title>
        <Space direction="vertical" className="w-full">
          <Button block>修改密码</Button>
          <Divider />
          <Button danger block onClick={handleLogout}>
            退出登录
          </Button>
        </Space>
      </Card>
    </motion.div>
  );

  return <div className="flex-1 overflow-auto">{isLoggedIn ? renderLoggedView() : renderUnloggedView()}</div>;
};

export default AccountView;
