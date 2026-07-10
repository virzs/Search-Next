import {
  RiGithubLine,
  RiGlobalLine,
  RiMailLine,
  RiBugLine,
  RiQuestionLine,
} from "@remixicon/react";
import {
  MacSettingsChevron,
  MacSettingsInfoGrid,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";
import { useI18n } from "@/i18n";

const AboutView = () => {
  const { t } = useI18n();
  const appInfo = {
    name: "Search Next",
    version: "1.0.0",
    buildDate: "2024-01-15",
    author: "Vir",
    license: "MIT License",
  };

  return (
    <MacSettingsView>
      <div className="rounded-[14px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-5 shadow-[var(--sn-shadow)]">
        <div className="flex items-center gap-4 max-[640px]:flex-col max-[640px]:items-start">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[14px] bg-[var(--sn-accent)] text-3xl font-bold text-white">
            S
          </div>
          <div className="min-w-0 flex-1 text-left max-[640px]:w-full">
            <div className="truncate text-[24px] font-bold leading-[30px] text-[var(--sn-text)]">
              {appInfo.name}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--sn-surface-secondary)] px-3 py-1 text-[12px] font-medium text-[var(--sn-text-secondary)]">
                v{appInfo.version}
              </span>
              <span className="rounded-full bg-[var(--sn-surface-secondary)] px-3 py-1 text-[12px] font-medium text-[var(--sn-text-secondary)]">
                {t("ui.beta")}
              </span>
              <span className="rounded-full bg-[var(--sn-surface-secondary)] px-3 py-1 text-[12px] font-medium text-[var(--sn-text-secondary)]">
                {appInfo.license}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <MacSettingsInfoGrid
            items={[
              { label: t("ui.versionNumber"), value: appInfo.version },
              { label: t("ui.buildDate"), value: appInfo.buildDate },
              { label: t("ui.developer"), value: appInfo.author },
              { label: t("ui.license"), value: appInfo.license },
            ]}
          />
        </div>
      </div>

      <MacSettingsSection title={t("ui.contact")}>
        <MacSettingsRow
          icon={<RiMailLine size={16} />}
          iconTone="blue"
          title={t("ui.emailAddress")}
          description="zcccxyss@outlook.com"
          extra={<MacSettingsChevron />}
          onClick={() => {
            window.location.href = "mailto:zcccxyss@outlook.com";
          }}
        />
        <MacSettingsRow
          icon={<RiGlobalLine size={16} />}
          iconTone="green"
          title={t("ui.officialWebsite")}
          description="github.com/virzs/Search-Next"
          extra={<MacSettingsChevron />}
          onClick={() => {
            window.open("https://github.com/virzs/Search-Next", "_blank");
          }}
        />
        <MacSettingsRow
          icon={<RiQuestionLine size={16} />}
          iconTone="purple"
          title={t("ui.helpDocs")}
          description={t("ui.gitHubProjectPage")}
          extra={<MacSettingsChevron />}
          onClick={() => {
            window.open("https://github.com/virzs/Search-Next", "_blank");
          }}
        />
        <MacSettingsRow
          icon={<RiGithubLine size={16} />}
          iconTone="gray"
          title="GitHub"
          description="virzs/Search-Next"
          extra={<MacSettingsChevron />}
          onClick={() => {
            window.open("https://github.com/virzs/Search-Next", "_blank");
          }}
        />
        <MacSettingsRow
          icon={<RiBugLine size={16} />}
          iconTone="red"
          title={t("ui.reportIssue")}
          description={t("ui.createAGitHubIssue")}
          extra={<MacSettingsChevron />}
          onClick={() => {
            window.open(
              "https://github.com/virzs/Search-Next/issues/new",
              "_blank",
            );
          }}
        />
      </MacSettingsSection>

      <div className="rounded-[14px] border border-[var(--sn-separator)] bg-[var(--sn-surface)] p-5 text-center shadow-[var(--sn-shadow)]">
        <div className="text-[17px] font-semibold leading-[22px] text-[var(--sn-text)]">{t("ui.specialThanks")}</div>
        <div className="mt-2 text-[13px] leading-5 text-[var(--sn-text-secondary)]">
          {t("ui.about.thanksBody")}
        </div>
        <div className="mt-4 text-[12px] text-[var(--sn-text-tertiary)]">
          © 2026 Search Next. All rights reserved.
        </div>
      </div>
    </MacSettingsView>
  );
};

export default AboutView;
