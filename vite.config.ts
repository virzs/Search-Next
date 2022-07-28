/*
 * @Author: vir virs98@outlook.com
 * @Date: 2021-09-23 11:14:38
 * @LastEditors: vir virs98@outlook.com
 * @LastEditTime: 2022-07-28 09:39:40
 */
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import mdx from 'vite-plugin-mdx';
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react';
import vitePluginImp from 'vite-plugin-imp';
import viteSentry from 'vite-plugin-sentry';
import packageData from './package.json';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({}),
    mdx(),
    // build 分析
    // @ts-ignore
    visualizer(),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style: (name) => `antd/es/${name}/style/index.less`,
        },
      ],
    }),
    viteSentry({
      authToken: process.env?.SENTRY_TOKEN,
      org: process.env?.SENTRY_ORG,
      project: process.env?.SENTRY_PROJECT,
      release: packageData.version,
      deploy: {
        env: 'production',
      },
      setCommits: {
        auto: true,
      },
      sourceMaps: {
        include: ['./dist/assets'],
        ignore: ['node_modules'],
        urlPrefix: '~/assets',
      },
    }),
    createSvgIconsPlugin({
      iconDirs: [
        // 和风天气 icon 图标
        path.resolve(process.cwd(), 'node_modules/qweather-icons/icons'),
        // icons8 网站下载的 windows 11 Color 风格图标
        path.resolve(
          process.cwd(),
          'src/assets/svg/icons/icons8/windows11Color',
        ),
      ],
      symbolId: 'icon-[name]',
    }),
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
        target: 'https://api.search.virs.xyz/',
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
  build: {
    sourcemap: true,
  },
});
