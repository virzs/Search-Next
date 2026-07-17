import type {
  LegalDocumentLocale,
  LegalDocumentType,
} from "@/services/system/legal-document";
import { format } from "date-fns";

export const documentLabels: Record<LegalDocumentType, string> = {
  terms: "服务条款",
  privacy: "隐私政策",
};

export const localeLabels: Record<LegalDocumentLocale, string> = {
  "zh-CN": "中文",
  "en-US": "English",
};

export const isLegalDocumentType = (
  value?: string,
): value is LegalDocumentType => value === "terms" || value === "privacy";

export const formatLegalDate = (value?: string) =>
  value ? format(new Date(value), "yyyy-MM-dd HH:mm") : "-";
