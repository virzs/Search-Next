import { Button } from "antd";
import { useState } from "react";
import { RiCheckLine, RiTranslate } from "@remixicon/react";
import {
  MacSettingsHero,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";

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
    <MacSettingsView
      action={
        isChanged ? (
          <div className="flex gap-2">
            <Button size="small" onClick={handleResetLanguage}>
              重置
            </Button>
            <Button
              size="small"
              type="primary"
              style={{
                background: "#007aff",
                borderColor: "#007aff",
                boxShadow: "0 8px 18px rgba(0,122,255,0.18)",
              }}
              onClick={handleSaveLanguage}
            >
              保存设置
            </Button>
          </div>
        ) : null
      }
    >
      <MacSettingsHero
        icon={<RiTranslate size={24} />}
        tone="green"
        title="首选语言"
        description="当前仅支持简体中文；更多语言接入后可在这里切换。"
      />

      <MacSettingsSection title="语言">
        {languages.map((language) => {
          const checked = selectedLanguage === language.code;
          return (
            <MacSettingsRow
              key={language.code}
              icon={<span className="text-base">{language.flag}</span>}
              iconTone="red"
              title={language.nativeName}
              description={language.description}
              onClick={() => handleLanguageChange(language.code)}
              extra={
                checked ? (
                  <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#007aff] text-white">
                    <RiCheckLine size={14} />
                  </span>
                ) : null
              }
            />
          );
        })}
        <MacSettingsRow
          icon={<span className="text-xs font-black">A</span>}
          iconTone="gray"
          title="English"
          description="Coming soon"
          extra={<MacSettingsValue>未启用</MacSettingsValue>}
        />
      </MacSettingsSection>
    </MacSettingsView>
  );
};

export default LanguageView;
