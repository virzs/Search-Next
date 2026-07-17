import { useI18n } from "@/i18n";
import type { LegalDocumentType } from "@/services/system";

interface LegalAgreementTextProps {
  onOpenDocument: (type: LegalDocumentType) => void;
}

const LegalAgreementText = ({ onOpenDocument }: LegalAgreementTextProps) => {
  const { t } = useI18n();

  const openDocument = (type: LegalDocumentType) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onOpenDocument(type);
    };

  return (
    <span>
      {t("ui.legal.confirmPrefix")}
      <button
        type="button"
        aria-haspopup="dialog"
        className="apple-auth-link legal-agreement-link"
        onClick={openDocument("terms")}
      >
        {t("ui.termsOfService")}
      </button>
      {t("ui.and")}
      <button
        type="button"
        aria-haspopup="dialog"
        className="apple-auth-link legal-agreement-link"
        onClick={openDocument("privacy")}
      >
        {t("ui.privacyPolicy")}
      </button>
    </span>
  );
};

export default LegalAgreementText;
