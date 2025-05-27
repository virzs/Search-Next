"use client";

import { Button, Form, Input } from "antd";
import { Link } from "react-router";
import Footer from "../../components/layout/footer";

const { Item } = Form;

const LoginPage = () => {
  const onFinish = (values: any) => {};

  const onFinishFailed = (errorInfo: any) => {};

  return (
    <div className="flex flex-col w-screen h-screen">
      <main className="flex-1">
        <div className="p-6 flex flex-col items-center justify-center h-full">
          <div className="w-80">
            <div className="text-center text-3xl font-bold mb-8">登录</div>
            <Form
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </Item>
              <Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input placeholder="Password" />
              </Item>
              <Item>
                <Button type="primary" block htmlType="submit">
                  登录
                </Button>
              </Item>
            </Form>
            <p className="text-sm text-center">
              没有账号？
              <Link className="text-blue-500" to="/register">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
