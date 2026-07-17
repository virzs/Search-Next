import LegalDocumentModal from "@/components/legal/LegalDocumentModal";
import {
  getLegalDocumentVersions,
  type LegalDocumentType,
} from "@/services/system";
import { useRequest } from "ahooks";
import { useNavigate } from "react-router";
import { useI18n } from "@/i18n";

const LegalDocumentRoute = ({ type }: { type: LegalDocumentType }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { data = [], loading } = useRequest(getLegalDocumentVersions);
  const versions = data.filter((item) => item.type === type);
  const close = () => navigate(-1);

  return (
    <LegalDocumentModal
      open
      versions={versions}
      loading={loading}
      title={t(type === "terms" ? "ui.termsOfService" : "ui.privacyPolicy")}
      confirmText={t("ui.close")}
      onConfirm={close}
      onCancel={close}
    />
  );
};

export default LegalDocumentRoute;
