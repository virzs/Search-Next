import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react({ reactRefreshHost: "http://localhost:8132" }), tailwindcss()],
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
      name: "TodoWidget",
      formats: ["esm"],
      fileName: () => "index.js",
    },
    outDir: "../../../dist/widget-build/todo",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
