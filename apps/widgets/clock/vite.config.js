import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { copyFileSync, existsSync, mkdirSync } from "fs";

// 构建完成后将静态资源（图标、配置JSON）复制到输出目录
function copyWidgetAssets() {
  const outDir = resolve(__dirname, "../../../dist/widget-build/clock");
  return {
    name: "copy-widget-assets",
    closeBundle() {
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      const assets = [
        { src: resolve(__dirname, "src/icon.svg"), dest: resolve(outDir, "icon.svg") },
        { src: resolve(__dirname, "widget.config.json"), dest: resolve(outDir, "widget.config.json") },
      ];
      for (const { src, dest } of assets) {
        if (existsSync(src)) {
          copyFileSync(src, dest);
          console.log(`[copy-widget-assets] ${src} -> ${dest}`);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react({ reactRefreshHost: "http://localhost:8132" }),
    tailwindcss(),
    copyWidgetAssets(),
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
      name: "ClockWidget",
      formats: ["esm"],
      fileName: () => "index.js",
    },
    outDir: "../../../dist/widget-build/clock",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
