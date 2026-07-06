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
        build: ["pnpm", ["build:api"]],
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
    .replace(/^apps\//, "")
    .replace(/^widgets\//, "widget:")
    .replace(/^search-next-/, "")
    .replace(/-widget$/, "");
};

const listWidgetNames = (root) => {
  const widgetsRoot = path.join(root, "apps/widgets");
  if (!fs.existsSync(widgetsRoot)) return [];
  return fs
    .readdirSync(widgetsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(widgetsRoot, name, "widget.config.json")))
    .sort();
};

const readWidgetConfig = (root, widgetName) => {
  const file = path.join(root, "apps/widgets", widgetName, "widget.config.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const createWidgetUnit = (root, widgetName) => {
  const config = readWidgetConfig(root, widgetName);
  if (!config) return null;
  return {
    type: "widget",
    id: `widget:${widgetName}`,
    name: widgetName,
    config,
    build: ["node", ["scripts/pack-widget.mjs", widgetName]],
    assetName: `${config.name}-${config.version}.snwidget`,
  };
};

const createWidgetsProject = (root) => ({
  id: "widgets",
  label: "widgets",
  title: "Widgets",
  units: [
    {
      type: "widgets",
      id: "widgets",
      build: ["node", ["scripts/pack-widget.mjs", "--all"]],
    },
  ],
  pathspecs: ["apps/widgets", "scripts/pack-widget.mjs", "scripts/capture-widget-screenshots.mjs"],
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
        ...createWidgetsProject(root).units,
      ],
      pathspecs: [],
    });
  }

  if (projectName === "widgets") return decorateProject(createWidgetsProject(root));

  if (appProjects[projectName]) return decorateProject(appProjects[projectName]);

  const widgetName = projectName.replace(/^widgets?:/, "");
  const widgetUnit = createWidgetUnit(root, widgetName);
  if (widgetUnit) {
    return decorateProject({
      id: `widget:${widgetName}`,
      label: widgetUnit.config.name || widgetName,
      title: `Widget ${widgetUnit.config.displayName || widgetName}`,
      units: [widgetUnit],
      pathspecs: [`apps/widgets/${widgetName}`],
    });
  }

  const available = ["all", ...Object.keys(appProjects), "widgets", ...listWidgetNames(root).map((name) => `widget:${name}`)];
  throw new Error(`Unknown release project "${value}". Available projects: ${available.join(", ")}`);
};

module.exports = {
  appProjects,
  listWidgetNames,
  resolveReleaseProject,
};
