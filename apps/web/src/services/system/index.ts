import { baseGetRequest, basePostRequest } from "@/utils/axios";
import type { Resource } from "@/types";

export interface ProjectSiteConfig {
  icon?: Resource;
  themeColor: string;
}

export interface ProjectPublicInfo {
  name: string;
  description?: string;
  register?: {
    forceEmailCaptcha?: boolean;
    forceInvitationCode: boolean;
    allowRegister: boolean;
    registerDisabledTip?: string;
  };
  turnstile?: {
    enabled?: boolean;
    siteKey?: string;
  };
  site?: ProjectSiteConfig;
}

/**
 * 获取项目公共信息
 * @returns
 */
export const getProjectPublicInfo = () => {
  return baseGetRequest<ProjectPublicInfo>("/system/project/public")();
};

export interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  effectiveStart?: string | null;
  effectiveEnd?: string | null;
  createdAt?: string | null;
  sourceKey?: string;
  sourceUrl?: string;
}

/**
 * 获取公告
 */
export const getNotice = () => {
  return baseGetRequest<NoticeItem[]>("/system/notice/public/list")({
    key: "tabs",
  });
};

export interface LatestReleasePublication {
  _id: string;
  component: "web" | "admin";
  tagName: string;
  version: string;
  releaseUrl: string;
  publishedAt: string;
}

export const getLatestReleasePublication = (component: "web" | "admin") =>
  baseGetRequest<LatestReleasePublication | null>(
    "/system/version/release-publications/latest",
  )({ component });

export interface VersionUpdateItem {
  _id: string;
  component: "web" | "admin";
  tagName: string;
  version: string;
  title: string;
  content: string;
  releaseUrl: string;
  releasePublishedAt: string;
  publishedAt: string;
}

export const getVersionUpdates = (component: "web" | "admin" = "web") =>
  baseGetRequest<VersionUpdateItem[]>(
    "/system/version/release-publications/public/list",
  )({ component });

export const LEGAL_DOCUMENT_TYPES = ["terms", "privacy"] as const;
export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];
export type LegalDocumentLocale = "zh-CN" | "en-US";

export interface LegalConfirmationInput {
  documentType: LegalDocumentType;
  revisionId: string;
}

export interface LegalDocumentVersion {
  type: LegalDocumentType;
  revisionId: string;
  title: Partial<Record<LegalDocumentLocale, string>>;
  consentVersion: number;
  requiresReconfirmation: boolean;
  changeSummary?: string;
  publishedAt?: string;
}

export interface PublicLegalDocument
  extends Omit<LegalDocumentVersion, "title"> {
  requestedLocale: LegalDocumentLocale;
  resolvedLocale: LegalDocumentLocale;
  title: string;
  content: string;
  availableLocales: LegalDocumentLocale[];
}

export interface LegalConfirmationStatusItem extends LegalDocumentVersion {
  confirmed: boolean;
  confirmationRequired: boolean;
  confirmedAt?: string | null;
}

export const getLegalDocumentVersions = () =>
  baseGetRequest<LegalDocumentVersion[]>(
    "/system/legal-documents/public/versions",
  )();

export const getPublicLegalDocument = (
  type: LegalDocumentType,
  locale: LegalDocumentLocale,
) =>
  baseGetRequest<PublicLegalDocument | null>(
    `/system/legal-documents/public/${type}`,
  )({ locale });

export const getLegalConfirmationStatus = () =>
  baseGetRequest<{ documents: LegalConfirmationStatusItem[] }>(
    "/system/legal-documents/confirmation-status",
  )();

export const confirmLegalDocuments = (data: {
  legalConfirmations: LegalConfirmationInput[];
  legalConfirmationLocale: LegalDocumentLocale;
}) =>
  basePostRequest("/system/legal-documents/confirmations")(data);
