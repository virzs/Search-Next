import { useAuth } from "@/hooks/useAuth";
import { AccountInfo, LocalAccountInfo } from "@/components/auth";
import {
  RiShieldCheckLine,
  RiUserLine,
} from "@remixicon/react";
import { useNavigate } from "react-router";
import {
  MacSettingsChevron,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";
import { useI18n } from "@/i18n";
import { accountRoute } from "../../../account/route-paths";
import { settingsRoute } from "../../route-paths";

const AccountView = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const renderUnloggedView = () => (
    <LocalAccountInfo
      showActions
      className="w-full"
      onAuthenticate={() => navigate(accountRoute.path.login)}
    />
  );

  const renderLoggedView = () => {
    if (!user) return null;

    return (
      <>
        <AccountInfo user={user} showActions className="w-full" />

        <MacSettingsSection title={t("ui.accountInfo")}>
          <MacSettingsRow
            icon={<RiUserLine size={16} />}
            title={t("ui.profile")}
            description={t("ui.account.profileDescription")}
            extra={<MacSettingsChevron />}
            onClick={() => navigate(settingsRoute.path.accountProfile)}
          />
          <MacSettingsRow
            icon={<RiShieldCheckLine size={16} />}
            iconTone="green"
            title={t("ui.signInAndSecurity")}
            description={t("ui.accountSecurityDescription")}
            extra={<MacSettingsChevron />}
            onClick={() => navigate(settingsRoute.path.accountSecurity)}
          />
        </MacSettingsSection>
      </>
    );
  };

  return (
    <MacSettingsView>
      {isAuthenticated ? renderLoggedView() : renderUnloggedView()}
    </MacSettingsView>
  );
};

export default AccountView;
