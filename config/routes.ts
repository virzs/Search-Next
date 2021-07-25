/*
 * @Author: Vir
 * @Date: 2021-03-14 16:09:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-25 00:09:17
 */

interface RouteTypes {
  path: string;
  component: string;
  exact?: boolean;
  routes?: RouteTypes[];
  redirect?: string;
  wrappers?: string[];
  title?: string;
}

export default [
  { path: '/', component: '@/pages/index/index' },
  { path: '/setting', component: '@/pages/setting/index' },
  { path: '/navigation', component: '@/pages/navigation/index' },
] as RouteTypes[];
