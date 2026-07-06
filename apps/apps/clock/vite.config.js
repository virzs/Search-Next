import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { copyFileSync, existsSync, mkdirSync } from "fs";

// 构建完成后将静态资源（图标、配置JSON）复制到输出目录
function copyAppAssets() {
  const outDir = resolve(__dirname, "../../../dist/app-build/clock");
  return {
    name: "copy-app-assets",
    closeBundle() {
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      const assets = [
        { src: resolve(__dirname, "src/icon.svg"), dest: resolve(outDir, "icon.svg") },
        { src: resolve(__dirname, "app.config.json"), dest: resolve(outDir, "app.config.json") },
      ];
      for (const { src, dest } of assets) {
        if (existsSync(src)) {
          copyFileSync(src, dest);
          console.log(`[copy-app-assets] ${src} -> ${dest}`);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react({ reactRefreshHost: "http://localhost:8132" }),
    tailwindcss(),
    copyAppAssets(),
  ],
  server: {
    port: 3002,
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
      name: "ClockApp",
      formats: ["esm"],
      fileName: () => "index.js",
    },
    outDir: "../../../dist/app-build/clock",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
