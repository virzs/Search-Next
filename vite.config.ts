import { defineConfig } from 'vite';
import { resolve } from 'path';
import reactRefresh from '@vitejs/plugin-react-refresh';
import vitePluginImp from 'vite-plugin-imp';
import { VitePWA } from 'vite-plugin-pwa';
import mdx from 'vite-plugin-mdx';
import { visualizer } from 'rollup-plugin-visualizer';
import usePluginImport from 'vite-plugin-importer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    VitePWA({}),
    usePluginImport({
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true,
    }),
    usePluginImport({
      libraryName: '@material/core',
      libraryDirectory: 'es',
      style: true,
    }),
    mdx(),
    // build 分析
    visualizer(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8100,
    strictPort: true,
    open: false,
    proxy: {
      '/v1': {
        target: 'http://api.virs.xyz/',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@views': resolve(__dirname, 'src/views'),
    },
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
});
