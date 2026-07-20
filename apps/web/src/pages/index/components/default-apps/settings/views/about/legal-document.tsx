import { css } from "@emotion/css";
import { Alert, Empty, Skeleton } from "antd";
import { useRequest } from "ahooks";
import { SimpleEditorViewer } from "zs_library";
import { useI18n } from "@/i18n";
import {
  getPublicLegalDocument,
  type LegalDocumentType,
} from "@/services/system";
import { MacSettingsView } from "../../components/macos-settings";
import { AppButton } from "@/components/ui";

interface LegalDocumentViewProps {
  type: LegalDocumentType;
}

const LegalDocumentView = ({ type }: LegalDocumentViewProps) => {
  const { language, t } = useI18n();
  const {
    data: document,
    loading,
    error,
    refresh,
  } = useRequest(() => getPublicLegalDocument(type, language), {
    refreshDeps: [language, type],
  });
  const title = t(
    type === "terms" ? "ui.termsOfService" : "ui.privacyPolicy",
  );

  return (
    <MacSettingsView navigationTitle={title} showPageHeader={false}>
      {error ? (
        <Alert
          type="error"
          showIcon
          message={t("ui.legal.loadFailed")}
          description={t("ui.legal.pageRetryDescription")}
          action={
            <AppButton size="small" onClick={refresh}>
              {t("ui.legal.retry")}
            </AppButton>
          }
        />
      ) : loading ? (
        <div className={legalDocumentPageClassName} aria-busy="true">
          <Skeleton active paragraph={{ rows: 12 }} />
        </div>
      ) : document ? (
        <article
          className={legalDocumentPageClassName}
          aria-label={document.title || title}
        >
          <div className="legal-page-meta">
            <span>
              {t("ui.legal.confirmationVersion", {
                version: document.consentVersion,
              })}
            </span>
            {document.publishedAt ? (
              <time dateTime={document.publishedAt}>
                {new Date(document.publishedAt).toLocaleDateString(language)}
              </time>
            ) : null}
          </div>
          <SimpleEditorViewer
            sanitize
            value={document.content}
            className="legal-page-richtext"
          />
        </article>
      ) : (
        <div className={legalDocumentPageClassName}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("ui.legal.notPublished")}
          />
        </div>
      )}
    </MacSettingsView>
  );
};

export default LegalDocumentView;

const legalDocumentPageClassName = css`
  min-height: 420px;
  overflow: hidden;
  border: 1px solid var(--sn-separator);
  border-radius: var(--sn-radius-panel);
  padding: 22px 24px 28px;
  color: var(--sn-text);
  background: var(--sn-surface);
  box-shadow:
    var(--sn-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);

  &[aria-busy="true"] {
    padding-top: 28px;
  }

  .legal-page-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    color: var(--sn-text-tertiary);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .legal-page-richtext .simple-editor {
    color: var(--sn-text) !important;
    font-family: inherit !important;
    font-size: 14px !important;
    line-height: 1.75 !important;
  }

  .legal-page-richtext .simple-editor h1,
  .legal-page-richtext .simple-editor h2,
  .legal-page-richtext .simple-editor h3 {
    color: var(--sn-text) !important;
    font-family: inherit !important;
    letter-spacing: -0.012em;
  }

  .legal-page-richtext .simple-editor h1 {
    font-size: 22px !important;
    line-height: 1.3 !important;
  }

  .legal-page-richtext .simple-editor h2 {
    margin: 26px 0 12px !important;
    font-size: 17px !important;
    line-height: 1.4 !important;
  }

  .legal-page-richtext .simple-editor h3 {
    margin: 20px 0 10px !important;
    font-size: 15px !important;
    line-height: 1.45 !important;
  }

  .legal-page-richtext .simple-editor p {
    margin: 0 0 15px !important;
  }

  .legal-page-richtext .simple-editor ul,
  .legal-page-richtext .simple-editor ol {
    display: grid;
    gap: 8px;
    margin: 10px 0 18px !important;
    padding-left: 24px !important;
  }

  .legal-page-richtext .simple-editor a,
  .legal-page-richtext .simple-editor li::marker {
    color: var(--sn-accent-text) !important;
  }

  @media (max-width: 640px) {
    min-height: 360px;
    border-radius: var(--sn-radius-surface);
    padding: 18px 17px 24px;
  }

  @media (prefers-reduced-transparency: reduce) {
    background: var(--sn-surface-strong);
  }

  @media (prefers-contrast: more) {
    border-color: currentColor;
  }
`;
