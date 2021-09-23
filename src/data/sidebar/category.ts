/*
 * @Author: Vir
 * @Date: 2021-03-19 17:38:43
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-19 17:47:08
 */

export interface SideBarCategoryValueTypes {
  id: string;
  name: string;
  value: string;
  icon: string;
  color: string;
  isShow: boolean;
}

export default [
  {
    id: 'eef259f64ae34b48b3cc2f30a846b58e',
    name: '书签',
    value: 'Website',
    icon: 'fa fa-tags',
    color: '#1B813E',
    isShow: true,
  },
  {
    id: 'd90f4c20f31f4b5382ecf9fd9cadc51e',
    name: '待办',
    value: 'ToDo',
    icon: 'fa fa-star',
    color: '#FFB11B',
    isShow: true,
  },
  {
    id: 'f64a7d883c0b4e749b256d645d5134ba',
    name: '设置',
    value: 'Setting',
    icon: 'fa fa-cog',
    color: '#43341B',
    isShow: true,
  },
] as SideBarCategoryValueTypes[];
