const { resolveReleaseProject } = require("./scripts/release-projects.cjs");

const project = resolveReleaseProject(process.cwd());
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
    release: false,
  },
  hooks: {
    "after:release": `echo Tagged ${project.id} v\${version}. GitHub Actions will create the GitHub Release and upload assets.`,
  },
};
