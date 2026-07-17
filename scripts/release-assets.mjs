import { createWriteStream } from "node:fs";
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const require = createRequire(import.meta.url);
const { resolveReleaseProject } = require("./release-projects.cjs");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const command = args[0] || "prepare";

const normalizeValue = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  if (value === "null" || value === "undefined") return fallback;
  return value || fallback;
};

const getArgValue = (name, fallback = "") => {
  const exact = args.find((arg) => arg.startsWith(`${name}=`));
  if (exact) return normalizeValue(exact.slice(name.length + 1), fallback);
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return normalizeValue(args[index + 1], fallback);
};

const project = resolveReleaseProject(root, getArgValue("--project", process.env.RELEASE_PROJECT || "all"));

const exists = async (file) => {
  try {
    return await stat(file);
  } catch {
    return null;
  }
};

const run = (cmd, cmdArgs, env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { cwd: root, stdio: "inherit", shell: false, env });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${cmdArgs.join(" ")} exited with ${code}`));
    });
  });

const git = (gitArgs) => {
  const result = spawnSync("git", gitArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return result.status === 0 ? result.stdout.trim() : "";
};

const formatBytes = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const crcTable = new Uint32Array(256).map((_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const collect = async (dir, prefix = "") => {
  const entries = (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await collect(full, relative));
    if (entry.isFile()) files.push({ full, relative });
  }
  return files;
};

const writeZip = async (sourceDir, output) => {
  await mkdir(path.dirname(output), { recursive: true });
  const files = await collect(sourceDir);
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const data = await readFile(file.full);
    const compressed = zlib.deflateRawSync(data);
    const nameBuffer = Buffer.from(file.relative);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(0, 10);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuffer, compressed);

    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0);
    dir.writeUInt16LE(20, 4);
    dir.writeUInt16LE(20, 6);
    dir.writeUInt16LE(0, 8);
    dir.writeUInt16LE(8, 10);
    dir.writeUInt32LE(0, 12);
    dir.writeUInt32LE(crc, 16);
    dir.writeUInt32LE(compressed.length, 20);
    dir.writeUInt32LE(data.length, 24);
    dir.writeUInt16LE(nameBuffer.length, 28);
    dir.writeUInt16LE(0, 30);
    dir.writeUInt16LE(0, 32);
    dir.writeUInt16LE(0, 34);
    dir.writeUInt16LE(0, 36);
    dir.writeUInt32LE(0, 38);
    dir.writeUInt32LE(offset, 42);
    central.push(dir, nameBuffer);
    offset += local.length + nameBuffer.length + compressed.length;
  }

  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  await new Promise((resolve, reject) => {
    const stream = createWriteStream(output);
    stream.on("finish", resolve);
    stream.on("error", reject);
    for (const chunk of [...chunks, ...central, end]) stream.write(chunk);
    stream.end();
  });

  return files.length;
};

const findBuildOutput = async (unit) => {
  for (const candidate of unit.dist || []) {
    const resolved = path.join(root, candidate);
    const info = await exists(resolved);
    if (info?.isDirectory()) return resolved;
  }
  return "";
};

const prepareAppAsset = async (unit, version, outputDir, assets) => {
  const source = await findBuildOutput(unit);
  if (!source) throw new Error(`Missing build output for ${unit.id}.`);
  const output = path.join(outputDir, `${unit.assetPrefix}-${version}.zip`);
  const count = await writeZip(source, output);
  const size = (await stat(output)).size;
  assets.push({ project: unit.id, name: path.basename(output), path: path.relative(root, output), size });
  console.log(`[release-assets] Packed ${path.basename(output)} (${count} files, ${formatBytes(size)})`);
};

const prepareAppPackageAsset = async (unit, outputDir, assets) => {
  const source = path.join(root, "dist/apps", unit.assetName);
  const info = await exists(source);
  if (!info?.isFile()) throw new Error(`Missing app package ${unit.assetName}.`);
  const output = path.join(outputDir, unit.assetName);
  await copyFile(source, output);
  const size = (await stat(output)).size;
  assets.push({ project: unit.id, name: unit.assetName, path: path.relative(root, output), size });
  console.log(`[release-assets] Copied ${unit.assetName} (${formatBytes(size)})`);
};

const prepareAppPackageGroupAssets = async (outputDir, assets) => {
  const appDir = path.join(root, "dist/apps");
  const info = await exists(appDir);
  if (!info?.isDirectory()) throw new Error("Missing app package directory dist/apps.");

  const appFiles = (await readdir(appDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".snapp"))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const file of appFiles) {
    const source = path.join(appDir, file.name);
    const output = path.join(outputDir, file.name);
    await copyFile(source, output);
    const size = (await stat(output)).size;
    assets.push({ project: "apps", name: file.name, path: path.relative(root, output), size });
    console.log(`[release-assets] Copied ${file.name} (${formatBytes(size)})`);
  }
};

const prepare = async () => {
  const version = getArgValue("--version", process.env.RELEASE_VERSION || "");
  if (!version) throw new Error("Missing release version. Pass --version=<semver>.");

  const outputDir = path.resolve(root, getArgValue("--output", process.env.RELEASE_ASSETS_DIR || "dist/releases"));
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const assets = [];
  const releaseTag =
    process.env.RELEASE_TAG ||
    (project.id === "all" ? `v${version}` : `${project.label}-v${version}`);
  const buildTime = new Date().toISOString();
  console.log(`[release-assets] Project: ${project.id}`);

  for (const unit of project.units) {
    await run(unit.build[0], unit.build[1], {
      ...process.env,
      VITE_RELEASE_TAG: releaseTag,
      VITE_BUILD_TIME: buildTime,
    });
    if (unit.type === "app") await prepareAppAsset(unit, version, outputDir, assets);
    if (unit.type === "app-package") await prepareAppPackageAsset(unit, outputDir, assets);
    if (unit.type === "app-packages") await prepareAppPackageGroupAssets(outputDir, assets);
  }

  const manifest = {
    project: project.id,
    version,
    generatedAt: new Date().toISOString(),
    assets,
  };
  const manifestFile = path.join(outputDir, "release-manifest.json");
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`[release-assets] Prepared ${assets.length + 1} assets in ${path.relative(root, outputDir)}`);
};

const notes = () => {
  const from = getArgValue("--from", "");
  const to = getArgValue("--to", "HEAD") || "HEAD";
  const pathspecs = project.pathspecs || [];
  const range = from ? `${from}..${to}` : to;
  const baseArgs = from
    ? ["log", "--date=short", "--pretty=format:- %s (%h, %ad)", range]
    : ["log", "-n", "40", "--date=short", "--pretty=format:- %s (%h, %ad)", to];
  const commits = git(pathspecs.length ? [...baseArgs, "--", ...pathspecs] : baseArgs);

  console.log(`# ${project.title}`);
  console.log();
  console.log(`Project: ${project.id}`);
  if (from) console.log(`Range: ${range}`);
  if (pathspecs.length) console.log(`Paths: ${pathspecs.join(", ")}`);
  console.log();
  console.log("## Changes");
  console.log(commits || "No changes.");
};

if (command === "prepare") {
  prepare().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else if (command === "notes") {
  notes();
} else {
  console.error("Usage: node scripts/release-assets.mjs <prepare|notes> [--project <name>] [--version <semver>]");
  process.exit(1);
}
