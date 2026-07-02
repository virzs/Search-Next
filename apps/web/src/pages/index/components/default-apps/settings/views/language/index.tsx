import { Select } from "antd";
import { RiTranslate } from "@remixicon/react";
import { useI18n, type AppLanguage } from "@/i18n";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";

const LanguageView = () => {
  const { language, languages, setLanguage, t } = useI18n();

  const selectedLanguageInfo = languages.find(
    (item) => item.code === language,
  );

  const handleLanguageChange = (languageCode: AppLanguage) => {
    void setLanguage(languageCode);
  };

  return (
    <MacSettingsView>
      <MacSettingsSection title={t("ui.language")}>
        <MacSettingsRow
          icon={<RiTranslate size={16} />}
          iconTone="green"
          title={t("ui.interfaceLanguage")}
          description={
            selectedLanguageInfo
              ? t(`language.description.${selectedLanguageInfo.code}`)
              : undefined
          }
          extra={
            <Select
              size="small"
              value={language}
              onChange={handleLanguageChange}
              options={languages.map((language) => ({
                label: t(`language.name.${language.code}`),
                value: language.code,
              }))}
              popupMatchSelectWidth={false}
              getPopupContainer={(triggerNode) =>
                triggerNode.closest(".base-modal-panel") ?? document.body
              }
              className="w-[118px]"
            />
          }
        />
      </MacSettingsSection>
    </MacSettingsView>
  );
};

export default LanguageView;
