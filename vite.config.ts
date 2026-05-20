import { defineConfig, loadEnv } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appReactPath = pathResolve("node_modules/react");
const appReactDomPath = pathResolve("node_modules/react-dom");

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = process.env.VITE_API_PROXY_TARGET ?? env.VITE_API_PROXY_TARGET ?? "http://localhost:5151";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 8132,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    css: { postcss: {} },
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: [
        {
          find: /@\//,
          replacement: pathResolve("src") + "/",
        },
        {
          find: "react",
          replacement: appReactPath,
        },
        {
          find: "react/jsx-runtime",
          replacement: resolve(appReactPath, "jsx-runtime.js"),
        },
        {
          find: "react/jsx-dev-runtime",
          replacement: resolve(appReactPath, "jsx-dev-runtime.js"),
        },
        {
          find: "react-dom",
          replacement: appReactDomPath,
        },
        {
          find: "react-dom/client",
          replacement: resolve(appReactDomPath, "client.js"),
        },
      ],
    },
  };
});
