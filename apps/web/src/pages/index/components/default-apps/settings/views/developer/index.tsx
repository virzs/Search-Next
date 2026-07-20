import { RiCodeSSlashLine, RiStore2Line } from "@remixicon/react";
import { useApp } from "@/hooks/useApp";
import {
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsSwitchRow,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";
import { useI18n } from "@/i18n";

const DeveloperView = () => {
  const { devModeEnabled, toggleDevMode } = useApp();
  const { t } = useI18n();

  return (
    <MacSettingsView>
      <MacSettingsSection title={t("ui.appDevelopment")}>
        <MacSettingsSwitchRow
          icon={<RiCodeSSlashLine size={16} />}
          iconTone="green"
          title={t("ui.developerMode")}
          description={t("ui.dev.modeDescription")}
          checked={devModeEnabled}
          onChange={() => toggleDevMode()}
        />
        <MacSettingsRow
          icon={<RiStore2Line size={16} />}
          iconTone="blue"
          title={t("ui.appStoreEntry")}
          description={t("ui.dev.storeEntryDescription")}
          extra={
            <MacSettingsValue>
              {t(devModeEnabled ? "ui.enabled" : "ui.disabled")}
            </MacSettingsValue>
          }
        />
      </MacSettingsSection>
    </MacSettingsView>
  );
};

export default DeveloperView;
