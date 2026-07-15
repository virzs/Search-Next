const fs = require("node:fs");
const path = require("node:path");

const appProjects = {
  api: {
    id: "api",
    label: "api",
    title: "API",
    units: [
      {
        type: "app",
        id: "api",
        build: ["pnpm", ["--filter", "search-next-api", "ncc:build"]],
        dist: ["apps/api/dist"],
        assetPrefix: "search-next-api",
      },
    ],
    pathspecs: ["apps/api"],
  },
  web: {
    id: "web",
    label: "web",
    title: "Web",
    units: [
      {
        type: "app",
        id: "web",
        build: ["pnpm", ["build:prod"]],
        dist: ["apps/web/dist"],
        assetPrefix: "search-next-web",
      },
    ],
    pathspecs: ["apps/web"],
  },
  admin: {
    id: "admin",
    label: "admin",
    title: "Admin",
    units: [
      {
        type: "app",
        id: "admin",
        build: ["pnpm", ["build:admin"]],
        dist: ["apps/admin/dist"],
        assetPrefix: "search-next-admin",
      },
    ],
    pathspecs: ["apps/admin"],
  },
  docs: {
    id: "docs",
    label: "docs",
    title: "Docs",
    units: [
      {
        type: "app",
        id: "docs",
        build: ["pnpm", ["build:docs"]],
        dist: ["apps/docs/doc_build", "doc_build"],
        assetPrefix: "search-next-docs",
      },
    ],
    pathspecs: ["apps/docs"],
  },
};

const normalizeProjectName = (value) => {
  const input = String(value || "all").trim() || "all";
  return input
    .replace(/^apps\//, "app:")
    .replace(/^search-next-/, "")
    .replace(/-app$/, "");
};

const listAppNames = (root) => {
  const appsRoot = path.join(root, "apps/apps");
  if (!fs.existsSync(appsRoot)) return [];
  return fs
    .readdirSync(appsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(appsRoot, name, "app.config.json")))
    .sort();
};

const readAppConfig = (root, appName) => {
  const file = path.join(root, "apps/apps", appName, "app.config.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const createAppUnit = (root, appName) => {
  const config = readAppConfig(root, appName);
  if (!config) return null;
  return {
    type: "app-package",
    id: `app:${appName}`,
    name: appName,
    config,
    build: ["node", ["scripts/pack-app.mjs", appName]],
    assetName: `${config.name}-${config.version}.snapp`,
  };
};

const createAppsProject = (root) => ({
  id: "apps",
  label: "apps",
  title: "Apps",
  units: [
    {
      type: "app-packages",
      id: "apps",
      build: ["node", ["scripts/pack-app.mjs", "--all"]],
    },
  ],
  pathspecs: ["apps/apps", "scripts/pack-app.mjs", "scripts/capture-app-screenshots.mjs"],
});

const decorateProject = (project) => {
  const all = project.id === "all";
  const tagPrefix = all ? "" : `${project.label}-`;
  return {
    ...project,
    tagName: `${tagPrefix}v\${version}`,
    tagMatch: `${tagPrefix}v*`,
    releaseName: all ? "Search Next v${version}" : `${project.label} v\${version}`,
  };
};

const resolveReleaseProject = (root = process.cwd(), value = process.env.RELEASE_PROJECT || "all") => {
  const projectName = normalizeProjectName(value);
  if (projectName === "all") {
    return decorateProject({
      id: "all",
      label: "all",
      title: "Search Next",
      units: [
        ...Object.values(appProjects).flatMap((project) => project.units),
        ...createAppsProject(root).units,
      ],
      pathspecs: [],
    });
  }

  if (projectName === "apps") return decorateProject(createAppsProject(root));

  if (appProjects[projectName]) return decorateProject(appProjects[projectName]);

  const appName = projectName.replace(/^apps?:/, "");
  const appUnit = createAppUnit(root, appName);
  if (appUnit) {
    return decorateProject({
      id: `app:${appName}`,
      label: appUnit.config.name || appName,
      title: `App ${appUnit.config.displayName || appName}`,
      units: [appUnit],
      pathspecs: [`apps/apps/${appName}`],
    });
  }

  const available = ["all", ...Object.keys(appProjects), "apps", ...listAppNames(root).map((name) => `app:${name}`)];
  throw new Error(`Unknown release project "${value}". Available projects: ${available.join(", ")}`);
};

const resolveReleaseTag = (root = process.cwd(), value = process.env.RELEASE_TAG || "") => {
  const tag = String(value || "").trim();
  let projectInput;
  let version;

  const completeMatch = tag.match(/^v(.+)$/);
  const projectMatch = tag.match(/^(.+)-v(.+)$/);

  if (completeMatch) {
    projectInput = "all";
    version = completeMatch[1];
  } else if (projectMatch) {
    projectInput = projectMatch[1];
    version = projectMatch[2];
  } else {
    throw new Error(`Unsupported release tag "${tag}". Expected v<version> or <project>-v<version>.`);
  }

  const project = resolveReleaseProject(root, projectInput);
  return {
    tag,
    project,
    version,
    releaseName: project.releaseName.replace("${version}", version),
    tagMatch: completeMatch ? "v*" : `${projectInput}-v*`,
  };
};

module.exports = {
  appProjects,
  listAppNames,
  normalizeProjectName,
  resolveReleaseProject,
  resolveReleaseTag,
};
