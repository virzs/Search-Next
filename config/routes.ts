/*
 * @Author: Vir
 * @Date: 2021-03-14 16:09:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-10 11:09:53
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
] as RouteTypes[];
