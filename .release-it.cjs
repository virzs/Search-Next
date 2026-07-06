const { resolveReleaseProject } = require("./scripts/release-projects.cjs");

const project = resolveReleaseProject(process.cwd());
const draft = process.env.RELEASE_DRAFT === "true";
const releaseBranch = process.env.RELEASE_BRANCH || "release";

module.exports = {
  git: {
    requireCleanWorkingDir: true,
    requireBranch: releaseBranch,
    requireUpstream: false,
    commit: false,
    tag: true,
    tagName: project.tagName,
    tagMatch: project.tagMatch,
    tagAnnotation: `${project.title} v\${version}`,
    changelog: 'node scripts/release-assets.mjs notes --from="${latestTag}" --to="${to}"',
    push: true,
    pushArgs: ["--follow-tags"],
  },
  npm: false,
  github: {
    release: true,
    releaseName: project.releaseName,
    releaseNotes: null,
    draft,
    tokenRef: "GITHUB_TOKEN",
  },
  hooks: {
    "after:release": `echo Released ${project.id} v\${version}. GitHub Actions will build and upload release assets.`,
  },
};
