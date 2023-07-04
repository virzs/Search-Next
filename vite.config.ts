import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 8100,
    strictPort: true,
    open: false,
    proxy: {
      "/v1": {
        target: "https://api.search.virs.xyz/",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/layouts': resolve(__dirname, 'src/layouts'),
    },
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
});
