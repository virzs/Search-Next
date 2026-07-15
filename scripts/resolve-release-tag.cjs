const path = require("node:path");
const { resolveReleaseTag } = require("./release-projects.cjs");

const root = path.resolve(__dirname, "..");
const release = resolveReleaseTag(root, process.argv[2] || process.env.RELEASE_TAG || "");

const outputs = {
  tag: release.tag,
  project: release.project.id,
  version: release.version,
  release_name: release.releaseName,
  tag_match: release.tagMatch,
};

for (const [name, value] of Object.entries(outputs)) {
  console.log(`${name}=${value}`);
}
