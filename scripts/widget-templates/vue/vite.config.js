import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(root, "../../dist/widget-build/__WIDGET_NAME__");

function copyWidgetAssets() {
  return {
    name: "copy-widget-assets",
    closeBundle() {
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      const assets = [
        { src: resolve(root, "src/icon.svg"), dest: resolve(outDir, "icon.svg") },
      ];
      for (const { src, dest } of assets) {
        if (existsSync(src)) copyFileSync(src, dest);
      }
    },
  };
}

export default defineConfig({
  plugins: [vue(), copyWidgetAssets()],
  server: {
    host: true,
  },
  build: {
    lib: {
      entry: "src/index.js",
      name: "__WIDGET_CLASS_NAME__Widget",
      formats: ["esm"],
      fileName: () => "index.js",
    },
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
