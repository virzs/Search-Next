import { createWriteStream } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import zlib from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv.slice(2).find((arg) => arg !== "--");
const widgetNamePattern = /^[a-z][a-z0-9-]*$/;
const widgetVersionPattern = /^[0-9A-Za-z][0-9A-Za-z._-]*$/;

if (!name) {
  console.error("Usage: node scripts/pack-widget.mjs <widget-name>");
  process.exit(1);
}

if (!widgetNamePattern.test(name)) {
  console.error("Widget name must use kebab-case: letters, numbers, and dashes only.");
  process.exit(1);
}

const widgetsRoot = path.resolve(root, "apps", "widgets");
const buildRoot = path.resolve(root, "dist", "widget-build");
const widgetDir = path.resolve(widgetsRoot, name);
const buildDir = path.resolve(buildRoot, name);
const distDir = path.resolve(root, "dist", "widgets");
const configFile = path.join(widgetDir, "widget.config.json");
const screenshotManifestFile = path.join(buildDir, "screenshots", "manifest.json");
const screenshotScript = path.join(root, "scripts", "capture-widget-screenshots.mjs");

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

const countScreenshotFiles = async () => {
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

const main = async () => {
  assertInside(widgetsRoot, widgetDir, "Widget directory");
  assertInside(buildRoot, buildDir, "Build directory");
  const config = JSON.parse(await readFile(configFile, "utf8"));
  if (!widgetNamePattern.test(String(config.name || ""))) {
    throw new Error("widget.config.json name must use kebab-case.");
  }
  if (!widgetVersionPattern.test(String(config.version || ""))) {
    throw new Error("widget.config.json version contains unsupported characters.");
  }
  await rm(buildDir, { recursive: true, force: true });
  await run("pnpm", ["--filter", `${name}-widget`, "build"], { cwd: root });
  await cp(configFile, path.join(buildDir, "widget.config.json"));
  if (config.supportIconMode !== false && !(await exists(screenshotManifestFile))) {
    console.log("[pack-widget] Missing screenshots manifest; generating icon screenshots before packing.");
    await run(process.execPath, [screenshotScript, name], { cwd: root });
  }
  const output = path.join(distDir, `${config.name}-${config.version}.snwidget`);
  const screenshotCount = await countScreenshotFiles();
  const count = await writeZip(buildDir, output);
  console.log(`Packed ${count} files (${screenshotCount} screenshot files) -> ${output}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
