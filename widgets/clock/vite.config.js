import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [
    // 使远端小组件复用宿主的 React Refresh 运行时，支持跨应用 HMR
    react({ reactRefreshHost: "http://localhost:8132" }),
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
      entry: "src/index.jsx",
      name: "ClockWidget",
      formats: ["esm"],
      fileName: () => "index.js",
    },
    // 新位置相对项目根目录向上两级
    outDir: "../../public/widgets/clock",
    rollupOptions: {
      // 开发时安装 react 依赖，但库构建时忽略（不打包）
      external: ["react", "react-dom/client", "react/jsx-runtime"],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
