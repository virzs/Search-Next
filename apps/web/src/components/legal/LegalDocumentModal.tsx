import { css } from "@emotion/css";
import { useI18n } from "@/i18n";
import {
  getPublicLegalDocument,
  LEGAL_DOCUMENT_TYPES,
  type LegalDocumentType,
  type LegalDocumentVersion,
  type PublicLegalDocument,
} from "@/services/system";
import { Alert, Button, Empty, Modal, Skeleton, Space, Tabs, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { SimpleEditorViewer } from "zs_library";

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
            <Button onClick={onSecondary}>{secondaryText}</Button>
          ) : null}
          {!required && onCancel ? (
            <Button onClick={onCancel}>{cancelText ?? t("ui.cancel")}</Button>
          ) : null}
          <Button
            type="primary"
            loading={loading}
            disabled={fetching || fetchFailed || documents.length === 0}
            onClick={onConfirm}
          >
            {confirmText ?? t("ui.legal.agreeAndContinue")}
          </Button>
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
  .ant-modal-content {
    overflow: hidden;
    border-radius: 20px;
    background: color-mix(in srgb, var(--sn-surface, #fff) 96%, transparent);
    backdrop-filter: blur(24px) saturate(140%);
  }

  .legal-description {
    margin-bottom: 12px;
  }

  .legal-document {
    min-height: 320px;
    max-height: min(58vh, 560px);
    overflow-y: auto;
    border: 1px solid rgba(60, 60, 67, 0.12);
    border-radius: 14px;
    padding: 22px 24px;
    background: rgba(255, 255, 255, 0.74);
    overscroll-behavior: contain;
  }

  .legal-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
    color: #8e8e93;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    .ant-modal-content,
    .legal-document {
      background: #fff;
      backdrop-filter: none;
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
