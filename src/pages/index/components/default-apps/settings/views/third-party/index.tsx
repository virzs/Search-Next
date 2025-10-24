import { Form, Input, Button, Switch, Space, Typography, Divider, message } from "antd";
import { useState, useEffect } from "react";
import { RiKeyFill, RiCloudLine, RiSaveFill, RiRefreshLine, RiEyeFill, RiEyeOffFill } from "@remixicon/react";
import { SettingsViewContainer, SettingsViewHeader, SettingsCard, SettingsActions } from "@/components/settings";
import { ThirdPartyConfig, SyncSettings } from "@/types/api-config";
import {
  getLocalApiConfig,
  getSyncSettings,
  saveSyncSettings,
  syncApiConfig,
  pullConfigFromServer,
} from "@/utils/api-config";

const { Title, Text, Paragraph } = Typography;
const { Item } = Form;

interface ApiConfigFormData {
  deepseekApiKey: string;
  serperApiKey: string;
}

const ThirdPartyView = () => {
  const [form] = Form.useForm<ApiConfigFormData>();

  // 模拟登录状态，后续可以从全局状态管理中获取
  const [isLoggedIn] = useState(true);

  // 组件状态
  const [config, setConfig] = useState<ThirdPartyConfig>(getLocalApiConfig());
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(getSyncSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({
    deepseek: false,
    serper: false,
  });

  // 初始化表单数据
  useEffect(() => {
    form.setFieldsValue({
      deepseekApiKey: config.deepseek.apiKey,
      serperApiKey: config.serper.apiKey,
    });
  }, [config, form]);

  // 保存配置
  const handleSave = async (values: ApiConfigFormData) => {
    setIsSaving(true);
    try {
      const newConfig: Partial<ThirdPartyConfig> = {
        deepseek: {
          apiKey: values.deepseekApiKey,
        },
        serper: {
          apiKey: values.serperApiKey,
        },
      };

      const result = await syncApiConfig(newConfig, syncSettings.enabled && isLoggedIn);

      if (result.success) {
        setConfig({ ...config, ...newConfig });
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("保存配置失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 切换同步设置
  const handleSyncToggle = (enabled: boolean) => {
    const newSyncSettings = { ...syncSettings, enabled };
    setSyncSettings(newSyncSettings);
    saveSyncSettings(newSyncSettings);

    if (enabled && isLoggedIn) {
      message.success("已启用服务器同步");
    } else if (enabled && !isLoggedIn) {
      message.warning("请先登录以启用服务器同步");
    } else {
      message.info("已禁用服务器同步");
    }
  };

  // 从服务器同步配置
  const handlePullFromServer = async () => {
    if (!isLoggedIn) {
      message.warning("请先登录");
      return;
    }

    setIsSyncing(true);
    try {
      const result = await pullConfigFromServer();

      if (result.success) {
        const newConfig = getLocalApiConfig();
        setConfig(newConfig);
        form.setFieldsValue({
          deepseekApiKey: newConfig.deepseek.apiKey,
          serperApiKey: newConfig.serper.apiKey,
        });

        const newSyncSettings = getSyncSettings();
        setSyncSettings(newSyncSettings);

        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("同步失败");
    } finally {
      setIsSyncing(false);
    }
  };

  // 切换API密钥显示
  const toggleApiKeyVisibility = (service: "deepseek" | "serper") => {
    setShowApiKeys((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  return (
    <SettingsViewContainer>
      <SettingsViewHeader
        title="第三方服务设置"
        description="配置第三方服务的API密钥，用于增强搜索和AI功能。所有密钥都会安全存储在本地。"
        icon={<RiKeyFill />}
      />

      {/* 同步设置 */}
      {isLoggedIn && (
        <SettingsCard title="同步设置">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Text strong>服务器同步</Text>
              <br />
              <Text type="secondary" className="text-sm">
                启用后，配置将自动同步到服务器，可在其他设备上使用
              </Text>
            </div>
            <Switch
              checked={syncSettings.enabled}
              onChange={handleSyncToggle}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </div>

          {syncSettings.lastSyncTime && (
            <div className="flex items-center justify-between">
              <Text type="secondary" className="text-sm">
                上次同步：{syncSettings.lastSyncTime.toLocaleString()}
              </Text>
              <Button size="small" icon={<RiRefreshLine />} loading={isSyncing} onClick={handlePullFromServer}>
                从服务器同步
              </Button>
            </div>
          )}
        </SettingsCard>
      )}

      {/* API配置表单 */}
      <SettingsCard title="API密钥配置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            deepseekApiKey: config.deepseek.apiKey,
            serperApiKey: config.serper.apiKey,
          }}
        >
          {/* DeepSeek API Key */}
          <Item
            label={
              <div className="flex items-center gap-2">
                <Text strong>DeepSeek API Key</Text>
                <Button
                  type="text"
                  size="small"
                  icon={showApiKeys.deepseek ? <RiEyeOffFill /> : <RiEyeFill />}
                  onClick={() => toggleApiKeyVisibility("deepseek")}
                />
              </div>
            }
            name="deepseekApiKey"
            rules={[
              {
                pattern: /^sk-[a-zA-Z0-9]{32,}$/,
                message: "DeepSeek API Key格式不正确",
              },
            ]}
          >
            <Input.Password
              placeholder="请输入DeepSeek API Key (sk-...)"
              visibilityToggle={false}
              type={showApiKeys.deepseek ? "text" : "password"}
            />
          </Item>

          <div className="mb-4">
            <Text type="secondary" className="text-sm">
              DeepSeek API用于AI搜索和智能问答功能。
              <a
                href="https://platform.deepseek.com/api_keys"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1"
              >
                获取API Key
              </a>
            </Text>
          </div>

          <Divider />

          {/* Serper API Key */}
          <Item
            label={
              <div className="flex items-center gap-2">
                <Text strong>Serper API Key</Text>
                <Button
                  type="text"
                  size="small"
                  icon={showApiKeys.serper ? <RiEyeOffFill /> : <RiEyeFill />}
                  onClick={() => toggleApiKeyVisibility("serper")}
                />
              </div>
            }
            name="serperApiKey"
            rules={[
              {
                pattern: /^[a-zA-Z0-9]{32,}$/,
                message: "Serper API Key格式不正确",
              },
            ]}
          >
            <Input.Password
              placeholder="请输入Serper API Key"
              visibilityToggle={false}
              type={showApiKeys.serper ? "text" : "password"}
            />
          </Item>

          <div className="mb-6">
            <Text type="secondary" className="text-sm">
              Serper API用于增强搜索结果和获取实时信息。
              <a href="https://serper.dev/api-key" target="_blank" rel="noopener noreferrer" className="ml-1">
                获取API Key
              </a>
            </Text>
          </div>

          {/* 保存按钮 */}
          <Item>
            <SettingsActions actions={[]}>
              <Button type="primary" htmlType="submit" icon={<RiSaveFill />} loading={isSaving} size="large">
                保存配置
              </Button>

              {syncSettings.enabled && isLoggedIn && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RiCloudLine size={16} />
                  <span>将同步到服务器</span>
                </div>
              )}
            </SettingsActions>
          </Item>
        </Form>
      </SettingsCard>

      {/* 使用说明 */}
      <SettingsCard title="使用说明">
        <div className="space-y-3">
          <div>
            <Text strong>• 安全性：</Text>
            <Text type="secondary" className="ml-2">
              所有API密钥都会加密存储在本地，不会明文传输
            </Text>
          </div>
          <div>
            <Text strong>• 同步功能：</Text>
            <Text type="secondary" className="ml-2">
              登录后可启用服务器同步，在多设备间共享配置
            </Text>
          </div>
          <div>
            <Text strong>• 功能影响：</Text>
            <Text type="secondary" className="ml-2">
              未配置相应API密钥时，相关功能将使用模拟数据或受限模式
            </Text>
          </div>
        </div>
      </SettingsCard>
    </SettingsViewContainer>
  );
};

export default ThirdPartyView;
