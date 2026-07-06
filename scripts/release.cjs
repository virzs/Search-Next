const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { listAppNames, resolveReleaseProject } = require("./release-projects.cjs");

const root = path.resolve(__dirname, "..");
const mode = process.argv[2] || "release";
const inputArgs = process.argv.slice(3);
const validModes = new Set(["release", "changes", "dry"]);

if (!validModes.has(mode)) {
  console.error(`Unknown release mode "${mode}". Expected: ${[...validModes].join(", ")}.`);
  process.exit(1);
}

const printHelp = () => {
  const apps = listAppNames(root).map((name) => `app:${name}`);
  const projects = ["all", "api", "web", "admin", "docs", "apps", ...apps];

  console.log(`Usage:
  pnpm release [project] [version|increment] [release-it options]
  pnpm release:dry [project] [version|increment] [release-it options]
  pnpm release:changes [project]

Projects:
  ${projects.join(", ")}

Examples:
  pnpm release
  pnpm release api
  pnpm release web 0.14.0
  pnpm release app:todo patch
  pnpm release:dry admin 0.14.0
  pnpm release:changes web`);
};

if (inputArgs.includes("--help") || inputArgs.includes("-h")) {
  printHelp();
  process.exit(0);
}

const consumeProjectArg = (args) => {
  const nextArgs = [...args];
  const projectFlagIndex = nextArgs.findIndex((arg) => arg === "--project" || arg.startsWith("--project="));

  if (projectFlagIndex !== -1) {
    const flag = nextArgs[projectFlagIndex];
    const value = flag.includes("=") ? flag.slice(flag.indexOf("=") + 1) : nextArgs[projectFlagIndex + 1];
    nextArgs.splice(projectFlagIndex, flag.includes("=") ? 1 : 2);
    return { projectInput: value, releaseItArgs: nextArgs };
  }

  const first = nextArgs[0];
  if (!first || first.startsWith("-")) {
    return { projectInput: process.env.RELEASE_PROJECT || "all", releaseItArgs: nextArgs };
  }

  try {
    resolveReleaseProject(root, first);
    nextArgs.shift();
    return { projectInput: first, releaseItArgs: nextArgs };
  } catch {
    return { projectInput: process.env.RELEASE_PROJECT || "all", releaseItArgs: nextArgs };
  }
};

const { projectInput, releaseItArgs } = consumeProjectArg(inputArgs);
const project = resolveReleaseProject(root, projectInput || "all");
const releaseItBin = path.join(path.dirname(require.resolve("release-it/package.json")), "bin/release-it.js");
const args = ["--config", ".release-it.cjs"];

if (mode === "changes") {
  args.push(
    "--changelog",
    "--no-git.requireCleanWorkingDir",
    "--no-git.requireBranch",
    "--no-github.release",
  );
}

if (mode === "dry") {
  args.push(
    "--dry-run",
    "--ci",
    "--no-git.requireCleanWorkingDir",
    "--no-git.requireBranch",
    "--no-github.release",
  );
}

args.push(...releaseItArgs);

console.log(`[release] Project: ${project.id}`);

const result = spawnSync(process.execPath, [releaseItBin, ...args], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    RELEASE_PROJECT: project.id,
  },
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
