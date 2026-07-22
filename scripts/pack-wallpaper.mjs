import { createWriteStream } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const all = args.includes("--all");
const name = args.find((arg) => arg !== "--all");
const wallpaperNamePattern = /^[a-z][a-z0-9-]*$/;
const wallpaperVersionPattern = /^[0-9A-Za-z][0-9A-Za-z._-]*$/;
const allowedExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".map",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".ico",
  ".avif",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".mp4",
  ".webm",
  ".mp3",
  ".ogg",
  ".wav",
  ".wasm",
]);

if ((!all && !name) || (all && name)) {
  console.error("Usage: node scripts/pack-wallpaper.mjs <wallpaper-name>");
  console.error("   or: node scripts/pack-wallpaper.mjs --all");
  process.exit(1);
}

if (name && !wallpaperNamePattern.test(name)) {
  console.error(
    "Wallpaper name must use kebab-case: letters, numbers, and dashes only.",
  );
  process.exit(1);
}

const wallpapersRoot = path.resolve(root, "apps", "wallpapers");
const buildRoot = path.resolve(root, "dist", "wallpaper-build");
const distDir = path.resolve(root, "dist", "wallpapers");

const assertInside = (parent, child, label) => {
  const relative = path.relative(parent, child);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes expected directory`);
  }
};

const exists = async (file) => {
  try {
    return await stat(file);
  } catch {
    return null;
  }
};

const normalizeRelativePath = (value) =>
  String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");

const assertSafeRelativePath = (value, label) => {
  const normalized = normalizeRelativePath(value);
  const segments = normalized.split("/");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    /^[A-Za-z]:\//.test(normalized) ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(`${label} must be a safe relative path: ${value}`);
  }
  return normalized;
};

const crcTable = new Uint32Array(256).map((_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const collect = async (dir, prefix = "") => {
  const entries = await readdir(dir);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const info = await stat(full);
    const relative = prefix ? `${prefix}/${entry}` : entry;
    if (info.isDirectory()) files.push(...(await collect(full, relative)));
    if (info.isFile()) files.push({ full, relative, size: info.size });
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

    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(20, 4);
    directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0, 8);
    directory.writeUInt16LE(8, 10);
    directory.writeUInt32LE(0, 12);
    directory.writeUInt32LE(crc, 16);
    directory.writeUInt32LE(compressed.length, 20);
    directory.writeUInt32LE(data.length, 24);
    directory.writeUInt16LE(nameBuffer.length, 28);
    directory.writeUInt16LE(0, 30);
    directory.writeUInt16LE(0, 32);
    directory.writeUInt16LE(0, 34);
    directory.writeUInt16LE(0, 36);
    directory.writeUInt32LE(0, 38);
    directory.writeUInt32LE(offset, 42);
    central.push(directory, nameBuffer);
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
  return files;
};

const listWallpaperNames = async () => {
  const entries = await readdir(wallpapersRoot, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const configFile = path.join(
      wallpapersRoot,
      entry.name,
      "wallpaper.config.json",
    );
    if (await exists(configFile)) names.push(entry.name);
  }
  return names.sort();
};

const validateBuildFiles = (files, config) => {
  if (files.length > 500)
    throw new Error("Wallpaper package exceeds 500 files.");
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 80 * 1024 * 1024) {
    throw new Error("Wallpaper package exceeds 80MB uncompressed.");
  }
  const htmlFiles = files.filter(
    (file) => path.extname(file.relative).toLowerCase() === ".html",
  );
  if (htmlFiles.length !== 1 || htmlFiles[0].relative !== config.entry) {
    throw new Error("Wallpaper package must contain exactly one HTML entry.");
  }
  for (const file of files) {
    const extension = path.extname(file.relative).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      throw new Error(`Unsupported wallpaper package file: ${file.relative}`);
    }
  }
};

const packWallpaper = async (wallpaperName) => {
  const wallpaperDir = path.resolve(wallpapersRoot, wallpaperName);
  const buildDir = path.resolve(buildRoot, wallpaperName);
  const configFile = path.join(wallpaperDir, "wallpaper.config.json");
  assertInside(wallpapersRoot, wallpaperDir, "Wallpaper directory");
  assertInside(buildRoot, buildDir, "Build directory");

  const config = JSON.parse(await readFile(configFile, "utf8"));
  if (!wallpaperNamePattern.test(String(config.name || ""))) {
    throw new Error("wallpaper.config.json name must use kebab-case.");
  }
  if (!wallpaperVersionPattern.test(String(config.version || ""))) {
    throw new Error(
      "wallpaper.config.json version contains unsupported characters.",
    );
  }
  if (config.schemaVersion !== 1) {
    throw new Error("wallpaper.config.json schemaVersion must be 1.");
  }

  const entry = assertSafeRelativePath(config.entry, "entry");
  const preview = assertSafeRelativePath(config.preview, "preview");
  const packageFiles = Array.isArray(config.packageFiles)
    ? config.packageFiles
    : [];
  const includes = new Set([entry, preview]);
  for (const item of packageFiles) {
    includes.add(assertSafeRelativePath(item, "packageFiles item"));
  }

  await rm(buildDir, { recursive: true, force: true });
  await mkdir(buildDir, { recursive: true });
  await cp(configFile, path.join(buildDir, "wallpaper.config.json"));
  for (const relative of includes) {
    const source = path.resolve(wallpaperDir, relative);
    assertInside(wallpaperDir, source, "Wallpaper package source");
    if (!(await exists(source))) {
      throw new Error(`Missing wallpaper package source: ${relative}`);
    }
    const target = path.resolve(buildDir, relative);
    assertInside(buildDir, target, "Wallpaper build target");
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, { recursive: true });
  }

  const buildFiles = await collect(buildDir);
  validateBuildFiles(buildFiles, { ...config, entry });
  const output = path.join(distDir, `${config.name}-${config.version}.snwall`);
  const files = await writeZip(buildDir, output);
  const packageInfo = await stat(output);
  if (packageInfo.size > 30 * 1024 * 1024) {
    throw new Error("Wallpaper package exceeds 30MB compressed.");
  }
  console.log(`Packed ${files.length} files -> ${output}`);
};

const main = async () => {
  if (!all) {
    await packWallpaper(name);
    return;
  }
  const names = await listWallpaperNames();
  if (names.length === 0) throw new Error("No wallpapers found to pack.");
  for (const wallpaperName of names) {
    console.log(`\n[pack-wallpaper] Packing ${wallpaperName}`);
    await packWallpaper(wallpaperName);
  }
  console.log(`\n[pack-wallpaper] Packed ${names.length} wallpapers.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
