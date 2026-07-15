const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const {
  normalizeProjectName,
  resolveReleaseProject,
  resolveReleaseTag,
} = require("./release-projects.cjs");

const root = path.resolve(__dirname, "..");

test("normalizes current app project names", () => {
  assert.equal(normalizeProjectName("app:mind-map"), "app:mind-map");
  assert.equal(normalizeProjectName("apps/mind-map"), "app:mind-map");
});

test("resolves a current app project", () => {
  const project = resolveReleaseProject(root, "app:mind-map");
  assert.equal(project.id, "app:mind-map");
  assert.equal(project.tagMatch, "mind-map-v*");
  assert.deepEqual(project.pathspecs, ["apps/apps/mind-map"]);
});

test("resolves full, service, and app release tags", () => {
  const full = resolveReleaseTag(root, "v0.14.0");
  assert.equal(full.project.id, "all");
  assert.equal(full.version, "0.14.0");
  assert.equal(full.releaseName, "Search Next v0.14.0");
  assert.equal(full.tagMatch, "v*");

  const web = resolveReleaseTag(root, "web-v0.2.4");
  assert.equal(web.project.id, "web");
  assert.equal(web.releaseName, "web v0.2.4");
  assert.equal(web.tagMatch, "web-v*");

  const mindMap = resolveReleaseTag(root, "mind-map-v0.2.0");
  assert.equal(mindMap.project.id, "app:mind-map");
  assert.equal(mindMap.releaseName, "mind-map v0.2.0");
  assert.equal(mindMap.tagMatch, "mind-map-v*");
});

test("rejects unsupported or unknown release tags", () => {
  assert.throws(() => resolveReleaseTag(root, "release-0.2.0"), /Unsupported release tag/);
  assert.throws(() => resolveReleaseTag(root, "missing-v0.2.0"), /Unknown release project/);
});
