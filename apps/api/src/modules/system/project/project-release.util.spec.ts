import { normalizeGithubRepositoryUrl } from "./project.service";

describe("normalizeGithubRepositoryUrl", () => {
  it("normalizes supported public GitHub repository URLs", () => {
    expect(
      normalizeGithubRepositoryUrl("https://github.com/virzs/Search-Next.git/"),
    ).toBe("https://github.com/virzs/Search-Next");
  });

  it.each([
    "http://github.com/virzs/Search-Next",
    "https://gitlab.com/virzs/Search-Next",
    "https://github.com/virzs",
    "https://github.com/virzs/Search-Next/releases",
    "https://github.com:8443/virzs/Search-Next",
    "https://github.com/virzs/Search-Next?tab=readme",
  ])("rejects unsupported repository URL %s", (value) => {
    expect(() => normalizeGithubRepositoryUrl(value)).toThrow();
  });
});
