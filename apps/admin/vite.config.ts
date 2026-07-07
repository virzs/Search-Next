import { defineConfig, loadEnv } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = process.env.VITE_API_PROXY_TARGET ?? env.VITE_API_PROXY_TARGET ?? "http://localhost:5151";

  return {
    plugins: [react()],
    server: {
      port: 8133,
      strictPort: true,
      watch: {
        usePolling: true,
        interval: 100,
      },
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/static": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    envPrefix: ["VITE_"],
    resolve: {
      alias: [
        {
          find: /^~/,
          replacement: pathResolve("node_modules") + "/",
        },
        {
          find: /@\//,
          replacement: pathResolve("src") + "/",
        },
      ],
    },
  };
});
