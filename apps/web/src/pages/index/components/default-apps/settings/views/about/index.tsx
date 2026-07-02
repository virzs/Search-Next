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
      <div className="rounded-[20px] border border-white/80 bg-white/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[17px] bg-linear-to-br from-[#0a84ff] to-[#30d158] text-3xl font-black text-white shadow-[0_8px_18px_rgba(0,122,255,0.16)]">
            S
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-[25px] font-extrabold text-[#1d1d1f]">
              {appInfo.name}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f2f2f7] px-3 py-1 text-xs font-bold text-[#555]">
                v{appInfo.version}
              </span>
              <span className="rounded-full bg-[#f2f2f7] px-3 py-1 text-xs font-bold text-[#555]">
                {t("ui.beta")}
              </span>
              <span className="rounded-full bg-[#f2f2f7] px-3 py-1 text-xs font-bold text-[#555]">
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

      <div className="rounded-[16px] border border-white/80 bg-white/80 p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
        <div className="text-base font-bold text-[#1d1d1f]">{t("ui.specialThanks")}</div>
        <div className="mt-2 text-sm leading-6 text-[#6e6e73]">
          {t("ui.about.thanksBody")}
        </div>
        <div className="mt-4 text-xs text-[#8e8e93]">
          © 2026 Search Next. All rights reserved.
        </div>
      </div>
    </MacSettingsView>
  );
};

export default AboutView;
