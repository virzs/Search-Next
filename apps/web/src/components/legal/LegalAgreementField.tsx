import { useId } from "react";
import type { CheckboxProps } from "antd";
import type { LegalDocumentType } from "@/services/system";
import { AppCheckbox } from "@/components/ui";
import LegalAgreementText from "./LegalAgreementText";

interface LegalAgreementFieldProps
  extends Pick<CheckboxProps, "checked" | "disabled" | "onChange"> {
  onOpenDocument: (type: LegalDocumentType) => void;
}

const LegalAgreementField = ({
  checked,
  disabled,
  onChange,
  onOpenDocument,
}: LegalAgreementFieldProps) => {
  const descriptionId = useId();

  return (
    <div className="sn-legal-agreement-field">
      <AppCheckbox
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-labelledby={descriptionId}
      />
      <span id={descriptionId} className="sn-legal-agreement-copy">
        <LegalAgreementText onOpenDocument={onOpenDocument} />
      </span>
    </div>
  );
};

export default LegalAgreementField;

