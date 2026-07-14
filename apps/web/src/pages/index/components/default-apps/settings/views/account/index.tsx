import { useAuth } from "@/hooks/useAuth";
import { Avatar, Button } from "antd";
import BoringAccountAvatar from "@/components/auth/BoringAccountAvatar";
import { format } from "date-fns";
import {
  RiArrowRightLine,
  RiCloudLine,
  RiDeviceLine,
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react";
import { useNavigate } from "react-router";
import {
  MacSettingsChevron,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsValue,
  MacSettingsView,
} from "../../components/macos-settings";
import { useI18n } from "@/i18n";
import { accountRoute } from "../../../account/route-paths";

const AccountView = () => {
  const { user, isAuthenticated, logout, coverGradientCss } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const joinedAt = user?.createdAt
    ? format(user.createdAt, "yyyy-MM-dd")
    : t("ui.unknown");

  const renderUnloggedView = () => (
    <section className="relative isolate overflow-hidden rounded-[20px] border border-white/75 bg-white/80 px-8 py-10 shadow-[0_12px_36px_rgba(31,35,48,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-2xl max-[640px]:rounded-[16px] max-[640px]:px-5 max-[640px]:py-8 dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[0_16px_42px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[rgba(10,132,255,0.14)] blur-3xl dark:bg-[rgba(10,132,255,0.18)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[rgba(175,82,222,0.09)] blur-3xl dark:bg-[rgba(191,90,242,0.14)]"
      />

      <div className="relative mx-auto flex w-full max-w-[520px] flex-col items-center text-center">
        <div className="relative grid h-[82px] w-[82px] place-items-center rounded-[25px] bg-[linear-gradient(145deg,#47a7ff_0%,#087cf0_52%,#6554d9_100%)] text-white shadow-[0_16px_30px_rgba(10,132,255,0.24),inset_0_1px_0_rgba(255,255,255,0.42)]">
          <RiUserLine size={38} strokeWidth={1.8} />
          <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-[3px] border-white bg-[#34c759] text-white shadow-[0_2px_7px_rgba(0,0,0,0.14)] dark:border-[#2c2c2e]">
            <RiCloudLine size={14} strokeWidth={2.3} />
          </span>
        </div>

        <h2 className="mt-6 text-[26px] font-bold leading-[32px] tracking-[-0.025em] text-[var(--sn-text)] max-[640px]:text-[23px] max-[640px]:leading-[29px]">
          {t("ui.auth.settingsSignedOutTitle")}
        </h2>
        <p className="mt-2 max-w-[450px] text-[14px] leading-[22px] text-[var(--sn-text-secondary)]">
          {t("ui.auth.settingsSignedOutDescription")}
        </p>

        <Button
          type="primary"
          size="large"
          onClick={() => navigate(accountRoute.path.login)}
          className="mt-7 h-11 min-w-[180px] rounded-full px-6 text-[14px] font-semibold shadow-[0_8px_18px_rgba(10,132,255,0.22)] transition-[transform,box-shadow] duration-200 hover:!shadow-[0_10px_24px_rgba(10,132,255,0.28)] active:!scale-[0.98] motion-reduce:!transform-none motion-reduce:!transition-none"
        >
          <span>{t("ui.auth.signInOrRegister")}</span>
          <RiArrowRightLine size={17} />
        </Button>

        <div className="mt-8 grid w-full grid-cols-3 gap-2 border-t border-[var(--sn-separator)] pt-5 max-[520px]:grid-cols-1 max-[520px]:gap-1 max-[520px]:text-left">
          {[
            {
              icon: <RiCloudLine size={16} />,
              label: t("ui.auth.cloudSync"),
            },
            {
              icon: <RiDeviceLine size={16} />,
              label: t("ui.auth.useAcrossDevices"),
            },
            {
              icon: <RiShieldCheckLine size={16} />,
              label: t("ui.auth.accountSecurity"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 items-center justify-center gap-2 rounded-[10px] px-2 py-1.5 text-[12px] font-medium text-[var(--sn-text-secondary)] max-[520px]:justify-start"
            >
              <span className="text-[var(--sn-accent)]">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
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
