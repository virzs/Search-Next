import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(root, "../../../dist/app-build/mind-map");
function copyAppAssets() { return { name: "copy-app-assets", closeBundle() { if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true }); copyFileSync(resolve(root, "src/icon.svg"), resolve(outDir, "icon.svg")); } }; }

export default defineConfig({
  plugins: [react({ reactRefreshHost: "http://localhost:8133" }), tailwindcss(), copyAppAssets()],
  server: { host: true },
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}", process: "{}" },
  resolve: { alias: { "@": resolve(root, "src") } },
  build: { lib: { entry: "src/index.tsx", name: "MindMapApp", formats: ["esm"], fileName: () => "index.js" }, outDir, emptyOutDir: true, rollupOptions: { output: { inlineDynamicImports: true } } },
});
