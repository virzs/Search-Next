import { Select } from "antd";
import { useState } from "react";
import { RiTranslate } from "@remixicon/react";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";

interface LanguageOption {
  code: string;
  nativeName: string;
  description?: string;
}

const languages: LanguageOption[] = [
  {
    code: "zh-CN",
    nativeName: "简体中文",
    description: "用于菜单、设置和系统界面的显示语言",
  },
];

const LanguageView = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => localStorage.getItem("app-language") || "zh-CN",
  );

  const selectedLanguageInfo =
    languages.find((language) => language.code === selectedLanguage) ??
    languages[0];

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    localStorage.setItem("app-language", languageCode);
  };

  return (
    <MacSettingsView>
      <MacSettingsSection title="语言">
        <MacSettingsRow
          icon={<RiTranslate size={16} />}
          iconTone="green"
          title="界面语言"
          description={selectedLanguageInfo?.description}
          extra={
            <Select
              size="small"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              options={languages.map((language) => ({
                label: language.nativeName,
                value: language.code,
              }))}
              popupMatchSelectWidth={false}
              className="w-[118px]"
            />
          }
        />
      </MacSettingsSection>
    </MacSettingsView>
  );
};

export default LanguageView;
