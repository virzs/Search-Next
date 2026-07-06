import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(root, "../../../dist/app-build/todo");

function copyAppAssets() {
  return {
    name: "copy-app-assets",
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
  plugins: [react({ reactRefreshHost: "http://localhost:8132" }), tailwindcss(), copyAppAssets()],
  server: {
    port: 3003,
    host: true,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env": "{}",
    process: "{}",
  },
  build: {
    lib: {
      entry: "src/index.tsx",
      name: "TodoApp",
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
