import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const name = args.find((arg) => !arg.startsWith("--"));
const force = args.includes("--force");
const appNamePattern = /^[a-z][a-z0-9-]*$/;
const themes = ["light", "dark"];

if (!name) {
  console.error("Usage: node scripts/capture-app-screenshots.mjs <app-name> [--force]");
  process.exit(1);
}

if (!appNamePattern.test(name)) {
  console.error("App name must use kebab-case: letters, numbers, and dashes only.");
  process.exit(1);
}

if (["0", "false", "off"].includes(String(process.env.APP_SCREENSHOTS || "").toLowerCase()) && !force) {
  console.log("[app-screenshots] Skipped because APP_SCREENSHOTS is disabled.");
  process.exit(0);
}

const appsRoot = path.resolve(root, "apps", "apps");
const buildRoot = path.resolve(root, "dist", "app-build");
const appDir = path.resolve(appsRoot, name);
const buildDir = path.resolve(buildRoot, name);
const configFile = path.join(appDir, "app.config.json");
const entryFile = path.join(buildDir, "index.js");
const screenshotDir = path.join(buildDir, "screenshots", "icon");
const tempDir = path.join(root, "node_modules", ".cache", "app-screenshots", name);

const assertInside = (parent, child, label) => {
  const relative = path.relative(parent, child);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes expected directory`);
  }
};

const fileExists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

const getPreviewSize = ({ row, col }) => ({
  width: col <= 1 ? 64 : 112 * col - 50,
  height: row <= 1 ? 64 : 110 * row - 46,
});

const sanitizeSegment = (value) =>
  String(value || "preview")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "preview";

const shellWhich = (command) => {
  const result = spawnSync("which", [command], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim().split("\n")[0] : "";
};

const findChrome = () => {
  if (process.env.APP_SCREENSHOT_CHROME) return process.env.APP_SCREENSHOT_CHROME;
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    shellWhich("google-chrome"),
    shellWhich("chromium"),
    shellWhich("chromium-browser"),
    shellWhich("chrome"),
    shellWhich("msedge"),
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
};

const run = (command, runArgs) => new Promise((resolve, reject) => {
  const child = spawn(command, runArgs, { stdio: ["ignore", "pipe", "pipe"], shell: false });
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  child.on("error", reject);
  child.on("exit", (code, signal) => {
    if (code === 0) resolve();
    else {
      const reason = code === null
        ? `was terminated${signal ? ` by ${signal}` : ""}`
        : `exited with ${code}`;
      reject(new Error(`${path.basename(command)} ${reason}${stderr ? `\n${stderr}` : ""}`));
    }
  });
});

const createPreviewHtml = ({ config, entryUrl, size, sizeId, themeId, width, height }) => {
  const defaults = Object.fromEntries(
    (config.settingsSchema || []).map((field) => [field.key, field.default ?? null]),
  );
  const title = config.displayNameI18n?.["zh-CN"] || config.displayName || config.name;
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${width}, initial-scale=1" />
    <style>
      html, body, #root {
        width: ${width}px;
        height: ${height}px;
        margin: 0;
        overflow: hidden;
        background: transparent;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import * as appModule from ${JSON.stringify(entryUrl)};

      const config = ${JSON.stringify(config)};
      const defaults = ${JSON.stringify(defaults)};
      const storage = new Map(Object.entries(defaults));
      const noop = () => undefined;
      const locale = { language: "zh-CN", direction: "ltr" };
      const mount = appModule.mount || appModule.default;
      const sdk = {
        appId: ${JSON.stringify(`screenshot-${sizeId}-${themeId}`)},
        mode: "icon",
        sizeId: ${JSON.stringify(sizeId)},
        size: ${JSON.stringify(size)},
        config,
        theme: { activeThemeId: ${JSON.stringify(themeId)} },
        locale,
        getLocale: () => locale,
        onLocaleChange: () => noop,
        storage: {
          get: (key) => Promise.resolve(storage.has(key) ? storage.get(key) : null),
          set: (key, value) => {
            storage.set(key, value);
            return Promise.resolve();
          },
          getItem: (key) => storage.has(key) ? String(storage.get(key)) : null,
          setItem: (key, value) => storage.set(key, value),
          removeItem: (key) => storage.delete(key),
        },
        events: {
          on: () => noop,
          off: noop,
          emit: noop,
        },
        toast: {
          success: noop,
          error: noop,
          info: noop,
          warning: noop,
        },
        api: {},
        navigate: noop,
        onThemeChange: () => noop,
      };

      if (typeof mount !== "function") {
        throw new Error("App module does not export mount");
      }

      mount(document.getElementById("root"), {
        mode: "icon",
        title: ${JSON.stringify(title)},
        sdk,
      });
      window.__APP_SCREENSHOT_READY__ = true;
    </script>
  </body>
</html>`;
};

const main = async () => {
  assertInside(appsRoot, appDir, "App directory");
  assertInside(buildRoot, buildDir, "Build directory");

  if (!(await fileExists(entryFile))) {
    throw new Error(`Missing built app entry: ${path.relative(root, entryFile)}. Run the app build first.`);
  }

  const chrome = findChrome();
  if (!chrome) {
    throw new Error("Unable to find Chrome/Chromium. Set APP_SCREENSHOT_CHROME to a browser executable, or set APP_SCREENSHOTS=0 to skip screenshots.");
  }

  const config = JSON.parse(await readFile(configFile, "utf8"));
  if (config.supportIconMode === false) {
    console.log(`[app-screenshots] ${name} does not support icon mode; skipped.`);
    return;
  }

  const sizeConfigs = Array.isArray(config.sizeConfigs) && config.sizeConfigs.length
    ? config.sizeConfigs
    : [{ id: config.defaultSizeId || "1x1", name: config.defaultSizeId || "1x1", row: 1, col: 1 }];
  const entryUrl = pathToFileURL(entryFile).href;
  const captures = [];

  await rm(screenshotDir, { recursive: true, force: true });
  await rm(tempDir, { recursive: true, force: true });
  await mkdir(screenshotDir, { recursive: true });
  await mkdir(tempDir, { recursive: true });

  try {
    for (const themeId of themes) {
      for (const size of sizeConfigs) {
        const sizeId = String(size.id || `${size.col}x${size.row}`);
        const { width, height } = getPreviewSize(size);
        const baseName = `icon-${sanitizeSegment(sizeId)}-${themeId}`;
        const htmlFile = path.join(tempDir, `${baseName}.html`);
        const outputFile = path.join(screenshotDir, `${baseName}.png`);
        const html = createPreviewHtml({ config, entryUrl, size, sizeId, themeId, width, height });
        await writeFile(htmlFile, html);
        await run(chrome, [
          "--headless=new",
          "--disable-gpu",
          "--no-sandbox",
          "--hide-scrollbars",
          "--allow-file-access-from-files",
          "--force-device-scale-factor=1",
          "--default-background-color=00000000",
          `--window-size=${width},${height}`,
          "--virtual-time-budget=1500",
          `--screenshot=${outputFile}`,
          pathToFileURL(htmlFile).href,
        ]);
        captures.push({
          mode: "icon",
          themeId,
          sizeId,
          width,
          height,
          file: path.relative(buildDir, outputFile),
        });
      }
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }

  await writeFile(
    path.join(buildDir, "screenshots", "manifest.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), app: config.name || name, captures }, null, 2)}\n`,
  );
  console.log(`[app-screenshots] Generated ${captures.length} icon screenshots -> ${path.relative(root, screenshotDir)}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
