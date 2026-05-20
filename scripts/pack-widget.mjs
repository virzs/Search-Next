import { createWriteStream } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import zlib from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv[2];

if (!name) {
  console.error("Usage: node scripts/pack-widget.mjs <widget-name>");
  process.exit(1);
}

const widgetDir = path.join(root, "widgets", name);
const buildDir = path.join(root, "dist", "widget-build", name);
const distDir = path.join(root, "dist", "widgets");
const configFile = path.join(widgetDir, "widget.config.json");

const run = (command, args, options) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: "inherit", shell: false, ...options });
  child.on("error", reject);
  child.on("exit", (code) => {
    if (code === 0) resolve();
    else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
  });
});

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
  const config = JSON.parse(await readFile(configFile, "utf8"));
  await rm(buildDir, { recursive: true, force: true });
  await run("npm", ["run", "build"], { cwd: widgetDir });
  await cp(configFile, path.join(buildDir, "widget.config.json"));
  const output = path.join(distDir, `${config.name}-${config.version}.snwidget`);
  const count = await writeZip(buildDir, output);
  console.log(`Packed ${count} files -> ${output}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
