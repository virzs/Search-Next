import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = path.join(root, "scripts", "widget-templates");
const widgetsDir = path.join(root, "widgets");

const supportedFrameworks = new Set(["react", "vue", "solid"]);
const args = process.argv.slice(2);
const first = (args[0] || "").toLowerCase();
const second = args[1];
const framework = supportedFrameworks.has(first)
  ? first
  : (second || "").toLowerCase();
const name = supportedFrameworks.has(first) ? second : args[0];

const usage = "Usage: npm run widget:create -- <react|vue|solid> <widget-name>";
const namePattern = /^[a-z][a-z0-9-]*$/;

if (!framework || !name) {
  console.error(usage);
  process.exit(1);
}

if (!namePattern.test(name)) {
  console.error("Widget name must use kebab-case: letters, numbers, and dashes only.");
  process.exit(1);
}

const templateDir = path.join(templatesDir, framework);
const targetDir = path.join(widgetsDir, name);

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

const toPascalCase = (value) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const replacements = {
  __WIDGET_NAME__: name,
  __WIDGET_DISPLAY_NAME__: toPascalCase(name),
  __WIDGET_CLASS_NAME__: toPascalCase(name),
  __WIDGET_PACKAGE_NAME__: `${name}-widget`,
};

const render = (content) =>
  Object.entries(replacements).reduce(
    (next, [key, value]) => next.replaceAll(key, value),
    content,
  );

const copyTemplate = async (source, target) => {
  const info = await stat(source);
  if (info.isDirectory()) {
    await mkdir(target, { recursive: true });
    const entries = await readdir(source);
    for (const entry of entries) {
      await copyTemplate(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  const content = await readFile(source, "utf8");
  await writeFile(target, render(content));
};

if (!(await exists(templateDir))) {
  console.error(`Unsupported framework: ${framework}`);
  console.error("Supported frameworks: react, vue, solid");
  console.error(usage);
  process.exit(1);
}

if (await exists(targetDir)) {
  console.error(`Widget already exists: widgets/${name}`);
  process.exit(1);
}

await mkdir(widgetsDir, { recursive: true });
await copyTemplate(templateDir, targetDir);

console.log(`Created widgets/${name} from ${framework} template.`);
console.log(`Next steps:`);
console.log(`  cd widgets/${name}`);
console.log(`  npm install`);
console.log(`  npm run dev`);
console.log(`  npm run build`);
console.log(`  cd ../.. && npm run widget:pack -- ${name}`);
