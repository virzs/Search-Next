import { Typography, Space, Tag, Card, Button } from "antd";
import {
  RiGithubLine,
  RiGlobalLine,
  RiMailLine,
  RiBugLine,
  RiQuestionLine,
} from "@remixicon/react";
import { DefaultAppView } from "@/components";

const { Title, Text, Paragraph, Link } = Typography;

const AboutView = () => {
  const appInfo = {
    name: "Search Next",
    version: "1.0.0",
    buildDate: "2024-01-15",
    author: "Vir",
    license: "MIT License",
  };

  return (
    <DefaultAppView>
      {/* 应用信息 */}
      <Card
        styles={{ root: { marginBottom: 16 } }}
        actions={[
          <Button
            key="github"
            type="link"
            icon={<RiGithubLine />}
            title="Github"
            href="https://github.com/virzs/Search-Next"
            target="_blank"
            rel="noopener noreferrer"
          />,
          <Button
            key="bug"
            type="link"
            icon={<RiBugLine />}
            title="反馈问题"
            href="https://github.com/virzs/Search-Next/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          />,
        ]}
      >
        <div className="text-center mb-6 pt-6">
          <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <div className="text-white text-2xl font-bold">S</div>
          </div>
          <Title level={2} className="mb-2">
            {appInfo.name}
          </Title>
          <Space>
            <Tag color="blue">v{appInfo.version}</Tag>
            <Tag color="cyan">测试版</Tag>
          </Space>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <Text type="secondary">版本号</Text>
            <div className="font-semibold">{appInfo.version}</div>
          </div>
          <div className="text-center">
            <Text type="secondary">构建日期</Text>
            <div className="font-semibold">{appInfo.buildDate}</div>
          </div>
          <div className="text-center">
            <Text type="secondary">开发者</Text>
            <div className="font-semibold">{appInfo.author}</div>
          </div>
          <div className="text-center">
            <Text type="secondary">许可证</Text>
            <div className="font-semibold">{appInfo.license}</div>
          </div>
        </div>
      </Card>
      {/* 联系方式 */}
      <Card styles={{ root: { marginBottom: 16 } }}>
        <Title level={4} className="mb-2 text-center">
          联系我们
        </Title>
        <Space vertical className="w-full">
          <div className="flex items-center gap-3">
            <RiMailLine className="text-gray-500" />
            <Link href="mailto:zcccxyss@outlook.com">zcccxyss@outlook.com</Link>
          </div>
          <div className="flex items-center gap-3">
            <RiGlobalLine className="text-gray-500" />
            <Link href="https://github.com/virzs/Search-Next" target="_blank">
              官方网站
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <RiQuestionLine className="text-gray-500" />
            <Link href="https://github.com/virzs/Search-Next" target="_blank">
              帮助文档
            </Link>
          </div>
        </Space>
      </Card>
      {/* 致谢 */}
      <Card>
        <div className="text-center">
          <Title level={4} className="mb-2">
            特别感谢
          </Title>
          <Paragraph type="secondary" className="mb-4">
            感谢所有开源项目的贡献者，以及每一位用户的支持与反馈。
          </Paragraph>
          <Text type="secondary" className="text-sm">
            © 2026 Search Next. All rights reserved.
          </Text>
        </div>
      </Card>
    </DefaultAppView>
  );
};

export default AboutView;
