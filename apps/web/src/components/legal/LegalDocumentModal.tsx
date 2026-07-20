import { css } from "@emotion/css";
import { useI18n } from "@/i18n";
import {
  getPublicLegalDocument,
  LEGAL_DOCUMENT_TYPES,
  type LegalDocumentType,
  type LegalDocumentVersion,
  type PublicLegalDocument,
} from "@/services/system";
import { Alert, Empty, Modal, Skeleton, Space, Tabs, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { SimpleEditorViewer } from "zs_library";
import { AppButton } from "@/components/ui";

interface LegalDocumentModalProps {
  open: boolean;
  versions: LegalDocumentVersion[];
  required?: boolean;
  loading?: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  secondaryText?: string;
  initialActiveType?: LegalDocumentType;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onSecondary?: () => void | Promise<void>;
}

const typeFallbackTitle = {
  terms: "服务条款",
  privacy: "隐私政策",
} as const;

const typeOrder = Object.fromEntries(
  LEGAL_DOCUMENT_TYPES.map((type, index) => [type, index]),
) as Record<LegalDocumentType, number>;

// DesktopNextBaseModal and desktop context layers can reach z-index 10000.
// Legal confirmation must remain the active, topmost task when opened from them.
const LEGAL_MODAL_Z_INDEX = 11000;

const LegalDocumentModal = ({
  open,
  versions,
  required = false,
  loading = false,
  title,
  confirmText,
  cancelText,
  secondaryText,
  initialActiveType,
  onConfirm,
  onCancel,
  onSecondary,
}: LegalDocumentModalProps) => {
  const { language, t } = useI18n();
  const [documents, setDocuments] = useState<PublicLegalDocument[]>([]);
  const [activeType, setActiveType] = useState<string>();
  const [fetching, setFetching] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const versionKey = useMemo(
    () => versions.map((item) => item.revisionId).join(","),
    [versions],
  );

  useEffect(() => {
    if (!open || !versions.length) {
      setDocuments([]);
      return;
    }
    let cancelled = false;
    setFetching(true);
    setFetchFailed(false);
    Promise.all(
      versions.map((version) =>
        getPublicLegalDocument(version.type, language),
      ),
    )
      .then((values) => {
        if (cancelled) return;
        const next = (values.filter(Boolean) as PublicLegalDocument[]).sort(
          (a, b) => typeOrder[a.type] - typeOrder[b.type],
        );
        setDocuments(next);
        setActiveType((current) =>
          initialActiveType &&
          next.some((item) => item.type === initialActiveType)
            ? initialActiveType
            : next.some((item) => item.type === current)
              ? current
              : next[0]?.type,
        );
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true);
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialActiveType, language, open, versionKey, versions]);

  const modalTitle =
    title ??
    (required ? t("ui.legal.updateRequiredTitle") : t("ui.legal.readerTitle"));

  return (
    <Modal
      open={open}
      title={modalTitle}
      width={820}
      zIndex={LEGAL_MODAL_Z_INDEX}
      centered
      closable={!required}
      maskClosable={!required}
      keyboard={!required}
      onCancel={required ? undefined : onCancel}
      destroyOnHidden
      className={legalModalClassName}
      footer={
        <Space wrap>
          {onSecondary ? (
            <AppButton size="default" onClick={onSecondary}>
              {secondaryText}
            </AppButton>
          ) : null}
          {!required && onCancel ? (
            <AppButton size="default" onClick={onCancel}>
              {cancelText ?? t("ui.cancel")}
            </AppButton>
          ) : null}
          <AppButton
            intent="primary"
            size="default"
            loading={loading}
            disabled={fetching || fetchFailed || documents.length === 0}
            onClick={onConfirm}
          >
            {confirmText ?? t("ui.legal.agreeAndContinue")}
          </AppButton>
        </Space>
      }
    >
      <Typography.Paragraph type="secondary" className="legal-description">
        {required
          ? t("ui.legal.updateRequiredDescription")
          : t("ui.legal.readBeforeContinue")}
      </Typography.Paragraph>
      {fetchFailed ? (
        <Alert
          type="error"
          showIcon
          message={t("ui.legal.loadFailed")}
          description={t("ui.legal.retryDescription")}
        />
      ) : fetching ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : documents.length ? (
        <Tabs
          activeKey={activeType}
          onChange={setActiveType}
          items={documents.map((document) => ({
            key: document.type,
            label:
              document.title ||
              t(`ui.legal.${document.type}`) ||
              typeFallbackTitle[document.type],
            children: (
              <article className="legal-document" aria-label={document.title}>
                <div className="legal-meta">
                  <span>
                    {t("ui.legal.confirmationVersion", {
                      version: document.consentVersion,
                    })}
                  </span>
                  {document.publishedAt ? (
                    <time dateTime={document.publishedAt}>
                      {new Date(document.publishedAt).toLocaleDateString()}
                    </time>
                  ) : null}
                </div>
                <SimpleEditorViewer
                  sanitize
                  value={document.content}
                  className="legal-richtext"
                />
              </article>
            ),
          }))}
        />
      ) : (
        <Empty description={t("ui.legal.notPublished")} />
      )}
    </Modal>
  );
};

export default LegalDocumentModal;

const legalModalClassName = css`
  --legal-modal-surface: rgba(255, 255, 255, 0.94);
  --legal-modal-surface-solid: #ffffff;
  --legal-reader-surface: #f9f9fb;
  --legal-reader-surface-solid: #f7f7f9;
  --legal-subtle-surface: rgba(118, 118, 128, 0.09);
  --legal-border: rgba(60, 60, 67, 0.16);
  --legal-border-strong: #1d1d1f;
  --legal-text: #1d1d1f;
  --legal-text-secondary: #6e6e73;
  --legal-text-meta: #6e6e73;
  --legal-accent: var(--sn-accent-text, #9a3412);

  color: var(--legal-text);

  [data-theme="dark"] & {
    --legal-modal-surface: rgba(28, 28, 30, 0.94);
    --legal-modal-surface-solid: #1c1c1e;
    --legal-reader-surface: #242426;
    --legal-reader-surface-solid: #242426;
    --legal-subtle-surface: rgba(255, 255, 255, 0.08);
    --legal-border: rgba(235, 235, 245, 0.18);
    --legal-border-strong: #f5f5f7;
    --legal-text: #f5f5f7;
    --legal-text-secondary: #d1d1d6;
    --legal-text-meta: #aeaeb2;
  }

  .ant-modal-content {
    overflow: hidden;
    border: 1px solid var(--legal-border);
    border-radius: var(--sn-radius-panel);
    color: var(--legal-text);
    background: var(--legal-modal-surface);
    backdrop-filter: blur(24px) saturate(140%);
  }

  .ant-modal-header {
    color: var(--legal-text);
    background: transparent;
  }

  .ant-modal-title {
    color: var(--legal-text);
  }

  .ant-modal-close {
    color: var(--legal-text-secondary);
  }

  .ant-modal-close:hover {
    color: var(--legal-text);
    background: var(--legal-subtle-surface);
  }

  .ant-modal-body,
  .ant-tabs {
    color: var(--legal-text);
  }

  .ant-tabs-nav::before {
    border-bottom-color: var(--legal-border);
  }

  .ant-tabs-tab {
    color: var(--legal-text-secondary);
  }

  .legal-description.ant-typography {
    margin-bottom: 12px;
    color: var(--legal-text-secondary);
  }

  .legal-document {
    min-height: 320px;
    max-height: min(58vh, 560px);
    overflow-y: auto;
    border: 1px solid var(--legal-border);
    border-radius: var(--sn-radius-surface);
    padding: 22px 24px;
    color: var(--legal-text);
    background: var(--legal-reader-surface);
    overscroll-behavior: contain;
  }

  .legal-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
    color: var(--legal-text-meta);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .legal-richtext .simple-editor {
    color: var(--legal-text) !important;
    font-family: inherit !important;
  }

  .legal-richtext .simple-editor p,
  .legal-richtext .simple-editor li,
  .legal-richtext .simple-editor blockquote,
  .legal-richtext .simple-editor td,
  .legal-richtext .simple-editor th,
  .legal-richtext .simple-editor h1,
  .legal-richtext .simple-editor h2,
  .legal-richtext .simple-editor h3,
  .legal-richtext .simple-editor h4,
  .legal-richtext .simple-editor h5,
  .legal-richtext .simple-editor h6 {
    color: var(--legal-text) !important;
  }

  .legal-richtext .simple-editor pre,
  .legal-richtext .simple-editor :not(pre) > code {
    border-color: var(--legal-border) !important;
    color: var(--legal-text-secondary) !important;
    background: var(--legal-subtle-surface) !important;
  }

  .legal-richtext .simple-editor a,
  .legal-richtext .simple-editor li::marker {
    color: var(--legal-accent) !important;
  }

  @media (prefers-reduced-transparency: reduce) {
    .ant-modal-content {
      background: var(--legal-modal-surface-solid);
      backdrop-filter: none;
    }

    .legal-document {
      background: var(--legal-reader-surface-solid);
    }
  }

  @media (prefers-contrast: more) {
    --legal-accent: var(--legal-text);

    .ant-modal-content {
      border-color: var(--legal-border-strong);
      background: var(--legal-modal-surface-solid);
      backdrop-filter: none;
    }

    .legal-document {
      border-color: var(--legal-border-strong);
      background: var(--legal-reader-surface-solid);
    }

    .legal-description.ant-typography,
    .legal-meta,
    .ant-modal-close,
    .ant-tabs-tab {
      color: var(--legal-text);
    }

    .legal-richtext .simple-editor a {
      text-decoration: underline !important;
      text-underline-offset: 3px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    * {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
`;
