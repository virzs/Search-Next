import {
  baseDetailRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequestNoId,
} from "@/utils/axios";

export const LEGAL_DOCUMENT_TYPES = ["terms", "privacy"] as const;
export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];
export type LegalDocumentLocale = "zh-CN" | "en-US";

export interface LocalizedLegalText {
  "zh-CN": string;
  "en-US"?: string;
}

export interface LegalDocumentRecord {
  _id?: string | null;
  type: LegalDocumentType;
  status: "draft" | "published";
  title: LocalizedLegalText;
  content: LocalizedLegalText;
  changeSummary?: string;
  consentVersion?: number;
  requiresReconfirmation?: boolean;
  publishedAt?: string;
  publishedBy?: string | { _id?: string; username?: string };
  currentPublished?: {
    type: LegalDocumentType;
    revisionId: string;
    title: LocalizedLegalText;
    consentVersion: number;
    requiresReconfirmation: boolean;
    changeSummary?: string;
    publishedAt?: string;
  } | null;
}

export interface LegalDocumentHistoryPage {
  data: LegalDocumentRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export const getLegalDocumentDraft = (type: LegalDocumentType) =>
  baseGetRequest<LegalDocumentRecord>(`/system/legal-documents/${type}/draft`)();

export const getLegalDocumentList = async () => {
  const data = await Promise.all(
    LEGAL_DOCUMENT_TYPES.map(getLegalDocumentDraft),
  );
  return { data, total: data.length };
};

export const saveLegalDocumentDraft = (
  type: LegalDocumentType,
  data: Pick<LegalDocumentRecord, "title" | "content" | "changeSummary">,
) =>
  basePutRequestNoId<LegalDocumentRecord>(
    `/system/legal-documents/${type}/draft`,
  )(data);

export const publishLegalDocument = (
  type: LegalDocumentType,
  requiresReconfirmation: boolean,
) =>
  basePostRequest<LegalDocumentRecord>(
    `/system/legal-documents/${type}/publish`,
  )({ requiresReconfirmation });

export const getLegalDocumentHistory = (
  type: LegalDocumentType,
  params: { page?: number; pageSize?: number } = {},
) =>
  baseGetRequest<LegalDocumentHistoryPage>(
    `/system/legal-documents/${type}/history`,
  )(params);

export const getLegalDocumentRevision = (
  type: LegalDocumentType,
  revisionId: string,
) =>
  baseDetailRequest<LegalDocumentRecord>(
    `/system/legal-documents/${type}/history`,
  )(revisionId);
