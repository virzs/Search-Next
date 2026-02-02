import { Typography, Radio, List } from "antd";
import { useState } from "react";
import { RiCheckLine } from "@remixicon/react";
import { SettingsCard, SettingsActions } from "@/components/settings";
import { DefaultAppView } from "@/components";

const { Text, Paragraph } = Typography;

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  description?: string;
}

const LanguageView = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("zh-CN");
  const [isChanged, setIsChanged] = useState(false);

  const languages: LanguageOption[] = [
    {
      code: "zh-CN",
      name: "简体中文",
      nativeName: "简体中文",
      flag: "🇨🇳",
      description: "中国大陆地区使用的简体中文",
    },
  ];

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setIsChanged(languageCode !== "zh-CN"); // 假设默认语言是简体中文
  };

  const handleSaveLanguage = () => {
    // 这里后续实现保存语言设置的逻辑
    console.log("保存语言设置:", selectedLanguage);
    setIsChanged(false);
    // 可以在这里添加本地存储或API调用
    localStorage.setItem("app-language", selectedLanguage);
  };

  const handleResetLanguage = () => {
    setSelectedLanguage("zh-CN");
    setIsChanged(false);
  };

  return (
    <DefaultAppView>
      {isChanged && (
        <SettingsCard>
          <SettingsActions
            align="center"
            actions={[
              {
                key: "save",
                label: "保存设置",
                type: "primary",
                onClick: handleSaveLanguage,
              },
              {
                key: "reset",
                label: "重置",
                onClick: handleResetLanguage,
              },
            ]}
          />
        </SettingsCard>
      )}

      {/* 语言选择列表 */}
      <SettingsCard title="选择语言">
        <Paragraph type="secondary" className="mb-4">
          选择您希望使用的界面语言。更改语言后，界面将立即切换到所选语言。
        </Paragraph>

        <Radio.Group
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full"
        >
          <List
            dataSource={languages}
            renderItem={(language) => (
              <List.Item className="!px-0">
                <Radio value={language.code} className="w-full">
                  <div className="flex items-center gap-3 py-2">
                    <span className="text-xl">{language.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{language.nativeName}</div>
                      <Text type="secondary" className="text-sm">
                        {language.description}
                      </Text>
                    </div>
                    {selectedLanguage === language.code && (
                      <RiCheckLine className="text-green-500" />
                    )}
                  </div>
                </Radio>
              </List.Item>
            )}
          />
        </Radio.Group>
      </SettingsCard>
    </DefaultAppView>
  );
};

export default LanguageView;
