import LegalDocumentModal from "@/components/legal/LegalDocumentModal";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import {
  confirmLegalDocuments,
  getLegalConfirmationStatus,
  getLegalDocumentVersions,
  type LegalDocumentVersion,
} from "@/services/system";
import {
  LEGAL_CONFIRMATION_REQUIRED_EVENT,
  type LegalConfirmationRequiredPayload,
} from "@/utils/legal-confirmation";
import { useRequest } from "ahooks";
import { useCallback, useEffect, useMemo, useState } from "react";

const POLL_INTERVAL = 5 * 60 * 1000;
const acknowledgedKey = (revisionId: string) =>
  `search-next:legal-document:acknowledged:${revisionId}`;
const snoozedKey = (revisionId: string) =>
  `search-next:legal-document:snoozed:${revisionId}`;

const LegalDocumentGate = () => {
  const { isAuthenticated, logout } = useAuth();
  const { language, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [required, setRequired] = useState(false);
  const [displayVersions, setDisplayVersions] = useState<
    LegalDocumentVersion[]
  >([]);

  const {
    data: versions = [],
    run: refreshVersions,
  } = useRequest(getLegalDocumentVersions, {
    pollingInterval: POLL_INTERVAL,
    pollingWhenHidden: false,
  });
  const { runAsync: refreshStatus } = useRequest(
    getLegalConfirmationStatus,
    { manual: true },
  );
  const { loading: confirming, runAsync: confirm } = useRequest(
    confirmLegalDocuments,
    { manual: true },
  );

  const versionKey = useMemo(
    () => versions.map((item) => item.revisionId).join(","),
    [versions],
  );

  const evaluate = useCallback(async () => {
    if (!versions.length) return;
    if (isAuthenticated) {
      try {
        const status = await refreshStatus();
        const pending = status.documents.filter(
          (document) => document.confirmationRequired,
        );
        if (pending.length) {
          setDisplayVersions(pending);
          setRequired(true);
          setOpen(true);
          return;
        }
        const unread = status.documents.filter(
          (document) =>
            !document.confirmed &&
            !sessionStorage.getItem(snoozedKey(document.revisionId)),
        );
        if (unread.length) {
          setDisplayVersions(unread);
          setRequired(false);
          setOpen(true);
        }
      } catch {
        // 会话异常由认证层处理；法律文档检查不覆盖原错误。
      }
      return;
    }

    const unread = versions.filter(
      (document) =>
        !localStorage.getItem(acknowledgedKey(document.revisionId)) &&
        !sessionStorage.getItem(snoozedKey(document.revisionId)),
    );
    if (unread.length) {
      setDisplayVersions(unread);
      setRequired(false);
      setOpen(true);
    }
  }, [isAuthenticated, refreshStatus, versions]);

  useEffect(() => {
    void evaluate();
  }, [evaluate, versionKey]);

  useEffect(() => {
    const onRequired = (event: Event) => {
      if (!isAuthenticated) return;
      const detail = (event as CustomEvent<LegalConfirmationRequiredPayload>)
        .detail;
      if (!detail?.documents?.length) return;
      setDisplayVersions(detail.documents);
      setRequired(true);
      setOpen(true);
    };
    window.addEventListener(LEGAL_CONFIRMATION_REQUIRED_EVENT, onRequired);
    return () =>
      window.removeEventListener(LEGAL_CONFIRMATION_REQUIRED_EVENT, onRequired);
  }, [isAuthenticated]);

  useEffect(() => {
    const refresh = () => refreshVersions();
    const visible = () => {
      if (document.visibilityState === "visible") refreshVersions();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refreshVersions]);

  const acknowledgeLocally = () => {
    displayVersions.forEach((document) =>
      localStorage.setItem(acknowledgedKey(document.revisionId), "1"),
    );
  };

  const handleConfirm = async () => {
    if (isAuthenticated) {
      await confirm({
        legalConfirmations: displayVersions.map((document) => ({
          documentType: document.type,
          revisionId: document.revisionId,
        })),
        legalConfirmationLocale: language,
      });
    }
    acknowledgeLocally();
    setOpen(false);
    setRequired(false);
    setDisplayVersions([]);
    if (isAuthenticated) await evaluate();
  };

  const handleLater = () => {
    displayVersions.forEach((document) =>
      sessionStorage.setItem(snoozedKey(document.revisionId), "1"),
    );
    setOpen(false);
    setDisplayVersions([]);
  };

  return (
    <LegalDocumentModal
      open={open}
      versions={displayVersions}
      required={required}
      loading={confirming}
      confirmText={
        required ? t("ui.legal.agreeAndContinue") : t("ui.legal.markViewed")
      }
      cancelText={t("ui.legal.later")}
      secondaryText={required ? t("ui.signOut") : undefined}
      onConfirm={handleConfirm}
      onCancel={required ? undefined : handleLater}
      onSecondary={
        required
          ? async () => {
              await logout();
            }
          : undefined
      }
    />
  );
};

export default LegalDocumentGate;
