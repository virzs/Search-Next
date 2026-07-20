import { useI18n } from "@/i18n";
import type { LegalDocumentType } from "@/services/system";
import { AppButton } from "@/components/ui";

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
      <AppButton
        intent="link"
        size="small"
        aria-haspopup="dialog"
        className="mx-1"
        onClick={openDocument("terms")}
      >
        {t("ui.termsOfService")}
      </AppButton>
      {t("ui.and")}
      <AppButton
        intent="link"
        size="small"
        aria-haspopup="dialog"
        className="mx-1"
        onClick={openDocument("privacy")}
      >
        {t("ui.privacyPolicy")}
      </AppButton>
    </span>
  );
};

export default LegalAgreementText;
