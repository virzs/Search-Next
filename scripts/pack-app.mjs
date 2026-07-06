import { createWriteStream } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import zlib from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const all = args.includes("--all");
const name = args.find((arg) => arg !== "--all");
const appNamePattern = /^[a-z][a-z0-9-]*$/;
const appVersionPattern = /^[0-9A-Za-z][0-9A-Za-z._-]*$/;

if ((!all && !name) || (all && name)) {
  console.error("Usage: node scripts/pack-app.mjs <app-name>");
  console.error("   or: node scripts/pack-app.mjs --all");
  process.exit(1);
}

if (name && !appNamePattern.test(name)) {
  console.error("App name must use kebab-case: letters, numbers, and dashes only.");
  process.exit(1);
}

const appsRoot = path.resolve(root, "apps", "apps");
const buildRoot = path.resolve(root, "dist", "app-build");
const distDir = path.resolve(root, "dist", "apps");
const screenshotScript = path.join(root, "scripts", "capture-app-screenshots.mjs");

const assertInside = (parent, child, label) => {
  const relative = path.relative(parent, child);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes expected directory`);
  }
};

const run = (command, args, options) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: "inherit", shell: false, ...options });
  child.on("error", reject);
  child.on("exit", (code) => {
    if (code === 0) resolve();
    else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
  });
});

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
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
  const entries = await readdir(dir);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const info = await stat(full);
    const relative = prefix ? `${prefix}/${entry}` : entry;
    if (info.isDirectory()) files.push(...await collect(full, relative));
    if (info.isFile()) files.push({ full, relative });
  }
  return files;
};

const countScreenshotFiles = async (buildDir) => {
  const screenshotsDir = path.join(buildDir, "screenshots");
  if (!(await exists(screenshotsDir))) return 0;
  const files = await collect(screenshotsDir, "screenshots");
  return files.length;
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

const listAppNames = async () => {
  const entries = await readdir(appsRoot, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const configFile = path.join(appsRoot, entry.name, "app.config.json");
    if (await exists(configFile)) names.push(entry.name);
  }
  return names.sort();
};

const packApp = async (appName) => {
  const appDir = path.resolve(appsRoot, appName);
  const buildDir = path.resolve(buildRoot, appName);
  const configFile = path.join(appDir, "app.config.json");
  const screenshotManifestFile = path.join(buildDir, "screenshots", "manifest.json");

  assertInside(appsRoot, appDir, "App directory");
  assertInside(buildRoot, buildDir, "Build directory");
  const config = JSON.parse(await readFile(configFile, "utf8"));
  if (!appNamePattern.test(String(config.name || ""))) {
    throw new Error("app.config.json name must use kebab-case.");
  }
  if (!appVersionPattern.test(String(config.version || ""))) {
    throw new Error("app.config.json version contains unsupported characters.");
  }
  await rm(buildDir, { recursive: true, force: true });
  await run("pnpm", ["--filter", `${appName}-app`, "build"], { cwd: root });
  await cp(configFile, path.join(buildDir, "app.config.json"));
  if (config.supportIconMode !== false && !(await exists(screenshotManifestFile))) {
    console.log("[pack-app] Missing screenshots manifest; generating icon screenshots before packing.");
    await run(process.execPath, [screenshotScript, appName], { cwd: root });
  }
  const output = path.join(distDir, `${config.name}-${config.version}.snapp`);
  const screenshotCount = await countScreenshotFiles(buildDir);
  const count = await writeZip(buildDir, output);
  console.log(`Packed ${count} files (${screenshotCount} screenshot files) -> ${output}`);
};

const main = async () => {
  if (!all) {
    await packApp(name);
    return;
  }

  const names = await listAppNames();
  if (names.length === 0) throw new Error("No apps found to pack.");
  for (const appName of names) {
    console.log(`\n[pack-app] Packing ${appName}`);
    await packApp(appName);
  }
  console.log(`\n[pack-app] Packed ${names.length} apps.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
