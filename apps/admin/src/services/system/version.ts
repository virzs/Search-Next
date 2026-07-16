import {
  baseDeleteRequest,
  baseGetRequest,
  basePostRequest,
  basePutRequest,
  baseDetailRequest,
} from "@/utils/axios";

// /system/version get
export async function getVersion(params: any) {
  return baseGetRequest("/system/version")(params);
}

// /system/version post
export async function postVersion(params: any) {
  return basePostRequest("/system/version")(params);
}

// /system/version put
export async function putVersion(id: string, params: any) {
  return basePutRequest("/system/version")(id, params);
}

// /system/version delete
export async function deleteVersion(id: string) {
  return baseDeleteRequest("/system/version")(id);
}

// /system/version/{id} detail
export async function detailVersion(id: string) {
  return baseDetailRequest("/system/version")(id);
}

//system/version/latest get
export async function getLatestVersion(params: any) {
  return baseGetRequest("/system/version/latest")(params);
}

export type ReleaseComponent = "web" | "admin";

export interface ReleaseCandidate {
  githubReleaseId: number;
  component: ReleaseComponent;
  tagName: string;
  version: string;
  releaseName: string;
  releaseUrl: string;
  releasePublishedAt: string;
  targetCommitish: string;
  fullRelease: boolean;
  announcementContent: string;
  published: boolean;
  publicationId?: string;
  noticeId?: string;
}

export interface ReleaseCandidatesResponse {
  repositoryUrl: string;
  fetchedAt: string;
  web: ReleaseCandidate[];
  admin: ReleaseCandidate[];
}

export interface LatestReleasePublication {
  component: ReleaseComponent;
  tagName: string;
  version: string;
  releaseUrl: string;
  publishedAt: string;
}

export const getReleaseCandidates = (refresh = false) =>
  baseGetRequest<ReleaseCandidatesResponse>(
    "/system/version/release-candidates",
  )({
    refresh,
  });

export const getReleasePublications = (params: Record<string, unknown> = {}) =>
  baseGetRequest("/system/version/release-publications")(params);

export const publishReleasePublication = (data: {
  component: ReleaseComponent;
  githubReleaseId: number;
  announcementTitle: string;
  announcementContent: string;
  deploymentConfirmed: true;
}) => basePostRequest("/system/version/release-publications")(data);

export const getLatestReleasePublication = (component: ReleaseComponent) =>
  baseGetRequest<LatestReleasePublication | null>(
    "/system/version/release-publications/latest",
  )({ component });
