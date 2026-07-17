import { css } from "@emotion/css";
import { RiCalendarLine, RiHistoryLine } from "@remixicon/react";
import { Alert, Button, Empty, Skeleton } from "antd";
import { useRequest } from "ahooks";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { VersionUpdateBody } from "@/components/version-updates";
import { formatVersionUpdateDate } from "@/components/version-updates/format";
import { useI18n } from "@/i18n";
import { getVersionUpdates } from "@/services/system";
import { markVersionUpdateRead } from "@/utils/version-update";
import {
  MacSettingsChevron,
  MacSettingsRow,
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";
import { getSettingsAboutReleasePath } from "../../route-paths";

const useReleaseHistory = () =>
  useRequest(() => getVersionUpdates("web"));

export const ReleaseHistoryView = () => {
  const { language, t } = useI18n();
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useReleaseHistory();

  return (
    <MacSettingsView
      navigationTitle={t("ui.versionHistory")}
      showPageHeader={false}
    >
      {error ? (
        <Alert
          type="error"
          showIcon
          message={t("ui.versionHistory.loadFailed")}
          action={
            <Button size="small" onClick={refresh}>
              {t("ui.legal.retry")}
            </Button>
          }
        />
      ) : loading ? (
        <div className={releaseHistoryLoadingClassName} aria-busy="true">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : data?.length ? (
        <MacSettingsSection title={t("ui.versionHistory")}>
          {data.map((update) => {
            const date = formatVersionUpdateDate(
              update.publishedAt,
              language,
            );
            return (
              <MacSettingsRow
                key={update._id}
                icon={<RiHistoryLine size={16} />}
                iconTone="blue"
                title={update.title}
                description={
                  date
                    ? `v${update.version} · ${t(
                        "ui.versionHistory.publishedAt",
                        { date },
                      )}`
                    : `v${update.version}`
                }
                extra={<MacSettingsChevron />}
                onClick={() => {
                  markVersionUpdateRead(update._id);
                  navigate(getSettingsAboutReleasePath(update._id));
                }}
              />
            );
          })}
        </MacSettingsSection>
      ) : (
        <div className={releaseHistoryLoadingClassName}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("ui.versionHistory.empty")}
          />
        </div>
      )}
    </MacSettingsView>
  );
};

export const ReleaseHistoryDetailView = () => {
  const { releaseId } = useParams();
  const { language, t } = useI18n();
  const { data, loading, error, refresh } = useReleaseHistory();
  const update = data?.find((item) => item._id === releaseId);

  useEffect(() => {
    if (releaseId) markVersionUpdateRead(releaseId);
  }, [releaseId]);

  return (
    <MacSettingsView
      navigationTitle={update ? `v${update.version}` : t("ui.versionHistory")}
      showPageHeader={false}
    >
      {error ? (
        <Alert
          type="error"
          showIcon
          message={t("ui.versionHistory.loadFailed")}
          action={
            <Button size="small" onClick={refresh}>
              {t("ui.legal.retry")}
            </Button>
          }
        />
      ) : loading ? (
        <div className={releaseHistoryDetailClassName} aria-busy="true">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : update ? (
        <article
          className={releaseHistoryDetailClassName}
          aria-label={update.title}
        >
          <header className="release-history-header">
            <div className="release-history-kicker">
              <RiHistoryLine size={14} />
              <span>{t("ui.versionHistory")}</span>
            </div>
            <h1>{update.title}</h1>
            <div className="release-history-meta">
              <span>v{update.version}</span>
              {update.publishedAt ? (
                <span>
                  <RiCalendarLine size={14} />
                  <time dateTime={update.publishedAt}>
                    {formatVersionUpdateDate(
                      update.publishedAt,
                      language,
                      true,
                    )}
                  </time>
                </span>
              ) : null}
            </div>
          </header>
          <VersionUpdateBody
            update={update}
            viewerClassName="release-history-richtext"
            footerClassName="release-history-footer"
            buttonClassName="release-history-button"
          />
        </article>
      ) : (
        <div className={releaseHistoryLoadingClassName}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("ui.versionHistory.missingDescription")}
          />
        </div>
      )}
    </MacSettingsView>
  );
};

const releaseHistoryLoadingClassName = css`
  display: grid;
  min-height: 360px;
  place-items: center;
  border: 1px solid var(--sn-separator);
  border-radius: 16px;
  padding: 24px;
  background: var(--sn-surface);
  box-shadow: var(--sn-shadow);

  &[aria-busy="true"] {
    display: block;
  }
`;

const releaseHistoryDetailClassName = css`
  min-height: 420px;
  overflow: hidden;
  border: 1px solid var(--sn-separator);
  border-radius: 16px;
  padding: 22px 24px 26px;
  color: var(--sn-text);
  background: var(--sn-surface);
  box-shadow:
    var(--sn-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.68);

  &[aria-busy="true"] {
    padding-top: 28px;
  }

  .release-history-header {
    padding-bottom: 18px;
    border-bottom: 1px solid var(--sn-separator);
  }

  .release-history-kicker {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 999px;
    padding: 4px 8px;
    color: var(--sn-accent);
    background: color-mix(in srgb, var(--sn-accent) 9%, transparent);
    font-size: 11px;
    font-weight: 700;
  }

  h1 {
    margin: 12px 0 0;
    color: var(--sn-text);
    font-size: clamp(21px, 3vw, 26px);
    font-weight: 720;
    line-height: 1.2;
    letter-spacing: -0.018em;
  }

  .release-history-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 14px;
    margin-top: 10px;
    color: var(--sn-text-tertiary);
    font-size: 12px;
    font-weight: 550;
    font-variant-numeric: tabular-nums;
  }

  .release-history-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .release-history-richtext {
    padding-top: 20px;
  }

  .release-history-richtext .simple-editor {
    padding: 0 !important;
    color: var(--sn-text) !important;
    font-family: inherit !important;
    font-size: 14px !important;
    line-height: 1.72 !important;
    white-space: normal !important;
  }

  .release-history-richtext .simple-editor p,
  .release-history-richtext .simple-editor li,
  .release-history-richtext .simple-editor h1,
  .release-history-richtext .simple-editor h2,
  .release-history-richtext .simple-editor h3 {
    color: var(--sn-text) !important;
  }

  .release-history-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid var(--sn-separator);
  }

  .release-history-button.ant-btn {
    border: 0;
    background: var(--sn-accent);
    font-weight: 650;
    transition: transform 100ms ease-out;
  }

  .release-history-button.ant-btn:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    padding: 18px;
  }

  @media (prefers-reduced-motion: reduce) {
    .release-history-button.ant-btn {
      transition: none;
    }

    .release-history-button.ant-btn:active {
      transform: none;
    }
  }

  @media (prefers-contrast: more) {
    border-color: currentColor;
  }
`;
