import { Typography, Space, Tag, List, Avatar } from "antd";
import { RiGithubLine, RiGlobalLine, RiMailLine, RiHeartLine, RiBugLine, RiQuestionLine } from "@remixicon/react";
import { SettingsViewContainer, SettingsCard, SettingsActions } from "@/components/settings";

const { Title, Text, Paragraph, Link } = Typography;

const AboutView = () => {
  const appInfo = {
    name: "Search Next",
    version: "1.0.0",
    buildDate: "2024-01-15",
    description: "下一代智能搜索平台",
    author: "开发团队",
    license: "MIT License",
  };

  const dependencies = [
    { name: "React", version: "^19.0.0", description: "用户界面库" },
    { name: "Ant Design", version: "^5.24.9", description: "UI 组件库" },
    { name: "TypeScript", version: "~5.7.2", description: "类型安全的 JavaScript" },
    { name: "Vite", version: "^6.3.1", description: "构建工具" },
    { name: "Framer Motion", version: "^12.12.1", description: "动画库" },
  ];

  const teamMembers = [
    {
      name: "前端开发者",
      role: "Frontend Developer",
      avatar: "",
      description: "负责用户界面设计与开发",
    },
    {
      name: "后端开发者",
      role: "Backend Developer",
      avatar: "",
      description: "负责服务端架构与API开发",
    },
    {
      name: "产品设计师",
      role: "Product Designer",
      avatar: "",
      description: "负责产品设计与用户体验",
    },
  ];

  const handleCheckUpdate = () => {
    // 这里后续实现检查更新逻辑
    console.log("检查更新");
  };

  const handleReportBug = () => {
    // 这里后续实现问题反馈逻辑
    console.log("反馈问题");
  };

  const handleOpenGithub = () => {
    // 这里后续实现打开GitHub逻辑
    window.open("https://github.com", "_blank");
  };

  return (
    <SettingsViewContainer>
      {/* 应用信息 */}
      <SettingsCard>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Text className="text-white text-2xl font-bold">S</Text>
          </div>
          <Title level={2} className="mb-2">
            {appInfo.name}
          </Title>
          <Space>
            <Tag color="blue">v{appInfo.version}</Tag>
            <Tag color="green">稳定版</Tag>
          </Space>
        </div>

        <Paragraph className="text-center text-gray-600 mb-6">{appInfo.description}</Paragraph>

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

        <SettingsActions
          layout="vertical"
          actions={[
            {
              key: "update",
              label: "检查更新",
              type: "primary",
              onClick: handleCheckUpdate,
            },
            {
              key: "github",
              label: "GitHub",
              icon: <RiGithubLine />,
              onClick: handleOpenGithub,
            },
            {
              key: "bug",
              label: "反馈问题",
              icon: <RiBugLine />,
              onClick: handleReportBug,
            },
          ]}
        />
      </SettingsCard>

      {/* 开发团队 */}
      <SettingsCard title="开发团队">
        <List
          dataSource={teamMembers}
          renderItem={(member) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar size={48} className="bg-gradient-to-br from-blue-400 to-purple-500">
                    {member.name.charAt(0)}
                  </Avatar>
                }
                title={member.name}
                description={
                  <div>
                    <Tag color="blue">{member.role}</Tag>
                    <div className="mt-1 text-gray-600">{member.description}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </SettingsCard>

      {/* 技术栈 */}
      <SettingsCard title="技术栈">
        <List
          size="small"
          dataSource={dependencies}
          renderItem={(dep) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{dep.name}</Text>
                    <Tag color="geekblue">{dep.version}</Tag>
                  </Space>
                }
                description={dep.description}
              />
            </List.Item>
          )}
        />
      </SettingsCard>

      {/* 联系方式 */}
      <SettingsCard title="联系我们">
        <Space direction="vertical" className="w-full">
          <div className="flex items-center gap-3">
            <RiMailLine className="text-gray-500" />
            <Link href="mailto:support@searchnext.com">support@searchnext.com</Link>
          </div>
          <div className="flex items-center gap-3">
            <RiGlobalLine className="text-gray-500" />
            <Link href="https://searchnext.com" target="_blank">
              官方网站
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <RiQuestionLine className="text-gray-500" />
            <Link href="https://docs.searchnext.com" target="_blank">
              帮助文档
            </Link>
          </div>
        </Space>
      </SettingsCard>

      {/* 致谢 */}
      <SettingsCard>
        <div className="text-center">
          <RiHeartLine className="text-red-500 text-2xl mb-3" />
          <Title level={4} className="mb-2">
            特别感谢
          </Title>
          <Paragraph type="secondary" className="mb-4">
            感谢所有开源项目的贡献者，以及每一位用户的支持与反馈。
          </Paragraph>
          <Text type="secondary" className="text-sm">
            © 2024 Search Next. All rights reserved.
          </Text>
        </div>
      </SettingsCard>
    </SettingsViewContainer>
  );
};

export default AboutView;
