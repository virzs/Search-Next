/*
 * @Author: Vir
 * @Date: 2021-03-14 16:03:24
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-16 11:30:23
 */

import { defineConfig } from 'umi';
import proxy from './proxy';
import routes from './routes';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes,
  proxy,
  locale: {
    default: 'zh-CN',
  },
  dva: {
    immer: true,
    hmr: false,
  },
  fastRefresh: {},
  dynamicImport: {
    loading: '@/components/global/loading',
  },
});
