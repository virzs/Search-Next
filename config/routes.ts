/*
 * @Author: Vir
 * @Date: 2021-03-14 16:09:27
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-14 16:15:16
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

export default [{ path: '/', component: '@/pages/index' }] as RouteTypes[];
