import type { ReleaseComponent } from "./release-publication.schema";

export interface GithubReleaseData {
  id: number;
  tag_name: string;
  name?: string | null;
  body?: string | null;
  html_url: string;
  published_at?: string | null;
  created_at?: string | null;
  draft: boolean;
  prerelease: boolean;
  target_commitish?: string;
}

export interface ReleaseTagMatch {
  version: string;
  fullRelease: boolean;
}

export const parseRepositoryCoordinates = (repositoryUrl: string) => {
  const url = new URL(repositoryUrl);
  const [owner, repository] = url.pathname.split("/").filter(Boolean);
  return { owner, repository };
};

export const matchReleaseTag = (
  component: ReleaseComponent,
  tagName: string,
): ReleaseTagMatch | null => {
  const full = tagName.match(/^v(.+)$/);
  if (full) return { version: full[1], fullRelease: true };

  const componentTag = tagName.match(new RegExp(`^${component}-v(.+)$`, "i"));
  if (!componentTag) return null;
  return { version: componentTag[1], fullRelease: false };
};

export const extractReleaseSection = (
  body: string,
  component: ReleaseComponent,
  fullRelease: boolean,
) => {
  const normalized = String(body || "").trim();
  if (!normalized || !fullRelease) return normalized;

  const target = component === "web" ? "web" : "admin";
  const heading = new RegExp(`^##\\s+${target}\\s*$`, "im");
  const match = heading.exec(normalized);
  if (!match) return normalized;

  const start = match.index + match[0].length;
  const rest = normalized.slice(start);
  const nextHeading = /^##\s+/m.exec(rest);
  return rest.slice(0, nextHeading?.index ?? rest.length).trim() || normalized;
};

export const toReleaseCandidate = (
  release: GithubReleaseData,
  component: ReleaseComponent,
) => {
  const tag = matchReleaseTag(component, release.tag_name);
  if (!tag || release.draft || release.prerelease) return null;

  const publishedAt = release.published_at || release.created_at;
  if (!publishedAt) return null;

  return {
    githubReleaseId: release.id,
    component,
    tagName: release.tag_name,
    version: tag.version,
    releaseName: release.name || release.tag_name,
    releaseUrl: release.html_url,
    releasePublishedAt: publishedAt,
    targetCommitish: release.target_commitish || "",
    fullRelease: tag.fullRelease,
    announcementContent: extractReleaseSection(
      release.body || "",
      component,
      tag.fullRelease,
    ),
  };
};
