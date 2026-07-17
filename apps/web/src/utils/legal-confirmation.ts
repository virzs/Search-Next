import type { LegalDocumentVersion } from "@/services/system";

export const LEGAL_CONFIRMATION_REQUIRED_EVENT =
  "search-next:legal-confirmation-required";

export interface LegalConfirmationRequiredPayload {
  code: "LEGAL_CONFIRMATION_REQUIRED";
  reason?: "missing" | "stale" | "unconfirmed";
  message?: string;
  documents?: LegalDocumentVersion[];
}

export const getLegalConfirmationPayload = (
  error: any,
): LegalConfirmationRequiredPayload | null => {
  const payload = error?.response?.data ?? error;
  return payload?.code === "LEGAL_CONFIRMATION_REQUIRED" ? payload : null;
};
