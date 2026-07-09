const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.join(__dirname, "..");
const distRoot = path.join(appRoot, "dist");
const distNodeModules = path.join(distRoot, "node_modules");
const copied = new Set();

const resolvePackageJson = (name, paths) => {
  for (const request of [`${name}/package.json`, `${name}/package`]) {
    try {
      return require.resolve(request, { paths });
    } catch (error) {
      if (
        error &&
        error.code !== "MODULE_NOT_FOUND" &&
        error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED"
      ) {
        throw error;
      }
    }
  }

  throw new Error(`Cannot resolve package: ${name}`);
};

const copyPackage = (name, paths, optional = false) => {
  if (copied.has(name)) return;

  let packageJson = "";
  try {
    packageJson = resolvePackageJson(name, paths);
  } catch (error) {
    if (optional) {
      console.log(`Skipped optional runtime package: ${name}`);
      return;
    }
    throw error;
  }

  const source = path.dirname(packageJson);
  const target = path.join(distNodeModules, ...name.split("/"));

  copied.add(name);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, {
    recursive: true,
    dereference: true,
    filter: (entry) => !entry.includes(`${path.sep}.cache${path.sep}`),
  });

  console.log(`Copied runtime package: ${name}`);

  const packageData = JSON.parse(fs.readFileSync(packageJson, "utf8"));
  for (const dependency of Object.keys(packageData.dependencies || {})) {
    copyPackage(dependency, [source]);
  }
  for (const dependency of Object.keys(packageData.optionalDependencies || {})) {
    copyPackage(dependency, [source], true);
  }
};

const copyEnvExample = () => {
  const source = path.join(appRoot, ".env.example");
  if (!fs.existsSync(source)) return;

  const target = path.join(distRoot, ".env.example");
  fs.copyFileSync(source, target);
  console.log("Copied runtime asset: .env.example");
};

copyPackage("sharp", [appRoot]);
copyEnvExample();
