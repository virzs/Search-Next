const fs = require("node:fs");
const path = require("node:path");

const distPath = path.join(__dirname, "../dist");
const reset = process.argv.includes("--reset");

const removeEmptyDirectories = (directory) => {
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (!stat.isDirectory()) continue;

    removeEmptyDirectories(fullPath);

    if (fs.readdirSync(fullPath).length === 0) {
      fs.rmdirSync(fullPath);
      console.log(`Removed empty directory: ${fullPath}`);
    }
  }
};

const removeDTSFiles = (directory) => {
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      removeDTSFiles(fullPath);
    } else if (item.endsWith(".d.ts")) {
      fs.unlinkSync(fullPath);
      console.log(`Removed .d.ts file: ${fullPath}`);
    }
  }
};

if (reset) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log("Dist directory reset successfully!");
} else if (fs.existsSync(distPath)) {
  console.log("Cleaning dist directory...");
  removeDTSFiles(distPath);
  removeEmptyDirectories(distPath);
  console.log("Dist directory cleaned successfully!");
} else {
  console.log("Dist directory does not exist!");
}
