import {
  extractReleaseSection,
  matchReleaseTag,
  toReleaseCandidate,
  type GithubReleaseData,
} from "./release.util";

const release = (overrides: Partial<GithubReleaseData> = {}) =>
  ({
    id: 100,
    tag_name: "v1.2.3",
    name: "Search Next v1.2.3",
    body: "## Web\nWeb changes\n\n## Admin\nAdmin changes",
    html_url: "https://github.com/virzs/Search-Next/releases/tag/v1.2.3",
    published_at: "2026-07-15T00:00:00.000Z",
    draft: false,
    prerelease: false,
    ...overrides,
  }) satisfies GithubReleaseData;

describe("release utilities", () => {
  it("matches component and full release tags", () => {
    expect(matchReleaseTag("web", "web-v2.0.0")).toEqual({
      version: "2.0.0",
      fullRelease: false,
    });
    expect(matchReleaseTag("admin", "v2.0.0")).toEqual({
      version: "2.0.0",
      fullRelease: true,
    });
    expect(matchReleaseTag("web", "admin-v2.0.0")).toBeNull();
  });

  it("extracts the matching component section from a full release", () => {
    expect(extractReleaseSection(release().body || "", "web", true)).toBe(
      "Web changes",
    );
    expect(extractReleaseSection(release().body || "", "admin", true)).toBe(
      "Admin changes",
    );
  });

  it("falls back to the complete body when a section is missing", () => {
    expect(extractReleaseSection("Release notes", "web", true)).toBe(
      "Release notes",
    );
  });

  it("filters drafts, prereleases, and mismatched tags", () => {
    expect(toReleaseCandidate(release({ draft: true }), "web")).toBeNull();
    expect(toReleaseCandidate(release({ prerelease: true }), "web")).toBeNull();
    expect(
      toReleaseCandidate(release({ tag_name: "admin-v1.2.3" }), "web"),
    ).toBeNull();
  });
});
