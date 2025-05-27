import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8132,
    proxy: {
      "/api": {
        target: "http://localhost:5151",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  css: { postcss: {} },
  resolve: {
    alias: [
      {
        find: /@\//,
        replacement: pathResolve("src") + "/",
      },
    ],
  },
});
