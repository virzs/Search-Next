import { useAuth } from "@/hooks/useAuth";
import UnloggedView from "@/components/auth/UnloggedView";
import { Avatar, Button } from "antd";
import BoringAccountAvatar from "@/components/auth/BoringAccountAvatar";
import { format } from "date-fns";
import {
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react";
import {
  MacSettingsChevron,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";
import { useI18n } from "@/i18n";

const AccountView = () => {
  const { user, isAuthenticated, logout, coverGradientCss } = useAuth();
  const { t } = useI18n();

  const joinedAt = user?.createdAt
    ? format(user.createdAt, "yyyy-MM-dd")
    : t("ui.unknown");

  const renderUnloggedView = () => (
    <>
      <MacSettingsSection>
        <div className="px-6 py-6 max-[640px]:px-3 max-[640px]:py-4">
          <div className="mx-auto w-full max-w-[440px]">
            <UnloggedView
              mode="inline"
              title={t("ui.welcome")}
              description={t("ui.signInToSyncYourDataAndSettings")}
              onLoginSuccess="show-account"
              onRegisterSuccess="show-account"
              showToggle={true}
            />
          </div>
        </div>
      </MacSettingsSection>
    </>
  );

  const renderLoggedView = () => {
    if (!user) return null;

    return (
      <>
        <div className="rounded-[14px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-5 shadow-[var(--sn-shadow)]">
          <div className="flex items-center gap-5 max-[640px]:items-start">
            <Avatar
              size={88}
              src={
                <BoringAccountAvatar
                  seed={user.email || user.username}
                  aria-label={user.username || t("ui.accountAvatar")}
                />
              }
              style={{
                backgroundImage:
                  coverGradientCss ||
                  "linear-gradient(135deg, #0a84ff, #30d158)",
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[24px] font-bold leading-[30px] text-[var(--sn-text)]">
                {user.username}
              </div>
              <div className="mt-1 truncate text-[13px] leading-5 text-[var(--sn-text-secondary)]">
                {user.email}
              </div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[var(--sn-surface-secondary)] px-2.5 py-1 text-[12px] font-medium text-[var(--sn-text-secondary)]">
                <RiShieldCheckLine size={14} />
                <span>{t("ui.signedIn")}</span>
              </div>
            </div>
            <Button
              type="text"
              icon={<RiLogoutBoxRLine size={16} />}
              onClick={() => void logout()}
              className="h-[34px] shrink-0 rounded-full border border-[rgba(255,59,48,0.18)] bg-[rgba(255,59,48,0.07)] px-3 text-[13px] font-bold text-[#ff3b30] shadow-none hover:!border-[rgba(255,59,48,0.3)] hover:!bg-[rgba(255,59,48,0.1)] hover:!text-[#ff3b30]"
            >
              {t("ui.signOut")}
            </Button>
          </div>
        </div>

        <MacSettingsSection title={t("ui.accountInfo")}>
          <MacSettingsRow
            icon={<RiUserLine size={16} />}
            title={t("ui.profile")}
            description={user.email}
            extra={<MacSettingsValue>{user.username}</MacSettingsValue>}
          />
          <MacSettingsRow
            icon={<RiShieldCheckLine size={16} />}
            iconTone="green"
            title={t("ui.signInAndSecurity")}
            description={t("ui.passwordSessionsAndAccessTokens")}
            extra={<MacSettingsChevron />}
          />
          <MacSettingsRow
            icon={<RiTimeLine size={16} />}
            iconTone="gray"
            title={t("ui.joined")}
            description={t("ui.accountCreationDate")}
            extra={<MacSettingsValue>{joinedAt}</MacSettingsValue>}
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
